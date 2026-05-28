import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Servidor fantasma para o Render
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Multibot TIZ Online');
}).listen(process.env.PORT || 3000, '0.0.0.0');

// Lista de números que queremos ligar
const numbers = [
    process.env.PHONE_NUMBER_1,
    process.env.PHONE_NUMBER_2
].filter(n => n); // Remove números vazios

console.log(`🚀 Iniciando Multibot para ${numbers.length} números...`);

numbers.forEach((phone, index) => {
    const botID = index + 1;
    
    const client = new Client({
        // Cada bot tem a sua própria pasta de sessão para não misturar
        authStrategy: new LocalAuth({ dataPath: `./.wwebjs_auth_bot_${botID}` }),
        puppeteer: {
            headless: 'new',
            executablePath: '/usr/bin/google-chrome',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process', // OBRIGATÓRIO para tentar rodar 2 bots em 512MB
                '--no-zygote'
            ]
        }
    });

    client.on('ready', () => {
        console.log(`✅ BOT ${botID} (${phone}) CONECTADO COM SUCESSO!`);
    });

    client.on('message', async (msg) => {
        // Lógica simples de resposta para teste
        if (msg.body === '!ping') {
            msg.reply(`Pong! Bot ${botID} ativo.`);
        }
    });

    async function initBot() {
        try {
            console.log(`🤖 Bot ${botID}: Abrindo navegador...`);
            await client.initialize();
            
            // Espera o sistema respirar (Damos mais tempo para o segundo bot não travar o primeiro)
            await new Promise(res => setTimeout(res, 20000 * botID));

            if (!client.info) {
                console.log(`📲 Bot ${botID}: Solicitando código para ${phone}...`);
                const code = await client.requestPairingCode(phone);
                console.log(`\n=========================================`);
                console.log(`👉 CÓDIGO DO BOT ${botID} (${phone}): ${code}`);
                console.log(`=========================================\n`);
            }
        } catch (err) {
            console.log(`❌ Erro no Bot ${botID}:`, err.message);
        }
    }

    initBot();
});
