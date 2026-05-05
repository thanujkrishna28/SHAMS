import { create } from 'zustand';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'student' | 'security' | 'warden' | 'chief_warden';
    token: string;
    createdAt?: string | Date;
    isMFAEnabled?: boolean;
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
        webauthnCredentials?: any[];
        lastProfileUpdate?: string | Date;
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
    verifyMFA: (token: string, userId: string, role: string) => Promise<void>;
    setMockAuth: (user: any) => void;
    startWebAuthnRegistration: () => Promise<void>;
    startWebAuthnLogin: () => Promise<void>;
    loginWithToken: (token: string) => Promise<void>;
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
            
            if (data.mfaRequired) {
                set({ isLoading: false });
                return data; // Return MFA info to the component
            }

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
    },

    verifyMFA: async (token, userId, role) => {
        try {
            set({ isLoading: true });
            const { data } = await api.post('/auth/mfa/verify', { token, userId, role });
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    setMockAuth: (user) => {
        // Create a fake token for the demo session
        const mockUser = { ...user, token: 'demo-biometric-token' };
        localStorage.setItem('user', JSON.stringify(mockUser));
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
    },

    startWebAuthnRegistration: async () => {
        const { startRegistration } = await import('@simplewebauthn/browser');
        try {
            set({ isLoading: true });
            // 1. Get registration options from server
            const { data: options } = await api.post('/webauthn/register-options');

            // 2. Trigger browser's native biometric prompt
            const regResponse = await startRegistration(options);

            // 3. Verify registration with server
            const { data: verification } = await api.post('/webauthn/register-verify', regResponse);

            if (verification.verified) {
                set({ isLoading: false });
            } else {
                throw new Error('Registration verification failed');
            }
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    startWebAuthnLogin: async () => {
        const { startAuthentication } = await import('@simplewebauthn/browser');
        try {
            set({ isLoading: true });
            // 1. Get authentication options from server (No email needed!)
            const { data: options } = await api.post('/webauthn/login-options');

            // 2. Trigger browser's native biometric prompt
            // The browser will "discover" stored credentials on the device
            const authResponse = await startAuthentication(options);

            // 3. Verify authentication with server
            const { data: verification } = await api.post('/webauthn/login-verify', {
                response: authResponse
            });

            if (verification.verified && verification.user) {
                localStorage.setItem('user', JSON.stringify(verification.user));
                set({ user: verification.user, isAuthenticated: true, isLoading: false });
                return verification.user;
            } else {
                throw new Error('Authentication verification failed');
            }
        } catch (error: any) {
            set({ isLoading: false });
            throw error;
        }
    },

    loginWithToken: async (token: string) => {
        try {
            set({ isLoading: true });
            localStorage.setItem('user', JSON.stringify({ token })); // Temporary store to allow fetchProfile to work
            
            const { data } = await api.get('/auth/profile');
            const userWithToken = { ...data, token };
            
            localStorage.setItem('user', JSON.stringify(userWithToken));
            set({ user: userWithToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
            localStorage.removeItem('user');
            set({ isLoading: false });
            throw error;
        }
    }
}));
