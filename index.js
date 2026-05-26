import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Servidor fantasma imediato
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('TIZ Online');
}).listen(process.env.PORT || 3000, '0.0.0.0');

const PHONE_NUMBER = process.env.PHONE_NUMBER;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: '/usr/bin/google-chrome',
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

client.on('ready', () => console.log('✅ BOT ONLINE!'));

async function start() {
    try {
        console.log("🚀 Iniciando...");
        await client.initialize();
        
        // Espera apenas 10 segundos agora
        await new Promise(res => setTimeout(res, 10000));

        if (PHONE_NUMBER) {
            console.log(`📲 Solicitando código para ${PHONE_NUMBER}...`);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 CÓDIGO:', code);
            console.log('=========================================\n');
        }
    } catch (err) {
        console.log("❌ Erro:", err.message);
        // Se der erro, ele tenta de novo em 10 segundos
        setTimeout(start, 10000);
    }
}

start();
