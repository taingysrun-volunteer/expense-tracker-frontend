export interface Category {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt?: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    isActive: boolean;
}

export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface GetAllCategoriesResponse {
    content: Category[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
