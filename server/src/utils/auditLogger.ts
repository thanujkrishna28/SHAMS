import AuditLog from '../models/AuditLog';
import mongoose from 'mongoose';

export const logAudit = async (
    adminId: string,
    action: string,
    targetId: string,
    targetModel: string,
    details?: string,
    ipAddress?: string
) => {
    try {
        await AuditLog.create({
            admin: adminId,
            action,
            targetId,
            targetModel,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('[AUDIT LOG ERROR]:', error);
    }
};

interface AuditParams {
    adminId: string;
    action: string;
    targetId: string;
    targetModel: 'User' | 'Room' | 'Allocation' | 'Complaint' | 'Leave' | 'Visitor' | 'Announcement' | 'Fee';
    details?: string;
    ipAddress?: string;
}

export const logAuditAction = async (params: AuditParams) => {
    return logAudit(
        params.adminId,
        params.action,
        params.targetId,
        params.targetModel,
        params.details,
        params.ipAddress
    );
};
