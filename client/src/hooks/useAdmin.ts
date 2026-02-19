import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await api.get('/admin/stats');
            return data;
        },
    });
};

export const useAllStudents = (page = 1, limit = 50) => {
    return useQuery({
        queryKey: ['all-students', page, limit],
        queryFn: async () => {
            const { data } = await api.get(`/admin/students?page=${page}&limit=${limit}`);
            return data;
        },
    });
};

export const useVerifyStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.put(`/admin/students/${id}/verify`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-students'] }); // Fixed key
        },
    });
};

export const useAllAllocations = () => {
    return useQuery({
        queryKey: ['all-allocations'],
        queryFn: async () => {
            const { data } = await api.get('/allocations');
            return data;
        },
    });
};

export const useAllComplaints = (page = 1, limit = 20) => {
    return useQuery({
        queryKey: ['all-complaints', page, limit],
        queryFn: async () => {
            const { data } = await api.get(`/complaints?page=${page}&limit=${limit}`);
            return data;
        },
    });
};

export const useUpdateComplaintStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status, adminComment }: { id: string; status: string; adminComment?: string }) => {
            const { data } = await api.put(`/complaints/${id}`, { status, adminComment });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-complaints'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
    });
};

export const useUpdateAllocationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status, adminComment }: { id: string; status: string; adminComment?: string }) => {
            const { data } = await api.put(`/allocations/${id}/status`, { status, adminComment });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-allocations'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
    });
};

export const useAllLeaves = (page = 1, limit = 20) => {
    return useQuery({
        queryKey: ['all-leaves', page, limit],
        queryFn: async () => {
            const { data } = await api.get(`/leaves?page=${page}&limit=${limit}`);
            return data;
        },
    });
};

export const useUpdateLeaveStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status, adminComment }: { id: string; status: string; adminComment?: string }) => {
            const { data } = await api.put(`/leaves/${id}`, { status, adminComment });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-leaves'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
    });
};

export const useAllVisitors = (date?: string, status?: string) => {
    return useQuery({
        queryKey: ['all-visitors', date, status],
        queryFn: async () => {
            let query = '';
            if (date) query += `date=${date}&`;
            if (status) query += `status=${status}`;
            const { data } = await api.get(`/visitors?${query}`); // Admin endpoint is shared, handles filters
            return data;
        },
    });
};

export const useUpdateVisitorStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status, remarks }: { id: string; status: string; remarks?: string }) => {
            const { data } = await api.put(`/visitors/${id}`, { status, remarks });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-visitors'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
    });
};
