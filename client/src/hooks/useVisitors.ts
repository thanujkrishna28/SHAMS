import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useMyVisitors = () => {
    return useQuery({
        queryKey: ['my-visitors'],
        queryFn: async () => {
            const { data } = await api.get('/visitors'); // getMyVisitors is triggered if role is student
            return data;
        },
    });
};

export const useRegisterVisitor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (visitorData: { visitorName: string; relation: string; visitDate: string; expectedTime: string; purpose: string }) => {
            const { data } = await api.post('/visitors', visitorData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-visitors'] });
        },
    });
};
