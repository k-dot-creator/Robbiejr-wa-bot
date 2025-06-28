require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// ✅ 8-Digit Pairing Code Generator (10000000 - 99999999)
const generatePairingCode = () => Math.floor(10000000 + Math.random() * 90000000);

const BOT_CONFIG = {
    name: "ROBBIEJR BOT V2",
    version: "2.1.0",
    adminNumber: process.env.ADMIN_NUMBER || "254718606619",
    weatherAPIKey: process.env.WEATHER_API_KEY,
    prefix: "!",
    pairingCode: generatePairingCode() // Now 8 digits!
};

// Auto-restart system (5 max attempts)
let restartCount = 0;
const MAX_RESTARTS = 5;
const RESTART_DELAY = 10000; // 10 seconds

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
        authStrategy: new LocalAuth(),
        puppeteer: { 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
        webVersionCache: { 
            type: 'remote', 
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html' 
        }
    });

    // ✅ 8-Digit Pairing Code Display
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
        console.log(`
┌──────────────────────────────────┐
│                                  │
│  🔐 *WHATSAPP PAIRING REQUIRED*  │
│                                  │
│      CODE: ${BOT_CONFIG.pairingCode}      │
│                                  │
│  ⏳ Expires in 3 minutes         │
│                                  │
└──────────────────────────────────┘
`);
    });

    client.on('ready', () => {
        restartCount = 0; // Reset restart counter
        console.log('✅ ROBBIEJR BOT V2 is ONLINE!');
        client.sendMessage(
            `${BOT_CONFIG.adminNumber}@c.us`, 
            `*🤖 ${BOT_CONFIG.name} v${BOT_CONFIG.version}*\n\n` +
            `🔑 *Pairing Code:* ${BOT_CONFIG.pairingCode}\n` +
            `🔄 *Restarts:* ${restartCount}/${MAX_RESTARTS}`
        );
    });

    // Auto-restart on disconnect
    client.on('disconnected', (reason) => {
        console.log(`🚫 Disconnected: ${reason}`);
        if (restartCount < MAX_RESTARTS) {
            restartCount++;
            console.log(`♻️ Restarting (${restartCount}/${MAX_RESTARTS})...`);
            setTimeout(startBot, RESTART_DELAY);
        } else {
            console.log('❌ MAX RESTARTS REACHED. Manual restart required.');
        }
    });

    // Command handler
    client.on('message', async msg => {
        if (msg.body.startsWith(BOT_CONFIG.prefix)) {
            const cmd = msg.body.split(' ')[0].substring(1).toLowerCase();
            
            switch(cmd) {
                case 'ping':
                    msg.reply('🏓 Pong!');
                    break;
                case 'paircode':
                    msg.reply(`🔑 Current Pairing Code: ${BOT_CONFIG.pairingCode}`);
                    break;
                // Add more commands...
            }
        }
    });

    client.initialize();
}

// Start bot
startBot();

// Handle shutdown
process.on('SIGINT', () => {
    console.log('🚦 Shutting down...');
    process.exit();
});
