import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api/axios';

export const useStudentFee = () => {
    return useQuery({
        queryKey: ['student-fee'],
        queryFn: async () => {
            // We need an endpoint for student to get their own fee
            const { data } = await api.get('/payments/my-fee');
            return data;
        },
    });
};

export const useCreatePaymentOrder = () => {
    return useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/payments/create-order');
            return data;
        },
    });
};

export const useVerifyPayment = () => {
    return useMutation({
        mutationFn: async (verificationData: any) => {
            const { data } = await api.post('/payments/verify', verificationData);
            return data;
        },
    });
};

