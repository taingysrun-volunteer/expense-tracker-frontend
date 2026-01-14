import api from './api';
import type {
    Expense,
    CreateExpenseRequest,
    UpdateExpenseRequest,
    GetAllExpensesResponse
} from '../models/Expense';

const ExpenseService = {
    getAllExpenses: async (page: number = 0, size: number = 10): Promise<GetAllExpensesResponse> => {
        const response = await api.get<GetAllExpensesResponse>(`/expenses?page=${page}&size=${size}`);
        return response.data;
    },

    createExpense: async (expenseData: CreateExpenseRequest): Promise<Expense> => {
        const response = await api.post<Expense>('/expenses', expenseData);
        return response.data;
    },

    getExpenseById: async (expenseId: string): Promise<Expense> => {
        const response = await api.get<Expense>(`/expenses/${expenseId}`);
        return response.data;
    },

    updateExpense: async (expenseId: string, expenseData: UpdateExpenseRequest): Promise<Expense> => {
        const response = await api.put<Expense>(`/expenses/${expenseId}`, expenseData);
        return response.data;
    },

    deleteExpense: async (expenseId: string): Promise<void> => {
        await api.delete(`/expenses/${expenseId}`);
    },
};

export default ExpenseService;
