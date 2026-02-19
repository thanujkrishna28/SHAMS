import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useMyLeaves = () => {
    return useQuery({
        queryKey: ['my-leaves'],
        queryFn: async () => {
            const { data } = await api.get('/leaves/my');
            return data;
        },
    });
};

export const useApplyLeave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/leaves', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
        },
    });
};
