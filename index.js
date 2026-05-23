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
        executablePath: '/usr/bin/google-chrome', // Caminho fixo no Docker
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
    console.log('⚠️ QR CODE GERADO:');
    qrcode.generate(qr, { small: true });
});

client.on('code', (code) => {
    console.log('\n=========================================');
    console.log('👉 SEU CÓDIGO NO WHATSAPP:', code);
    console.log('=========================================\n');
});

client.on('ready', () => console.log('✅ BOT ONLINE E CONECTADO!'));

async function start() {
    try {
        console.log("🚀 Iniciando navegador no Docker...");
        await client.initialize();
        
        // Espera 30 segundos para o servidor respirar
        await new Promise(res => setTimeout(res, 30000));

        if (PHONE_NUMBER && !client.info) {
            console.log("Soliçitando código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('👉 CÓDIGO:', code);
        }
    } catch (err) {
        console.error("Erro:", err.message);
    }
}

start();
