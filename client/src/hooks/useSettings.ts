import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useSettings = () => {
    return useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data } = await api.get('/settings');
            return data;
        }
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updates: any) => {
            const { data } = await api.post('/settings', updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        }
    });
};
