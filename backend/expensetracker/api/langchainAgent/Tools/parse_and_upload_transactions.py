from langchain_core.tools import tool
from api.langchainAgent.context import get_current_user_info
from PyPDF2 import PdfReader
from pymongo import MongoClient
import requests
import os
import uuid
import re
from datetime import datetime
from fuzzywuzzy import fuzz

# Load BASE_URL from environment variable
BASE_URL = os.environ.get("BACKEND_BASE_URL", "http://localhost:8000")

# MongoDB Atlas setup
mongo_client = MongoClient(os.environ.get("MONGO_URI"))
db = mongo_client["expensestracker"]
temp_collection = db["temp_transactions"]

VALID_TAGS = {
    "Groceries", "Rent", "Transport", "Dining", "Salary",
    "Utilities", "Shopping", "Transfer", "Other"
}

CATEGORIES = {
    "Food": ["food", "grocery", "supermarket", "bazaar", "reliance"],
    "Entertainment": ["movie", "netflix", "game", "hotstar"],
    "Transportation": ["petrol", "transport", "bus", "metro", "fuel"],
    "Utilities": ["electricity", "wifi", "internet", "gas"],
    "Medical": ["hospital", "doctor", "pharmacy"],
    "Salary": ["salary", "credited"],
    "Business": ["client", "deal"],
    "Investment": ["dividend", "sip"],
    "Other": ["freelance", "misc"],
    "Others": ["other", "random"]
}

def generate_unique_id():
    return str(uuid.uuid4())

def auto_categorize(text: str, threshold: int = 85) -> str:
    text_lower = text.lower()
    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category
    best_score = 0
    best_category = "Others"
    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            score = fuzz.partial_ratio(text_lower, keyword)
            if score > best_score:
                best_score = score
                best_category = category
    return best_category if best_score >= threshold else "Others"

def parse_text_to_transactions(text, user_id: str):
    transactions = []
    iob_pattern = re.compile(
        r"(\d{2}-\d{2}-\d{4}).*?UPI/.*?/(DR|CR)/(.+?)(?:\n|/)[A-Z]{2,3}/.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)"
    )
    paytm_pattern = re.compile(
        r"(\d{2} \w{3} \d{4}).*?(Money (?:Sent|Received) using UPI).*?Rs\.([\d,]+\.\d{2})"
    )
    for match in iob_pattern.finditer(text):
        try:
            date_str, dr_cr, title, amount_str = match.groups()
            date = datetime.strptime(date_str.strip(), "%d-%m-%Y").date().isoformat()
            transaction_type = "Expenses" if dr_cr == "DR" else "Income"
            amount = float(amount_str.replace(",", ""))
            transactions.append({
                "Id": generate_unique_id(),
                "User": user_id,
                "Title": title.strip().replace("\n", " "),
                "Amount": amount,
                "Tag": auto_categorize(title),
                "Type": transaction_type,
                "Date": date,
                "Paymentmethod": "Not specified",
                "Description": ""
            })
        except Exception as e:
            print(f"IOB Parse Error: {e}")

    for match in paytm_pattern.finditer(text):
        try:
            date_str, direction, amount_str = match.groups()
            date = datetime.strptime(date_str.strip(), "%d %b %Y").date().isoformat()
            transaction_type = "Income" if "Received" in direction else "Expenses"
            amount = float(amount_str.replace(",", ""))
            transactions.append({
                "Id": generate_unique_id(),
                "User": user_id,
                "Title": direction.strip(),
                "Amount": amount,
                "Tag": auto_categorize(direction),
                "Type": transaction_type,
                "Date": date,
                "Paymentmethod": "Not specified",
                "Description": ""
            })
        except Exception as e:
            print(f"Paytm Parse Error: {e}")
    return transactions

def extract_text_from_pdf(pdf_path, password):
    if not os.path.exists(pdf_path):
        return None
    try:
        reader = PdfReader(pdf_path)
        if reader.is_encrypted and not reader.decrypt(password):
            return None
        return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    except Exception as e:
        print(f"PDF Read Error: {e}")
        return None

def upload_transaction(user_id, auth_token, transaction):
    endpoint = "expenses/add/" if transaction["Type"] == "Expenses" else "income/add/"
    headers = {"Authorization": f"Bearer {auth_token}"}
    try:
        response = requests.post(f"{BASE_URL}/{endpoint}", headers=headers, json=transaction)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Upload failed for {transaction['Title']}: {e}")
        return False

@tool
def parse_and_upload_transactions(file_path: str, file_type: str, pdf_password: str = "") -> str:
    """
    Parses a PDF bank statement and shows extracted transactions for user confirmation.

    The transactions are temporarily stored in MongoDB under the user's ID until the user confirms.
    """

    user_id, auth_token = get_current_user_info()
    if not user_id or not auth_token:
        return "Cannot fetch user context or auth token."
    if not os.path.exists(file_path):
        return "File not found."
    if file_type.lower() != "pdf":
        return "Only PDF is supported."
    if not pdf_password:
        return "PDF password is required."

    text = extract_text_from_pdf(file_path, pdf_password)
    if not text:
        return "Failed to extract text. Check password or file format."

    transactions = parse_text_to_transactions(text, user_id)
    if not transactions:
        return "No transactions found."

    temp_collection.update_one(
        {"_id": user_id},
        {"$set": {"transactions": transactions}},
        upsert=True
    )

    preview = "\n".join(
        [f"{t['Date']} | {t['Type']} ₹{t['Amount']} - {t['Title']} ({t['Tag']})"
         for t in transactions[:5]]
    )
    preview += f"\n\nTotal transactions detected: {len(transactions)}.\n"
    preview += "Do you want to upload these to your account? (yes/no)"
    return preview

@tool
def confirm_transaction_upload(confirm: str) -> str:
    """
    Uploads transactions stored in MongoDB after user confirmation.

    Args:
    - confirm: 'yes' to upload, 'no' to discard the stored transactions.
    """

    user_id, auth_token = get_current_user_info()
    if not user_id or not auth_token:
        return "Missing user info or token."

    doc = temp_collection.find_one({"_id": user_id})
    if not doc or "transactions" not in doc:
        return "No transactions to upload. Run extraction tool first."

    if confirm.lower() != "yes":
        temp_collection.delete_one({"_id": user_id})
        return "Upload cancelled. No data was saved."

    transactions = doc["transactions"]
    uploaded = 0
    for tx in transactions:
        if upload_transaction(user_id, auth_token, tx):
            uploaded += 1

    temp_collection.delete_one({"_id": user_id})
    return f"Uploaded {uploaded} of {len(transactions)} transactions."
