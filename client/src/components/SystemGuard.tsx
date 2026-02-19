import React from 'react';
import { useSettings } from '../hooks/useSettings';
import MaintenancePage from '../pages/MaintenancePage';
import { useAuthStore } from '../store/authStore';

const SystemGuard = ({ children }: { children: React.ReactNode }) => {
    const { data: settings, isLoading } = useSettings();
    const { user } = useAuthStore();

    if (isLoading) return null; // Or a simple loader

    // Only apply maintenance mode to students
    if (settings?.maintenanceMode && user?.role === 'student') {
        return <MaintenancePage />;
    }

    return <>{children}</>;
};

export default SystemGuard;
