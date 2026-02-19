import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useMessMenu = () => {
    return useQuery({
        queryKey: ['mess-menu'],
        queryFn: async () => {
            const { data } = await api.get('/mess/menu');
            return data;
        },
    });
};

export const useUpdateMessMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (menu: any) => {
            const { data } = await api.put('/mess/menu', { menu });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mess-menu'] });
        },
    });
};

export const useUpdateDayMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ day, menu }: { day: string; menu: any }) => {
            const { data } = await api.put(`/mess/menu/${day}`, menu);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mess-menu'] });
        },
    });
};

export const useMessFeedback = (page = 1) => {
    return useQuery({
        queryKey: ['mess-feedback', page],
        queryFn: async () => {
            const { data } = await api.get(`/mess/feedback?page=${page}`);
            return data;
        },
    });
};

export const useSubmitMessFeedback = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (feedback: any) => {
            const { data } = await api.post('/mess/feedback', feedback);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mess-feedback'] });
        },
    });
};

export const useDeleteMessFeedback = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/mess/feedback/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mess-feedback'] });
        },
    });
};
