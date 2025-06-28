const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// ROBBIEJR BOT V2 Configuration
const BOT_CONFIG = {
    name: "ROBBIEJR BOT V2",
    version: "2.0.0",
    adminNumber: "254718606619", // Your admin number
    weatherAPIKey: "your_openweathermap_api_key", // Get from openweathermap.org
    prefix: "!", // Command prefix
    pairingCode: Math.random().toString(36).substring(2, 8).toUpperCase() // Random 6-char code
};

console.log(`
██████╗  ██████╗ ██████╗ ██████╗ ██╗███████╗██████╗     ██████╗  ██████╗ ████████╗
██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██║██╔════╝██╔══██╗    ██╔══██╗██╔═══██╗╚══██╔══╝
██████╔╝██║   ██║██████╔╝██████╔╝██║█████╗  ██████╔╝    ██║  ██║██║   ██║   ██║   
██╔══██╗██║   ██║██╔══██╗██╔══██╗██║██╔══╝  ██╔══██╗    ██║  ██║██║   ██║   ██║   
██║  ██║╚██████╔╝██║  ██║██████╔╝██║███████╗██║  ██║    ██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝    ╚═════╝  ╚═════╝    ╚═╝   
                                                                      VERSION ${BOT_CONFIG.version}
`);

console.log(`🔐 Pairing Code: ${BOT_CONFIG.pairingCode}`);
console.log("📱 Bot Number: " + BOT_CONFIG.adminNumber);
console.log("⚡ Initializing ROBBIEJR BOT V2...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true },
    webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html' }
});

// Cool ASCII art for when bot is ready
const showReadyArt = () => {
    console.log(`
    ┌───────────────────────────────────────────────────┐
    │                                                   │
    │   ██████╗ ██████╗  ██████╗ ██████╗ ██╗███████╗    │
    │   ██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██║██╔════╝    │
    │   ██████╔╝██████╔╝██║   ██║██████╔╝██║███████╗    │
    │   ██╔══██╗██╔══██╗██║   ██║██╔══██╗██║╚════██║    │
    │   ██║  ██║██████╔╝╚██████╔╝██║  ██║██║███████║    │
    │   ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝    │
    │                                                   │
    │              ROBBIEJR BOT V2 IS ONLINE            │
    │                                                   │
    └───────────────────────────────────────────────────┘
    `);
};

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log(`🔢 Scan the QR code above or enter pairing code: ${BOT_CONFIG.pairingCode}`);
});

client.on('ready', () => {
    showReadyArt();
    console.log('✅ ROBBIEJR BOT V2 is ready!');
    // Send ready notification to admin
    client.sendMessage(BOT_CONFIG.adminNumber + '@c.us', `🤖 *${BOT_CONFIG.name}* is now online!\nVersion: ${BOT_CONFIG.version}\nPairing Code: ${BOT_CONFIG.pairingCode}`);
});

client.on('message', async msg => {
    // Ignore if message is from status broadcast
    if (msg.from === 'status@broadcast') return;

    // Check if message starts with prefix
    if (!msg.body.startsWith(BOT_CONFIG.prefix)) return;

    const command = msg.body.split(' ')[0].substring(BOT_CONFIG.prefix.length).toLowerCase();
    const args = msg.body.split(' ').slice(1);

    // Check if sender is admin for admin commands
    const isAdmin = msg.from.includes(BOT_CONFIG.adminNumber);

    try {
        switch (command) {
            case 'weather':
                await handleWeatherCommand(msg, args);
                break;
            case 'kick':
                if (isAdmin) {
                    await handleKickCommand(msg, args);
                } else {
                    msg.reply('🚫 You are not authorized to use this command.');
                }
                break;
            case 'broadcast':
                if (isAdmin) {
                    await handleBroadcastCommand(msg, args);
                } else {
                    msg.reply('🚫 You are not authorized to use this command.');
                }
                break;
            case 'help':
                await handleHelpCommand(msg);
                break;
            default:
                msg.reply('❌ Unknown command. Type !help for available commands.');
        }
    } catch (error) {
        console.error('Error handling command:', error);
        msg.reply('⚠️ An error occurred while processing your command.');
    }
});

// Command Handlers
async function handleWeatherCommand(msg, args) {
    if (args.length === 0) {
        return msg.reply('Please specify a location. Example: !weather Nairobi');
    }

    const location = args.join(' ');
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${BOT_CONFIG.weatherAPIKey}&units=metric`);
        const weather = response.data;
        
        const reply = `
🌤 *Weather for ${weather.name}* 🌤
--------------------------------
🌡 Temperature: ${weather.main.temp}°C
💧 Humidity: ${weather.main.humidity}%
🌬 Wind: ${weather.wind.speed} m/s
☁️ Condition: ${weather.weather[0].description}
--------------------------------
        `;
        msg.reply(reply);
    } catch (error) {
        msg.reply('⚠️ Could not fetch weather data. Please check the location and try again.');
    }
}

async function handleKickCommand(msg, args) {
    if (!msg.from.endsWith('@g.us')) {
        return msg.reply('This command only works in groups.');
    }

    if (args.length === 0) {
        return msg.reply('Please specify a user to kick. Example: !kick @user');
    }

    const mentionedUser = msg.mentionedIds[0];
    if (!mentionedUser) {
        return msg.reply('Please mention a user to kick. Example: !kick @user');
    }

    try {
        const chat = await msg.getChat();
        await chat.removeParticipants([mentionedUser]);
        msg.reply(`🚪 User has been kicked from the group.`);
    } catch (error) {
        console.error('Error kicking user:', error);
        msg.reply('⚠️ Failed to kick user. Make sure I have admin privileges.');
    }
}

async function handleBroadcastCommand(msg, args) {
    if (args.length < 2) {
        return msg.reply('Usage: !broadcast <group name> <message>');
    }

    const groupName = args[0];
    const broadcastMessage = args.slice(1).join(' ');

    try {
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup && chat.name.toLowerCase().includes(groupName.toLowerCase()));

        if (groups.length === 0) {
            return msg.reply(`No groups found with name containing "${groupName}"`);
        }

        for (const group of groups) {
            await group.sendMessage(`📢 *Broadcast from ${BOT_CONFIG.name}:*\n${broadcastMessage}`);
        }

        msg.reply(`✅ Broadcast sent to ${groups.length} group(s).`);
    } catch (error) {
        console.error('Error broadcasting message:', error);
        msg.reply('⚠️ An error occurred while sending the broadcast.');
    }
}

async function handleHelpCommand(msg) {
    const helpMessage = `
╔════════════════════════════════════════════╗
║  ██████╗  ██████╗ ██████╗ ██████╗ ██╗███████╗   ║
║  ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██║██╔════╝   ║
║  ██████╔╝██║   ██║██████╔╝██████╔╝██║███████╗   ║
║  ██╔══██╗██║   ██║██╔══██╗██╔══██╗██║╚════██║   ║
║  ██║  ██║╚██████╔╝██║  ██║██████╔╝██║███████║   ║
║  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚══════╝   ║
║           ROBBIEJR BOT V2 - ${BOT_CONFIG.version}           ║
╠════════════════════════════════════════════╣
║                                            ║
║  🌟 *MAIN COMMANDS*                        ║
║  !help - Show this magnificent menu        ║
║  !menu - Same as !help (because why not)   ║
║  !info - Bot information                   ║
║                                            ║
║  🌦 *WEATHER COMMANDS*                     ║
║  !weather [location] - Get weather         ║
║  !forecast [location] - 5-day forecast     ║
║                                            ║
║  👑 *ADMIN COMMANDS* (Restricted)          ║
║  !kick @user - Remove user from group      ║
║  !ban @user - Ban user (super admin only)  ║
║  !broadcast [group] [msg] - Mass message   ║
║  !restart - Restart the bot                ║
║                                            ║
║  🎉 *FUN COMMANDS*                         ║
║  !joke - Get a random joke                 ║
║  !quote - Inspirational quote              ║
║  !meme - Fresh meme delivery               ║
║  !roll - Random number (1-100)             ║
║                                            ║
║  🛠 *UTILITY COMMANDS*                     ║
║  !time - Current time                      ║
║  !translate [text] - Translate text        ║
║  !calc [expression] - Calculator           ║
║  !remind [time] [msg] - Set reminder      ║
║                                            ║
║  🔒 *SECURITY COMMANDS*                    ║
║  !paircode - Get pairing code              ║
║  !auth [code] - Authenticate               ║
║                                            ║
╠════════════════════════════════════════════╣
║  📱 Bot Number: ${BOT_CONFIG.adminNumber}       ║
║  🔐 Pairing Code: ${BOT_CONFIG.pairingCode}     ║
║  ⚡ Powered by: ROBBIEJR TECHNOLOGIES       ║
╚════════════════════════════════════════════╝
    `;
    
    // Send as a message
    await msg.reply(helpMessage);
    
    // Bonus: Send a cool image if available
    try {
        const media = MessageMedia.fromFilePath('./menu-image.jpg');
        await msg.reply(media, null, { caption: "Here's a visual menu!" });
    } catch (error) {
        console.log("Menu image not found, sending text-only menu");
    }
}
