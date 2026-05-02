export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'student' | 'guardian' | 'security';
    token: string;
}

export interface Room {
    _id: string;
    block: any;
    floor: number;
    roomNumber: string;
    capacity: number;
    occupants: any[];
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
    student: any;
    type: string;
    description?: string;
    academicYear: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'PARTIAL';
    paymentMode?: 'ONLINE' | 'OFFLINE';
    gatewayOrderId?: string;
    transactionId?: string;
    paidAt?: string;
    receiptNumber?: string;
    createdAt: string;
    updatedAt: string;
}

