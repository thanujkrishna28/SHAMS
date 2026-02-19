import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Notification } from '../types';

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get<Notification[]>('/notifications');
            return data;
        },
        refetchInterval: 30000, // Poll every 30 seconds
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.put<Notification>(`/notifications/${id}/read`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await api.put('/notifications/read-all');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
