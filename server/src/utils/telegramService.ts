import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

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

    // Handle /dashboard command
    bot.onText(/\/dashboard/, (msg: any) => {
        const chatId = msg.chat.id;
        bot?.sendMessage(chatId, `🖥 *SHAMS Dashboard*\n\nAccess your account, check mess menus, and manage your profile here:`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: '🌐 Open Dashboard', url: process.env.FRONTEND_URL || 'https://shams-green.vercel.app' }
                ]]
            }
        });
    });

    // Handle /complaint command
    bot.onText(/\/complaint/, (msg: any) => {
        const chatId = msg.chat.id;
        bot?.sendMessage(chatId, `🛠 *Quick Complaint*\n\nNeed to report an issue? Click below to file a complaint:`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: '📝 File Complaint', url: `${process.env.FRONTEND_URL || 'https://shams-green.vercel.app'}/student/complaints` }
                ]]
            }
        });
    });

    // Handle /leave command
    bot.onText(/\/leave/, (msg: any) => {
        const chatId = msg.chat.id;
        bot?.sendMessage(chatId, `🏠 *Apply for Leave*\n\nPlanning to go home? Apply for your leave pass here:`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: '🚶 Apply for Leave', url: `${process.env.FRONTEND_URL || 'https://shams-green.vercel.app'}/student/leaves` }
                ]]
            }
        });
    });

    console.log('✅ Telegram Bot initialized');
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
