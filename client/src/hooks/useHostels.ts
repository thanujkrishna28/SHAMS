import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useHostels = () => {
    return useQuery({
        queryKey: ['hostels'],
        queryFn: async () => {
            const { data } = await api.get('/hostels');
            return data;
        },
    });
};

export const useCreateHostel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newHostel: any) => {
            const { data } = await api.post('/hostels', newHostel);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hostels'] });
        },
    });
};

export const useUpdateHostel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updateData }: any) => {
            const { data } = await api.put(`/hostels/${id}`, updateData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hostels'] });
        },
    });
};

export const useDeleteHostel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/hostels/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hostels'] });
        },
    });
};

export const useBlocks = (hostelId?: string) => {
    return useQuery({
        queryKey: ['blocks', hostelId],
        queryFn: async () => {
            const { data } = await api.get('/blocks', { params: { hostelId } });
            return data;
        },
    });
};

export const useCreateBlock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newBlock: any) => {
            const { data } = await api.post('/blocks', newBlock);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blocks'] });
            queryClient.invalidateQueries({ queryKey: ['hostels'] });
        },
    });
};

export const useDeleteBlock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/blocks/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blocks'] });
            queryClient.invalidateQueries({ queryKey: ['hostels'] });
        },
    });
};
