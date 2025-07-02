
<p align="center">
  <img src="https://i.postimg.cc/FKgCVr7d/Chat-GPT-Image-Jun-28-2025-02-29-28-PM.png" alt="ExpenseWise Banner" width="30%" height="30%" />
</p>




# 💰 ExpenseWise – AI-Powered Personal Finance Dashboard

![Built with React](https://img.shields.io/badge/Built%20with-React-blue?logo=react)
![Backend: Django](https://img.shields.io/badge/Backend-Django-green?logo=django)
![LangChain](https://img.shields.io/badge/AI-LangChain-ff69b4?logo=openai)
![Deployed on Azure](https://img.shields.io/badge/Deployed%20on-Azure-blue?logo=microsoftazure)
![MIT License](https://img.shields.io/badge/License-MIT-yellow)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)

🚀 **ExpenseWise** is a full-stack personal finance assistant built with modern tools and deployed in the cloud. It combines interactive budgeting, AI-powered insights, and seamless user experience to help you manage your money smarter, not harder.

---

## 🌟 Features

### ✅ Core Functionality
- **Secure Authentication** – Powered by Firebase for fast and secure login/signup.
- **Expense & Income Management** – Add, update, categorize, and delete transactions.
- **Data Visualization** – Interactive charts using Recharts to show financial trends.
- **Export to CSV/Excel** – Download your transaction history for offline tracking.

### 🤖 AI & Agent Tools (Built with LangChain)
- **PDF Bank Statement Upload** – Upload password-protected PDF statements and auto-extract transactions.
- **Auto-Categorization using AI** – Categorizes income and expenses using fuzzy logic and NLP.
- **Cashflow Forecast Tool** – Predict future income, expenses, and savings using machine learning.
- **Savings Goal Tracker** – Set savings goals and get monthly target suggestions.
- **Budget Optimization** – AI-driven suggestions to optimize budget by reducing unnecessary expenses.
- **Financial Insights Tool** – Summarized insights from your transaction history.
- **Voice-to-Text Input** – Add transactions using speech recognition for speed.
- **Dark/Light Theme Toggle** – Choose between light and dark mode.
- **Mobile Responsiveness** – Fully responsive UI on phones, tablets, and desktops.

---

## 🚀 Deployment

| Layer     | Service              |
|-----------|----------------------|
| Frontend  | **Vercel**           |
| Backend   | **Azure App Service**|
| Database  | **MongoDB Atlas**    |
| Auth      | **Firebase**         |
| AI Agent  | **LangChain + Gemini 2.0 (LLM)** |

---

## 🛠️ Tech Stack

| Frontend       | Backend             | AI/ML Tools          | Infra               |
|----------------|---------------------|-----------------------|---------------------|
| React.js       | Django + DRF        | LangChain, Gemini 2.0 | Azure App Service   |
| Material UI    | FastAPI (LangChain) | scikit-learn          | Vercel (Frontend)   |
| Recharts       | MongoEngine         | FuzzyWuzzy (NLP)      | MongoDB Atlas       |
| Web Speech API |                     | PyPDF2 (PDF Parsing)  | Firebase Auth       |

---

## 🧠 AI Tools Implemented

| Tool Name                   | Description                                                   |
|-----------------------------|---------------------------------------------------------------|
| `parse_and_upload_transactions` | Extracts and categorizes transactions from PDF bank statements |
| `confirm_transaction_upload`    | Uploads parsed transactions after user confirmation          |
| `cashflow_forecast_tool`        | Predicts upcoming income, expenses, and savings              |
| `goal_tracker_tool`             | Tracks and projects savings goals                            |
| `optimize_budget`               | Suggests ways to reduce expenses and improve savings         |
| `financial_insight_tool`        | Summarizes financial performance and behavior                |
| `add_transaction_tool`          | Adds transactions using natural language or structured input |

---

## ✨ Example Prompts for AI Agent

- “Upload my Paytm bank statement for June”
- “What will my expenses look like in August?”
- “Suggest a budget plan to help me save ₹5000 per month”
- “Did I overspend on food last month?”
- “Add a ₹1200 payment for groceries yesterday”

---

## 🖥️ Local Setup

### Backend

```bash
git clone https://github.com/yourusername/expensewise.git
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
### 💻 Frontend Setup

```bash
cd frontend
npm install
npm start
```
### 🎯 Roadmap (Post-MVP)
 AI budget planner chatbot

 Transaction category auto-correction via LLM

 Visual progress tracking for savings goals

 AI anomaly detection in spending

 Multi-user shared finance dashboard

### 🤝 Contributing
Pull requests are welcome!
Please open an issue first to discuss what you'd like to contribute.

### 📃 License
This project is licensed under the MIT License.

### 🙌 Acknowledgements
OpenAI / LangChain

Firebase

MongoDB Atlas

scikit-learn, PyPDF2, FuzzyWuzzy

Vercel & Azure App Services

### 🔗 Connect with Me
📧 Email:  vandanapupavan1@gmail.com

💼 LinkedIn: Pavankalyan Vandanapu

🌐 Portfolio: pavankalyanv.netlify.app


