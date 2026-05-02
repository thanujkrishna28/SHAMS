import nodemailer from 'nodemailer';

// Mock transporter for development
// In production, use a real SMTP service like SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'mock_user',
        pass: process.env.EMAIL_PASS || 'mock_pass',
    },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        // For development, we just log it unless real credentials are provided
        if (!process.env.EMAIL_USER) {
            console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
            console.log(`[MOCK EMAIL] Body: ${text}`);
            return true;
        }

        const info = await transporter.sendMail({
            from: '"SHAMS Hostel" <noreply@shams.com>',
            to,
            subject,
            text,
            html: html || text,
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export const sendSmartNotificationEmail = async (userEmail: string, userName: string, title: string, content: string) => {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4F46E5;">SHAMS Smart Notification</h2>
            <p>Hello ${userName},</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #4F46E5;">
                <h3 style="margin-top: 0;">${title}</h3>
                <p style="color: #475569;">${content}</p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                This is an automated notification from the Smart Hostel Management System.
            </p>
        </div>
    `;
    
    return sendEmail(userEmail, `Notification: ${title}`, content, html);
};
