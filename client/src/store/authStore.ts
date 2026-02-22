import { create } from 'zustand';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'student' | 'security';
    token: string;
    profile?: {
        studentId?: string;
        gender?: 'Male' | 'Female';
        branch?: string;
        room?: string;
        roomNumber?: string;
        block?: string;
        course?: string;
        year?: number;
        guardianContact?: string;
        guardianContact2?: string;
        guardianName?: string;
        relation?: string;
        address?: string;
        phone?: string;
        age?: number;
        applicationNum?: string;
        aadharNum?: string;
        idProof?: string;
        admissionLetter?: string;
        isVerified?: boolean;
        isInside?: boolean;
        attendancePercentage?: number;
        lastMovementAt?: string | Date;
        mealPreference?: 'Veg' | 'Non-Veg';
        profileImage?: string;
    };
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
    fetchProfile: () => Promise<void>;
    setMealPreference: (preference: 'Veg' | 'Non-Veg') => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    checkAuth: () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Check expiry
                const decoded: any = jwtDecode(parsedUser.token);
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('user');
                    set({ user: null, isAuthenticated: false, isLoading: false });
                } else {
                    set({ user: parsedUser, isAuthenticated: true, isLoading: false });
                }
            } catch (error) {
                localStorage.removeItem('user');
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } else {
            set({ isLoading: false });
        }
    },

    login: async (credentials) => {
        try {
            set({ isLoading: true });
            const { data } = await api.post('/auth/login', credentials);
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (userData) => {
        try {
            set({ isLoading: true });
            const { data } = await api.post('/auth/register', userData);
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    },

    fetchProfile: async () => {
        try {
            const { data } = await api.get('/auth/profile');
            // Merge with token from local storage to keep it
            const storedUser = localStorage.getItem('user');
            let token = '';
            if (storedUser) {
                token = JSON.parse(storedUser).token;
            }
            const updatedUser = { ...data, token };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser, isAuthenticated: true });
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    },

    setMealPreference: async (preference) => {
        try {
            await api.put('/auth/meal-preference', { preference });
            const { fetchProfile } = useAuthStore.getState();
            await fetchProfile(); // Refresh profile state
        } catch (error) {
            console.error('Failed to set meal preference', error);
            throw error;
        }
    }
}));
