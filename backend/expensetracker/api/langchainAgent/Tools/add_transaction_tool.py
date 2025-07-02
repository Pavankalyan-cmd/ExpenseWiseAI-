import os
import uuid
import requests
import json
import re
from datetime import datetime, timedelta, date
from langchain_core.tools import tool
from api.langchainAgent.context import get_current_user_info
from fuzzywuzzy import fuzz
from api.langchainAgent.context import get_current_user_info

# BASE_URL = os.getenv("BACKEND_API_BASE_URL", "http://localhost:8000/")
BASE_URL="http://localhost:8000/"

VALID_TAGS = [
    "Salary", "Business", "Investment", "Other",
    "Transportation", "Utilities", "Entertainment",
    "Medical", "Food", "Others"
]

CATEGORIES = {
    "Food": ["food", "grocery", "supermarket", "bigbazaar", "reliance"],
    "Entertainment": ["movie", "cinema", "netflix", "hotstar", "game", "theater"],
    "Transportation": ["bus", "taxi", "uber", "ola", "train", "fuel", "petrol"],
    "Utilities": ["electricity", "water bill", "gas", "internet", "wifi"],
    "Medical": ["hospital", "doctor", "medicine", "pharmacy"],
    "Salary": ["salary", "paycheck", "monthly pay"],
    "Business": ["business", "client", "deal", "sale"],
    "Investment": ["investment", "dividend", "stock", "mutual fund", "sip"],
    "Other": ["freelance", "consulting", "misc"],
    "Others": ["other", "random", "unknown", "misc"]
}

def generate_unique_id():
    return str(uuid.uuid4())

def auto_categorize(text: str, threshold: int = 85) -> tuple[str, int]:
    text_lower = text.lower()
    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category, 100

    best_score = 0
    best_category = "Others"
    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            score = fuzz.partial_ratio(text_lower, keyword)
            if score > best_score:
                best_score = score
                best_category = category

    return (best_category if best_score >= threshold else "Others", best_score)

@tool
def add_transaction(input: str) -> str:
    """
    Adds either an expense or an income entry for a user.

    Expects input as a JSON string with:
    - 'transaction_type': 'expense' or 'income'
    - 'user_id': string
    - 'title': string
    - 'amount': number
    - 'tag': optional
    - 'date': 'YYYY-MM-DD'
    - Optionally: 'paymentmethod', 'description'

    Or a natural language input like:
    - "I spent 6000 on food items on 2025-05-25."
    - "I spent 5000 on groceries yesterday."
    """
    user_id, auth_token = get_current_user_info()
    data = {}
    transaction_type = None

    try:
        data = json.loads(input)
        transaction_type = data.get("transaction_type")
        if transaction_type not in ["expense", "income"]:
            return " JSON input: 'transaction_type' must be 'expense' or 'income'."
    except json.JSONDecodeError:
        input_lower = input.lower()
        if any(word in input_lower for word in ["spent", "paid", "bought"]):
            transaction_type = "expenses"
        elif any(word in input_lower for word in ["received", "earned", "salary"]):
            transaction_type = "income"
        else:
            return " Could not determine transaction_type. Please include 'spent' or 'received'."
        #   i spend 6k in groceries today

        currentdate = ""

        #   
        try:
            amount_match = re.search(r"(\d+(\.\d+)?)", input_lower)
            amount = float(amount_match.group()) if amount_match else 0

            # Handle natural language dates
            if "yesterday" in input_lower:
                date_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            elif "today" in input_lower:
                date_str = datetime.now().strftime("%Y-%m-%d")
            elif "tomorrow" in input_lower:
                date_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            elif "last week" in input_lower:
                date_str = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
            elif "last month" in input_lower:
                date_str = (datetime.now().replace(day=1) - timedelta(days=1)).replace(day=1).strftime("%Y-%m-%d")
            else:
                date_match = re.search(r"\d{4}-\d{2}-\d{2}", input)
                date_str = date_match.group() if date_match else datetime.now().strftime("%Y-%m-%d")

            title_match = re.search(r"(?:for|on)\s+([\w\s]+)", input_lower)
            title = title_match.group(1).strip().title() if title_match else "General Transaction"

            for word in ["yesterday", "today", "tomorrow", "last week", "last month"]:
                title = title.replace(word, "").strip()

            tag, confidence = auto_categorize(title)
            if tag not in VALID_TAGS:
                tag = "Others"

            data = {
                "transaction_type": transaction_type,
                "user_id": user_id,
                "title": title,
                "amount": amount,
                "tag": tag,
                "date": date_str,
                "paymentmethod": "Not specified",
                "description": ""
            }
        except Exception as e:
            return f" Failed to parse natural language input. {str(e)}"

    required_fields = ["user_id", "title", "amount", "date"]
    if any(field not in data for field in required_fields):
        return " Missing required fields."

    try:
        data["amount"] = float(data["amount"])
        if data["amount"] <= 0:
            return " Amount must be a positive number."
    except:
        return " Invalid amount."

    try:
        parsed_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        if parsed_date > date.today():
            return " Date cannot be in the future."
    except:
        return " Date must be in YYYY-MM-DD format."

    tag = data.get("tag")
    if not tag or tag == "Uncategorized" or tag not in VALID_TAGS:
        tag, confidence = auto_categorize(data["title"])
        if tag not in VALID_TAGS:
            tag = "Others"
        data["tag"] = tag

    payload = {
        "Id": generate_unique_id(),
        "User": user_id,
        "Title": data["title"],
        "Amount": data["amount"],
        "Tag": data["tag"],
        "Type": transaction_type.capitalize(),
        "Date": data["date"],
        "Paymentmethod": data.get("paymentmethod", "Not specified"),
        "Description": data.get("description", "")
    }
    if not user_id or not auth_token:
        return " Cannot fetch insights. Missing user context or auth token."

    headers = {"Authorization": f"Bearer {auth_token}"}


    endpoint = "expenses/add/" if transaction_type == "expenses" else "income/add/"
    try:
        response = requests.post(f"{BASE_URL}/{endpoint}", headers=headers,json=payload, timeout=30)
        response.raise_for_status()
        return f"✅ {transaction_type.capitalize()} added successfully."
    except requests.exceptions.RequestException as e:
        return f" Failed to add {transaction_type}: {str(e)}"
