import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Servidor para manter o Render vivo
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot T-I-Z Online');
}).listen(PORT, '0.0.0.0');

const PHONE_NUMBER = process.env.PHONE_NUMBER;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--no-zygote']
    }
});

// Removemos o console.log do QR para não poluir o log
client.on('qr', () => {
    console.log('⏳ O sistema está pronto. Aguardando para gerar o código de 8 dígitos...');
});

client.on('ready', () => {
    console.log('✅✅ SUCESSO! BOT CONECTADO! ✅✅');
});

async function start() {
    try {
        console.log("🚀 1. Iniciando navegador...");
        await client.initialize();
        
        console.log("🚀 2. Aguardando 30 segundos para o WhatsApp carregar...");
        await new Promise(res => setTimeout(res, 30000));

        if (PHONE_NUMBER) {
            console.log(`🚀 3. Solicitando código para: ${PHONE_NUMBER}`);
            // Pedimos o código
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 👉 SEU CÓDIGO DE 8 DÍGITOS É:');
            console.log(`👉 👉      ${code}      👈 👈`);
            console.log('=========================================\n');
        } else {
            console.log("❌ ERRO: PHONE_NUMBER não configurado nas variáveis do Render!");
        }

    } catch (err) {
        console.error("❌ ERRO AO GERAR CÓDIGO:", err.message);
        console.log("Tentando novamente em 30 segundos...");
        setTimeout(start, 30000);
    }
}

start();
