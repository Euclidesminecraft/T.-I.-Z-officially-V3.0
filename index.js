import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Servidor para o Render ficar feliz
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot T-I-Z Ativo');
}).listen(PORT, '0.0.0.0');

const PHONE_NUMBER = process.env.PHONE_NUMBER;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    }
});

client.on('qr', (qr) => {
    console.log('⚠️ O CÓDIGO FALHOU, MAS O QR CODE ESTÁ AQUI:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('✅✅ BOT TOTALMENTE CONECTADO! ✅✅'));

// FUNÇÃO PARA PEDIR O CÓDIGO COM REPETIÇÃO
async function solicitarCodigo() {
    if (!PHONE_NUMBER) {
        console.log("❌ ERRO: Variável PHONE_NUMBER vazia no Render!");
        return;
    }

    let tentativa = 0;
    while (tentativa < 10) {
        try {
            tentativa++;
            console.log(` tentando gerar código (Tentativa ${tentativa})...`);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 👉 SEU CÓDIGO É: ', code);
            console.log('=========================================\n');
            break; // Se conseguiu, para de tentar
        } catch (e) {
            console.log(`❌ Ainda não pronto. Tentando de novo em 15s...`);
            await new Promise(res => setTimeout(res, 15000));
        }
    }
}

async function start() {
    try {
        console.log("🚀 1. Abrindo navegador Chrome no Docker...");
        await client.initialize();
        
        console.log("🚀 2. Navegador OK. Aguardando sistema estabilizar...");
        await new Promise(res => setTimeout(res, 30000));

        console.log("🚀 3. Iniciando pedido de código...");
        await solicitarCodigo();
        
    } catch (err) {
        console.error("❌ ERRO NO START:", err.message);
    }
}

start();
