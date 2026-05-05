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

            bot?.sendMessage(chatId, `✅ *Identity Verified!*\n\nWelcome back, *${user.name}*. Your Telegram is now linked to SHAMS.\n\nYou can now use /complaint or /leave to log in instantly.`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🚀 Go to Dashboard', url: magicLink }
                    ]],
                    remove_keyboard: true // Hide the share contact keyboard
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

    console.log('✅ Telegram Bot initialized with Magic Links');
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
