import api from './api';
import type {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    GetAllCategoriesResponse
} from '../models/Category';

const CategoryService = {
    getAllCategories: async (): Promise<GetAllCategoriesResponse> => {
        const response = await api.get<GetAllCategoriesResponse>('/categories');
        return response.data;
    },

    createCategory: async (categoryData: CreateCategoryRequest): Promise<Category> => {
        const response = await api.post<Category>('/categories', categoryData);
        return response.data;
    },

    getCategoryById: async (categoryId: string): Promise<Category> => {
        const response = await api.get<Category>(`/categories/${categoryId}`);
        return response.data;
    },

    updateCategory: async (categoryId: string, categoryData: UpdateCategoryRequest): Promise<Category> => {
        const response = await api.put<Category>(`/categories/${categoryId}`, categoryData);
        return response.data;
    },

    deleteCategory: async (categoryId: string): Promise<void> => {
        await api.delete(`/categories/${categoryId}`);
    },
};

export default CategoryService;
