import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import User from '../models/User';
import Admin from '../models/Admin';
import Warden from '../models/Warden';
import generateToken from './generateToken';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot: any = null;

if (token) {
    bot = new TelegramBot(token, { polling: true });

    // Handle /start command to provide Chat ID
    bot.onText(/\/start/, (msg: any) => {
        const chatId = msg.chat.id;
        bot?.sendMessage(chatId, `🚀 Welcome to SHAMS Notification Bot!\n\nYour Chat ID is: \`${chatId}\`\n\nPlease provide this ID to your administrator to receive hostel alerts.`);
    });

    // Handle shared contact (Magic Login)
    bot.on('contact', async (msg: any) => {
        const chatId = msg.chat.id;
        let phoneNumber = msg.contact.phone_number;
        
        // Clean phone number (remove + and ensure format matches DB)
        phoneNumber = phoneNumber.replace('+', '');
        if (phoneNumber.startsWith('91') && phoneNumber.length > 10) {
            phoneNumber = phoneNumber.substring(2); // Remove 91 prefix if present
        }

        // Search for user across all collections by phone number
        const user = await User.findOne({ 'profile.phone': { $regex: phoneNumber } }) ||
                     await Warden.findOne({ 'profile.phone': { $regex: phoneNumber } }) ||
                     await Admin.findOne({ 'profile.phone': { $regex: phoneNumber } });

        if (user) {
            // Save the telegramChatId to link the account for the future
            if (user.profile) {
                user.profile.telegramChatId = chatId.toString();
                await user.save();
            }

            const token = generateToken(user._id.toString());
            const magicLink = `${process.env.FRONTEND_URL || 'https://shams-green.vercel.app'}/login?token=${token}`;

            const welcomeMsg = `🎊 *Welcome to the SHAMS Family, ${user.name}!* 🎊\n\n` +
                `We are excited to have you with us. Your account is now fully linked to Telegram.\n\n` +
                `🏠 *Your Details:*\n` +
                `• *ID:* \`${user.profile?.studentId || 'N/A'}\`\n` +
                `• *Hostel:* ${user.profile?.hostel ? 'Assigned' : 'Pending'}\n` +
                `• *Room:* ${user.profile?.roomNumber || 'Not Allocated Yet'}\n\n` +
                `🚀 *Instant Actions:*\n` +
                `You can now use the menu below to file complaints, apply for leaves, or check your dashboard without ever logging in again!`;

            bot?.sendMessage(chatId, welcomeMsg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🖥 Open Dashboard', url: magicLink }],
                        [{ text: '📝 File a Complaint', url: `${magicLink}&redirect=/student/complaints` }]
                    ]
                }
            });
        } else {
            bot?.sendMessage(chatId, `❌ *User Not Found*\n\nThe phone number \`${phoneNumber}\` is not registered in SHAMS. Please ensure your profile has the correct phone number.`);
        }
    });

    // Handle /dashboard command
    bot.onText(/\/dashboard/, async (msg: any) => {
        const chatId = msg.chat.id;

        const user = await User.findOne({ 'profile.telegramChatId': chatId.toString() }) ||
                     await Warden.findOne({ 'profile.telegramChatId': chatId.toString() }) ||
                     await Admin.findOne({ 'profile.telegramChatId': chatId.toString() });

        if (user) {
            const token = generateToken(user._id.toString());
            const magicLink = `${process.env.FRONTEND_URL || 'https://shams-green.vercel.app'}/login?token=${token}`;
            
            bot?.sendMessage(chatId, `🖥 *SHAMS Dashboard*\n\nWelcome back, *${user.name}*. Access your account instantly:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🌐 Open Dashboard (No Login)', url: magicLink }
                    ]]
                }
            });
        } else {
            bot?.sendMessage(chatId, `🖥 *SHAMS Dashboard*\n\nAccess your account, check mess menus, and manage your profile here:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🌐 Open Dashboard', url: process.env.FRONTEND_URL || 'https://shams-green.vercel.app' }
                    ]]
                }
            });
        }
    });

    // Handle /complaint command
    bot.onText(/\/complaint/, async (msg: any) => {
        const chatId = msg.chat.id;

        const user = await User.findOne({ 'profile.telegramChatId': chatId.toString() }) ||
                     await Warden.findOne({ 'profile.telegramChatId': chatId.toString() }) ||
                     await Admin.findOne({ 'profile.telegramChatId': chatId.toString() });

        if (user) {
            const token = generateToken(user._id.toString());
            const magicLink = `${process.env.FRONTEND_URL || 'https://shams-green.vercel.app'}/login?token=${token}&redirect=/student/complaints`;
            
            bot?.sendMessage(chatId, `🛠 *Quick Complaint*\n\nYou are already linked! Click below to file a complaint directly:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '📝 File Complaint (No Login)', url: magicLink }
                    ]]
                }
            });
        } else {
            bot?.sendMessage(chatId, `🔐 *Authentication Required*\n\nTo access your dashboard without logging in, please verify your phone number:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [[
                        { text: '📲 Share Contact to Verify', request_contact: true }
                    ]],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            });
        }
    });

    // Handle /leave command
    bot.onText(/\/leave/, async (msg: any) => {
        const chatId = msg.chat.id;

        const user = await User.findOne({ 'profile.telegramChatId': chatId.toString() }) ||
                     await Warden.findOne({ 'profile.telegramChatId': chatId.toString() }) ||
                     await Admin.findOne({ 'profile.telegramChatId': chatId.toString() });

        if (user) {
            const token = generateToken(user._id.toString());
            const magicLink = `${process.env.FRONTEND_URL || 'https://shams-green.vercel.app'}/login?token=${token}&redirect=/student/leaves`;
            
            bot?.sendMessage(chatId, `🏠 *Apply for Leave*\n\nYou are already linked! Apply for your pass directly:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🚶 Apply for Leave (No Login)', url: magicLink }
                    ]]
                }
            });
        } else {
            bot?.sendMessage(chatId, `🏠 *Apply for Leave*\n\nPlanning to go home? Apply for your pass here:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🚶 Apply for Leave', url: `${process.env.FRONTEND_URL || 'https://shams-green.vercel.app'}/student/leaves` }
                    ]]
                }
            });
        }
    });

    // Handle /myid command
    bot.onText(/\/myid/, async (msg: any) => {
        const chatId = msg.chat.id;

        // Search across all collections
        const user = await User.findOne({ 'profile.telegramChatId': chatId.toString() }) ||
                     await Warden.findOne({ 'profile.telegramChatId': chatId.toString() }) ||
                     await Admin.findOne({ 'profile.telegramChatId': chatId.toString() });

        if (user) {
            const qrData = `shams:${user.role || 'user'}:${user._id}`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;

            const roleTitle = user.role?.toUpperCase() || 'STUDENT';
            const idCard = `🪪 *SHAMS DIGITAL ID (${roleTitle})*\n` +
                `━━━━━━━━━━━━━━━\n` +
                `👤 *Name:* ${user.name}\n` +
                `🆔 *ID:* \`${user.profile?.studentId || user.email}\`\n` +
                `🎓 *Branch:* ${user.profile?.branch || 'N/A'}\n` +
                `🏠 *Room:* ${user.profile?.roomNumber || 'N/A'}\n` +
                `🏢 *Block:* ${user.profile?.block || 'N/A'}\n` +
                `━━━━━━━━━━━━━━━\n` +
                `*Status:* ${user.profile?.isInside ? '🟢 INSIDE' : '🔴 OUTSIDE'}`;

            await bot?.sendPhoto(chatId, qrImageUrl, {
                caption: idCard,
                parse_mode: 'Markdown'
            });
        } else {
            bot?.sendMessage(chatId, `🔐 *Access Denied*\n\nYou haven't linked your account yet. Use /complaint to verify your phone number first.`, { parse_mode: 'Markdown' });
        }
    });

    console.log('✅ Telegram Bot initialized with Digital IDs for all roles');
} else {
    console.warn('⚠️ Telegram Bot token missing in .env');
}

export const sendTelegramNotification = async (chatId: string | number, message: string) => {
    if (!bot) {
        console.error('❌ Cannot send Telegram notification: Bot not initialized');
        return;
    }

    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('❌ Telegram Notification Error:', error);
    }
};

export default bot;
