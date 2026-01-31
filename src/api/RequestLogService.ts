import { get } from 'http';
import api from './api';

const RequestLogService = {
    getRequestLogs: async (username: string = ''): Promise<any> => {
        const response = await api.get<any>('/audit-logs?username=' + encodeURIComponent(username));
        return response.data;
    }
};

export default RequestLogService;