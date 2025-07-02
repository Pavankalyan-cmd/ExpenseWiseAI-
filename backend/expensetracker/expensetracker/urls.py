from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from api.views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    IncomeListCreateView,
    IncomeDetailView,
    UserDetailView,
    UserListCreateView,
    ExpenseListCreateViewLlm,
    LangChainAgentView,
    IncomeListCreateViewLlm,
    ResetAllTransactionsView,
    TransactionUploadView
)

def health_check(request):
    return JsonResponse({"status": " Django running"})



urlpatterns = [
    path('', health_check), 

    path('admin/', admin.site.urls),

    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<str:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('expenses/add/', ExpenseListCreateViewLlm.as_view(), name='add-expense'),
    path('income/add/', IncomeListCreateViewLlm.as_view(), name='add-income'),
    path('transactions/upload/', TransactionUploadView.as_view(), name='transaction-upload'),

    path('expenses/', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('expenses/<str:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),

    path('incomes/', IncomeListCreateView.as_view(), name='income-list-create'),
    path('incomes/<str:pk>/', IncomeDetailView.as_view(), name='income-detail'),

    path('reset-transactions/', ResetAllTransactionsView.as_view(), name='reset-transactions'),

    path('ai/agent/', LangChainAgentView.as_view(), name='langchain-agent'),

]