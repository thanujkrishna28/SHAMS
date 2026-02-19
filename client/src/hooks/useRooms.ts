import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Room } from '../types';

export const useRooms = (filters?: { block?: string; isAC?: boolean }) => {
    return useQuery({
        queryKey: ['rooms', filters],
        queryFn: async () => {
            const params: any = {};
            if (filters?.block) params.block = filters.block;
            if (typeof filters?.isAC === 'boolean') params.isAC = filters.isAC;

            const { data } = await api.get<Room[]>('/rooms', { params });
            return data;
        },
    });
};

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newRoom: Partial<Room>) => {
            const { data } = await api.post<Room>('/rooms', newRoom);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
    });
};

export const useBulkCreateRooms = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bulkData: any) => {
            const { data } = await api.post('/rooms/bulk', bulkData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
    });
};

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Room> }) => {
            const response = await api.put<Room>(`/rooms/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
    });
};

export const useDeleteRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/rooms/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
    });
};
