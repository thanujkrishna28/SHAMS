import AuditLog from '../models/AuditLog';

export const logAudit = async (
    adminId: string,
    action: string,
    targetId: string,
    targetModel: 'User' | 'Room' | 'Allocation' | 'Complaint' | 'Leave' | 'Visitor' | 'Announcement',
    details: string = '',
    ipAddress: string = ''
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
        console.error('Failed to create audit log:', error);
        // We don't want to fail the main request if logging fails, just log the error
    }
};

