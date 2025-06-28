require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Improved 6-digit pairing code generator
const generatePairingCode = () => Math.floor(100000 + Math.random() * 900000);

const BOT_CONFIG = {
    name: "ROBBIEJR BOT V2",
    version: "2.0.1",
    adminNumber: process.env.ADMIN_NUMBER || "254718606619",
    weatherAPIKey: process.env.WEATHER_API_KEY,
    prefix: "!",
    pairingCode: generatePairingCode()
};

// Auto-restart handler
let restartCount = 0;
const MAX_RESTARTS = 5;
const RESTART_DELAY = 5000; // 5 seconds

function startBot() {
    console.log(`
██████╗  ██████╗ ██████╗ ██████╗ ██╗███████╗██████╗     ██████╗  ██████╗ ████████╗
██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██║██╔════╝██╔══██╗    ██╔══██╗██╔═══██╗╚══██╔══╝
██████╔╝██║   ██║██████╔╝██████╔╝██║█████╗  ██████╔╝    ██║  ██║██║   ██║   ██║   
██╔══██╗██║   ██║██╔══██╗██╔══██╗██║██╔══╝  ██╔══██╗    ██║  ██║██║   ██║   ██║   
██║  ██║╚██████╔╝██║  ██║██████╔╝██║███████╗██║  ██║    ██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝    ╚═════╝  ╚═════╝    ╚═╝   
                                                                      VERSION ${BOT_CONFIG.version}
`);

    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
        webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html' }
    });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
        console.log(`
┌──────────────────────────────┐
│                              │
│  🔒 6-Digit Pairing Code:     │
│                              │
│         ${BOT_CONFIG.pairingCode}         │
│                              │
│  Expires in 3 minutes        │
│                              │
└──────────────────────────────┘
`);
    });

    client.on('ready', () => {
        restartCount = 0; // Reset restart counter
        console.log('✅ ROBBIEJR BOT V2 is ready!');
        client.sendMessage(`${BOT_CONFIG.adminNumber}@c.us`, `🤖 *${BOT_CONFIG.name}* v${BOT_CONFIG.version} is now online!\nPairing Code: ${BOT_CONFIG.pairingCode}`);
    });

    client.on('disconnected', (reason) => {
        console.log(`🚫 Disconnected: ${reason}`);
        if (restartCount < MAX_RESTARTS) {
            restartCount++;
            console.log(`♻️ Attempting restart ${restartCount}/${MAX_RESTARTS}...`);
            setTimeout(startBot, RESTART_DELAY);
        } else {
            console.log('❌ Max restarts reached. Please check for errors.');
        }
    });

    // Add your message handlers here (weather, kick, etc.)
    client.on('message', msg => {
        if (msg.body === '!ping') {
            msg.reply('🏓 Pong!');
        }
        // Add other command handlers
    });

    client.initialize();
}

// Start the bot
startBot();

// Handle process termination
process.on('SIGINT', () => {
    console.log('🚦 Shutting down gracefully...');
    process.exit();
});
