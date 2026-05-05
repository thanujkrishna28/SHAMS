import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot: TelegramBot | null = null;

if (token) {
    bot = new TelegramBot(token, { polling: true });

    // Handle /start command to provide Chat ID
    bot.onText(/\/start/, (msg: TelegramBot.Message) => {
        const chatId = msg.chat.id;
        bot?.sendMessage(chatId, `🚀 Welcome to SHAMS Notification Bot!\n\nYour Chat ID is: \`${chatId}\`\n\nPlease provide this ID to your administrator to receive hostel alerts.`);
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
