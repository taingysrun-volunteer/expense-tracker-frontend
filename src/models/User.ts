export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt?: string;
}

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
}

export interface UpdateUserRoleRequest {
    role: string;
}

export interface GetAllUsersResponse {
    content: User[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
