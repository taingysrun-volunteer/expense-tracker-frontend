export interface CategoryBreakdown {
    categoryName: string;
    totalAmount: number;
    count: number;
    percentage: number;
}

export interface MonthlyBreakdown {
    month: string;
    totalAmount: number;
    count: number;
}

export interface SummaryResponse {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    maxAmount: number;
    minAmount: number;
    categoryBreakdown: CategoryBreakdown[];
    monthlyBreakdown: MonthlyBreakdown[];
}
