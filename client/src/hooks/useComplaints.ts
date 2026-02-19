import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

export const useComplaints = () => {
    return useQuery({
        queryKey: ['my-complaints'],
        queryFn: async () => {
            const { data } = await api.get('/complaints/my');
            return data;
        },
    });
};

export const useCreateComplaint = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/complaints', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-complaints'] });
        },
    });
};
