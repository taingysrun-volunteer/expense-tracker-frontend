import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../models/Auth';

const API_BASE_URL = '/api';

const AuthService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        if (response.data.token) {
            sessionStorage.setItem('authToken', response.data.token);
            if (response.data.user) {
                sessionStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    },

    register: async (userData: RegisterRequest): Promise<AuthResponse> => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        if (response.data.token) {
            sessionStorage.setItem('authToken', response.data.token);
            if (response.data.user) {
                sessionStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    },

    verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
        const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp });
        if (response.data.token) {
            sessionStorage.setItem('authToken', response.data.token);
            if (response.data.user) {
                sessionStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    },

    resendOtp: async (email: string): Promise<any> => {
        const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, { email });
        return response.data;
    },

    logout: (): void => {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
    },

    getToken: (): string | null => {
        return sessionStorage.getItem('authToken');
    },
};

export default AuthService;