require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// 8-digit code generator (10000000-99999999)
const generatePairingCode = () => Math.floor(10000000 + Math.random() * 90000000);

const BOT_CONFIG = {
    name: "ROBBIEJR BOT V2",
    version: "2.2.0",
    adminNumber: process.env.ADMIN_NUMBER || "254718606619",
    weatherAPIKey: process.env.WEATHER_API_KEY,
    prefix: "!",
    pairingCode: generatePairingCode() // Initial code
};

// Session management
let currentSession = null;
let pairingCodeExpiry = null;
let restartCount = 0;
const MAX_RESTARTS = 5;
const RESTART_DELAY = 10000;

function startBot() {
    console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   ██████╗  ██████╗ ██████╗ ██████╗ ██╗    ║
║   ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██║    ║
║   ██████╔╝██║   ██║██████╔╝██████╔╝██║    ║
║   ██╔══██╗██║   ██║██╔══██╗██╔══██╗██║    ║
║   ██║  ██║╚██████╔╝██║  ██║██████╔╝██║    ║
║   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝    ║
║                                            ║
║       ROBBIEJR BOT V2 - v${BOT_CONFIG.version}         ║
║                                            ║
╚════════════════════════════════════════════╝
`);

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: "robbiejr-v2", // Fixed session ID
            dataPath: './.wwebjs_auth' 
        }),
        puppeteer: { 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
        webVersionCache: { 
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
        }
    });

    // Only generate new code when actually needed
    client.on('qr', (qr) => {
        // Generate new code only if expired or first time
        if (!BOT_CONFIG.pairingCode || !pairingCodeExpiry || Date.now() > pairingCodeExpiry) {
            BOT_CONFIG.pairingCode = generatePairingCode();
            pairingCodeExpiry = Date.now() + 180000; // 3 minutes expiry
        }

        qrcode.generate(qr, { small: true });
        console.log(`
┌──────────────────────────────────┐
│                                  │
│  🔐 *WHATSAPP PAIRING REQUIRED*  │
│                                  │
│      CODE: ${BOT_CONFIG.pairingCode}      │
│                                  │
│  ⏳ Expires: ${new Date(pairingCodeExpiry).toLocaleTimeString()} │
│                                  │
└──────────────────────────────────┘
`);
        
        // Send to admin if available
        if (currentSession) {
            client.sendMessage(
                `${BOT_CONFIG.adminNumber}@c.us`,
                `🔄 New pairing code: ${BOT_CONFIG.pairingCode}\n` +
                `Expires at ${new Date(pairingCodeExpiry).toLocaleTimeString()}`
            );
        }
    });

    client.on('authenticated', (session) => {
        currentSession = session;
        pairingCodeExpiry = null; // Clear expiry on auth
        console.log('✅ Authenticated successfully!');
    });

    client.on('ready', () => {
        restartCount = 0;
        console.log('🤖 ROBBIEJR BOT V2 is READY!');
        client.sendMessage(
            `${BOT_CONFIG.adminNumber}@c.us`,
            `*${BOT_CONFIG.name} v${BOT_CONFIG.version}* is now online!\n` +
            `Last pairing code: ${BOT_CONFIG.pairingCode || 'N/A'}`
        );
    });

    client.on('disconnected', (reason) => {
        console.log(`🚫 Disconnected: ${reason}`);
        if (restartCount < MAX_RESTARTS) {
            restartCount++;
            console.log(`♻️ Restarting (${restartCount}/${MAX_RESTARTS})...`);
            setTimeout(startBot, RESTART_DELAY);
        } else {
            console.log('❌ Max restarts reached. Manual intervention needed.');
        }
    });

    // Add your command handlers here
    client.on('message', async msg => {
        if (msg.body === '!paircode') {
            msg.reply(
                `🔑 Current Pairing Code: ${BOT_CONFIG.pairingCode || 'None'}\n` +
                `⏳ ${pairingCodeExpiry ? 'Expires: ' + new Date(pairingCodeExpiry).toLocaleTimeString() : 'Not active'}`
            );
        }
        // Add other commands...
    });

    client.initialize();
}

// Start the bot
startBot();

// Clean shutdown
process.on('SIGINT', () => {
    console.log('🚦 Shutting down gracefully...');
    process.exit();
});
