import Complaint from '../models/Complaint';
import { notifyAdmins } from '../controllers/notificationController';

export const startEscalationCron = () => {
    // Check every hour for SLA breaches (in ms: 60 * 60 * 1000)
    // For demo purposes, we will check every 10 minutes (10 * 60 * 1000)
    setInterval(async () => {
        try {
            const now = new Date();
            // Find all pending/in-progress complaints where dueDate is in the past
            const overdueComplaints = await Complaint.find({
                status: { $in: ['pending', 'in-progress'] },
                dueDate: { $lt: now }
            });

            if (overdueComplaints.length > 0) {
                // Bulk update to 'escalated'
                const ids = overdueComplaints.map(c => c._id);
                await Complaint.updateMany(
                    { _id: { $in: ids } },
                    { $set: { status: 'escalated' } }
                );
                
                // Notify Chief Wardens/Admins
                await notifyAdmins(
                    '⚠️ SLA Breach - Complaints Escalated',
                    `${overdueComplaints.length} complaints have breached their SLA and have been auto-escalated to high priority.`,
                    'alert'
                );
                console.log(`[Cron] Auto-escalated ${overdueComplaints.length} complaints`);
            }
        } catch (error) {
            console.error('Error running escalation cron:', error);
        }
    }, 10 * 60 * 1000); // 10 minutes
    
    console.log('[Cron] SLA Escalation job started.');
};
