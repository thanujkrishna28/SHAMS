import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export interface Announcement {
    _id: string;
    title: string;
    message: string;
    targetAudience: {
        type: 'all' | 'block' | 'floor';
        value?: string;
    };
    createdAt: string;
}

export const useAnnouncements = () => {
    return useQuery({
        queryKey: ['announcements'],
        queryFn: async () => {
            const { data } = await api.get<Announcement[]>('/announcements');
            return data;
        },
    });
};
