import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

const PHONE_NUMBER = process.env.PHONE_NUMBER;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        // No Koyeb/Nixpacks o chromium fica neste caminho:
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('⚠️ QR CODE:');
    qrcode.generate(qr, { small: true });
});

client.on('code', (code) => {
    console.log('\n👉 SEU CÓDIGO:', code, '\n');
});

client.on('ready', () => console.log('✅ BOT ONLINE NO KOYEB!'));

async function start() {
    try {
        console.log("Iniciando navegador...");
        await client.initialize();
        
        await new Promise(res => setTimeout(res, 30000));

        if (PHONE_NUMBER && !client.info) {
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('👉 CÓDIGO WHATSAPP:', code);
        }
    } catch (err) {
        console.error("Erro:", err.message);
        setTimeout(start, 60000);
    }
}

start();
