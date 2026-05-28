import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Servidor fantasma para manter o Render feliz
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot T-I-Z Online');
}).listen(PORT, '0.0.0.0');

// Pega o número da variável (PHONE_NUMBER)
const PHONE = process.env.PHONE_NUMBER;

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
            '--single-process',
            '--no-zygote'
        ]
    }
});

client.on('ready', () => console.log('✅✅ CONECTADO COM SUCESSO! ✅✅'));

async function start() {
    try {
        console.log("🚀 Iniciando navegador...");
        await client.initialize();
        
        // Espera 20 segundos para carregar
        await new Promise(res => setTimeout(res, 20000));

        if (PHONE && !client.info) {
            console.log(`📲 Solicitando código para ${PHONE}...`);
            const code = await client.requestPairingCode(PHONE);
            console.log('\n=========================================');
            console.log(`👉 👉 SEU CÓDIGO É:  ${code}`);
            console.log('=========================================\n');
        } else if (!PHONE) {
            console.log("❌ ERRO: Variável PHONE_NUMBER não configurada!");
        }
    } catch (err) {
        console.log("❌ Erro no arranque:", err.message);
        setTimeout(start, 30000); // Tenta de novo se falhar
    }
}

start();
