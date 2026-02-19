import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useRequestAllocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/allocations', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-allocation'] });
        },
    });
};

export const useLockRoom = () => {
    return useMutation({
        mutationFn: async (roomId: string) => {
            const response = await api.post(`/rooms/${roomId}/lock`);
            return response.data;
        },
    });
};

export const useMyAllocation = () => {
    return useQuery({
        queryKey: ['my-allocation'],
        queryFn: async () => {
            const { data } = await api.get('/allocations/my');
            return data;
        },
    });
};
