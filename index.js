import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import http from 'http'; // Adicionado para enganar o Render

dotenv.config();

// --- PEQUENO SERVIDOR PARA O RENDER NÃO REINICIAR ---
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot está vivo!');
}).listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Servidor de manutenção ativo na porta ${PORT}`);
});

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

client.on('qr', (qr) => {
    console.log('⚠️ QR CODE GERADO (Pode escanear ou aguardar o código):');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('✅✅ BOT CONECTADO E PRONTO! ✅✅'));

async function start() {
    try {
        console.log("🚀 Iniciando navegador no Docker...");
        await client.initialize();
        
        // Espera 30 segundos para o servidor respirar
        await new Promise(res => setTimeout(res, 30000));

        if (PHONE_NUMBER && !client.info) {
            console.log("Soliçitando código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 👉 SEU CÓDIGO: ', code);
            console.log('=========================================\n');
        }
    } catch (err) {
        console.error("Erro:", err.message);
    }
}

start();
