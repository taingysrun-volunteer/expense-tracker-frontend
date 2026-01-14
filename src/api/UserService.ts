import api from './api';
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    UpdateUserRoleRequest,
    GetAllUsersResponse
} from '../models/User';

const UserService = {
    getAllUsers: async (page: number = 0, size: number = 10): Promise<GetAllUsersResponse> => {
        const response = await api.get<GetAllUsersResponse>(`/users?page=${page}&size=${size}`);
        return response.data;
    },

    createUser: async (userData: CreateUserRequest): Promise<User> => {
        const response = await api.post<User>('/users', userData);
        return response.data;
    },

    getUserById: async (userId: string): Promise<User> => {
        const response = await api.get<User>(`/users/${userId}`);
        return response.data;
    },

    updateUser: async (userId: string, userData: UpdateUserRequest): Promise<User> => {
        const response = await api.put<User>(`/users/${userId}`, userData);
        return response.data;
    },

    updateUserRole: async (userId: string, role: string): Promise<User> => {
        const response = await api.patch<User>(`/users/${userId}/role`, { role });
        return response.data;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/users/${userId}`);
    },

    searchUsers: async (query: string): Promise<User[]> => {
        const response = await api.get<User[]>('/users/search', { q: query });
        return response.data;
    },

    resetPassword: async (userId: string, newPassword: string): Promise<void> => {
        await api.patch(`/users/${userId}/reset-password`, { newPassword });
    },
};

export default UserService;
