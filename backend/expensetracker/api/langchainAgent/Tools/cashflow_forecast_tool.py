from langchain_core.tools import tool
from api.langchainAgent.context import get_current_user_info
import requests
from datetime import datetime
import pandas as pd
from sklearn.linear_model import LinearRegression
import os

BASE_URL = os.getenv("BACKEND_API_BASE_URL", "http://localhost:8000/")

def fetch_transactions(user_id, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    all_transactions = []

    # Fetch expenses
    try:
        res = requests.get(f"{BASE_URL}/expenses/{user_id}/", headers=headers, timeout=10)
        res.raise_for_status()
        for item in res.json():
            item["Type"] = "Expenses"
            all_transactions.append(item)
    except Exception as e:
        print(f"[ERROR] Failed to fetch expenses: {e}")

    # Fetch incomes
    try:
        res = requests.get(f"{BASE_URL}/incomes/{user_id}/", headers=headers, timeout=10)
        res.raise_for_status()
        for item in res.json():
            item["Type"] = "Income"
            all_transactions.append(item)
    except Exception as e:
        print(f"[ERROR] Failed to fetch incomes: {e}")
    
    return all_transactions

def prepare_monthly_summary(transactions, months_back=2):
    if not transactions:
        raise ValueError("No transaction data available.")
    
    df = pd.DataFrame(transactions)
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    df = df.dropna(subset=['Date'])
    df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce').fillna(0)
    df['YearMonth'] = df['Date'].dt.to_period('M')

    # Take only the last N months of data
    max_month = df['YearMonth'].max()
    recent_months = pd.period_range(end=max_month, periods=months_back, freq='M')
    df = df[df['YearMonth'].isin(recent_months)]

    # Group and unstack
    grouped = df.groupby(['YearMonth', 'Type'])['Amount'].sum().unstack(fill_value=0)

    # Ensure all required columns are present
    for col in ['Income', 'Expenses']:
        if col not in grouped.columns:
            grouped[col] = 0

    grouped['Savings'] = grouped['Income'] - grouped['Expenses']
    grouped = grouped.sort_index()
    return grouped.reset_index()

def forecast_next_months(dataframe, months_ahead=1):
    if dataframe.empty:
        raise ValueError("No historical data to forecast.")

    df = dataframe.copy()
    df['MonthIndex'] = range(len(df))
    result = {}

    for column in ['Income', 'Expenses', 'Savings']:
        X = df[['MonthIndex']]
        y = df[column]
        model = LinearRegression().fit(X, y)

        future_indexes = [[i] for i in range(len(df), len(df) + months_ahead)]
        forecast = model.predict(future_indexes)
        result[column] = [round(max(0, val), 2) for val in forecast]

    future_months = pd.date_range(
        start=df['YearMonth'].iloc[-1].to_timestamp(), 
        periods=months_ahead + 1, 
        freq='MS'
    )[1:]

    return {
        str(month.date()): {
            "Predicted Income": result.get("Income", [0]*months_ahead)[i],
            "Predicted Expenses": result.get("Expenses", [0]*months_ahead)[i],
            "Predicted Savings": result.get("Savings", [0]*months_ahead)[i],
        }
        for i, month in enumerate(future_months)
    }

@tool
def cashflow_forecast_tool(months: int = 1) -> str:
    """
    Forecast income, expenses, and savings using the last 2 months of data.
    Args:
    - months: How many months ahead to predict (default = 1)
    """
    user_id, auth_token = get_current_user_info()
    if not user_id or not auth_token:
        return "User context or token missing."

    try:
        transactions = fetch_transactions(user_id, auth_token)
        if not transactions:
            return "No transactions found to forecast."

        monthly_summary = prepare_monthly_summary(transactions, months_back=2)
        forecast = forecast_next_months(monthly_summary, months)

        return "\n".join(
            [f"{month}: Income ₹{vals['Predicted Income']}, Expenses ₹{vals['Predicted Expenses']}, Savings ₹{vals['Predicted Savings']}"
             for month, vals in forecast.items()]
        )
    except Exception as e:
        return f"Forecasting failed: {e}"
