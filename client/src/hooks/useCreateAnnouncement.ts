import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Announcement } from './useAnnouncements';

interface CreateAnnouncementData {
    title: string;
    message: string;
    targetType: 'all' | 'block' | 'floor';
    targetValue?: string;
    expiryDays?: number;
}

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateAnnouncementData) => {
            const { data: response } = await api.post<Announcement>('/announcements', data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });
};
