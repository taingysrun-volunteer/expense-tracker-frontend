export interface Expense {
    id: string;
    title: string;
    amount: number;
    description: string;
    expenseDate: string;
    categoryId: string;
    categoryName?: string;
    userId: string;
    userName?: string;
    createdAt?: string;
}

export interface CreateExpenseRequest {
    title: string;
    amount: number;
    description: string;
    expenseDate: string;
    categoryId: string;
}

export interface UpdateExpenseRequest {
    title?: string;
    amount?: number;
    description?: string;
    expenseDate?: string;
    categoryId?: string;
}

export interface GetAllExpensesResponse {
    content: Expense[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
