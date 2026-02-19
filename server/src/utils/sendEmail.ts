import nodemailer from 'nodemailer';

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
    html?: string;
}

const sendEmail = async (options: EmailOptions) => {
    // Create reusable transporter object using the default SMTP transport
    // For development, we use ethereal or just console log if no env vars
    // In production, use SendGrid, Mailgun, or Gmail

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Smart HMS'} <${process.env.FROM_EMAIL || 'noreply@smarthms.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
