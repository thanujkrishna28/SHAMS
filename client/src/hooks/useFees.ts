import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Fee } from '../types';

export const useMyFees = () => {
    return useQuery({
        queryKey: ['myFees'],
        queryFn: async () => {
            const { data } = await api.get<Fee[]>('/fees/my');
            return data;
        },
    });
};

export const useAllFees = () => {
    return useQuery({
        queryKey: ['allFees'],
        queryFn: async () => {
            const { data } = await api.get<Fee[]>('/fees');
            return data;
        },
    });
};

export const usePayFee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, amountPaid }: { id: string, amountPaid: number }) => {
            const { data } = await api.put(`/fees/${id}/pay`, { amountPaid });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myFees'] });
            queryClient.invalidateQueries({ queryKey: ['allFees'] });
        },
    });
};
