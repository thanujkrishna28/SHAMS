import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export const useMyAttendance = () => {
    return useQuery({
        queryKey: ['my-attendance'],
        queryFn: async () => {
            const { data } = await api.get('/attendance/my');
            return data;
        }
    });
};
