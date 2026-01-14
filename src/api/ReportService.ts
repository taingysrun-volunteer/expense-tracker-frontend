import api from './api';
import type { SummaryResponse } from '../models/Report';

export interface SummaryFilters {
    categoryId?: string;
    month?: string; // Format: YYYY-MM
}

const ReportService = {
    getSummary: async (filters?: SummaryFilters): Promise<SummaryResponse> => {
        const params: Record<string, string> = {};

        if (filters?.categoryId) {
            params.categoryId = filters.categoryId;
        }

        if (filters?.month) {
            params.month = filters.month;
        }

        const response = await api.get<SummaryResponse>('/expenses/summary', params);
        return response.data;
    },
};

export default ReportService;
