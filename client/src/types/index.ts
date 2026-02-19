export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'student' | 'guardian' | 'security';
    token: string;
}

export interface Room {
    _id: string;
    block: string;
    floor: number;
    roomNumber: string;
    capacity: number;
    occupants: User[];
    type: 'single' | 'double' | 'triple' | 'dorm';
    isAC?: boolean;
    status: 'available' | 'full' | 'maintenance' | 'locked';
    lockExpiresAt?: string;
    lockedBy?: string;
    occupancyPercentage?: number;
}

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert';
    read: boolean;
    createdAt: string;
}

export interface Fee {
    _id: string;
    title: string;
    description?: string;
    amount: number;
    amountPaid: number;
    dueDate: string;
    status: 'pending' | 'partially_paid' | 'paid';
    type: 'tuition' | 'hostel' | 'mess' | 'other';
    paymentLink?: string;
    transactionHistory: Array<{
        amount: number;
        date: string;
        transactionId: string;
        paymentMethod: string;
    }>;
    createdAt: string;
    updatedAt: string;
}
