import mongoose from 'mongoose';
import dotenv from 'dotenv';
import sendEmail from '../utils/sendEmail';
import { getWelcomeEmail } from '../utils/emailTemplates';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sendTestEmail = async () => {
    const targetEmail = process.argv[2] || 'thanujkrishna22@gmail.com';

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: SMTP credentials not found in .env file.');
        process.exit(1);
    }

    try {
        console.log('\x1b[36m%s\x1b[0m', `Preparing professional test email for: ${targetEmail}...`);

        const html = getWelcomeEmail('Thanuj Krishna');

        await sendEmail({
            email: targetEmail,
            subject: 'Smart HMS: Professional Email Experience Test',
            message: 'This is a test of the new Smart HMS professional email templates.',
            html
        });

        console.log('\x1b[32m%s\x1b[0m', '-------------------------------------------------');
        console.log('\x1b[32m%s\x1b[0m', '  SUCCESS: Professional Test Email Sent!         ');
        console.log('\x1b[32m%s\x1b[0m', '-------------------------------------------------');
        console.log(`  To:      ${targetEmail}`);
        console.log(`  System:  Smart HMS External SMTP`);
        console.log('\x1b[32m%s\x1b[0m', '-------------------------------------------------');

        process.exit(0);
    } catch (error: any) {
        console.error('\x1b[31m%s\x1b[0m', 'Error sending test email:');
        console.error(error.message);
        process.exit(1);
    }
};

sendTestEmail();
