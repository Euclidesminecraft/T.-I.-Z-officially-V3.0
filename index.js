import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Servidor fantasma
http.createServer((req, res) => { res.writeHead(200); res.end('Multibot Online'); }).listen(process.env.PORT || 3000);

const numbers = [process.env.PHONE_NUMBER_1, process.env.PHONE_NUMBER_2].filter(n => n);

async function startBot(phone, id) {
    console.log(`🤖 Bot ${id}: Iniciando navegador para ${phone}...`);
    
    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: `./.wwebjs_auth_bot_${id}` }),
        puppeteer: {
            headless: 'new',
            executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-gpu', '--single-process']
        }
    });

    client.on('ready', () => console.log(`✅ BOT ${id} CONECTADO!`));

    try {
        await client.initialize();
        // Espera apenas 15 segundos para o Chrome carregar
        await new Promise(res => setTimeout(res, 15000));

        if (!client.info) {
            console.log(`📲 SOLICITANDO CÓDIGO AGORA PARA ${phone}...`);
            const code = await client.requestPairingCode(phone);
            console.log('\n=========================================');
            console.log(`👉 CÓDIGO DO BOT ${id}: ${code}`);
            console.log('=========================================\n');
            console.log('⚠️ DIGITE RÁPIDO NO WHATSAPP! VOCÊ TEM 2 MINUTOS.');
        }
    } catch (err) {
        console.log(`❌ Erro no Bot ${id}:`, err.message);
    }
}

// Inicia os bots com um intervalo de 2 minutos entre eles
async function runAll() {
    if (numbers[0]) {
        await startBot(numbers[0], 1);
    }
    
    // Só tenta o segundo bot após 3 minutos (tempo para você conectar o primeiro)
    if (numbers[1]) {
        console.log("⏳ Aguardando 3 minutos para iniciar o segundo bot...");
        setTimeout(() => startBot(numbers[1], 2), 180000);
    }
}

runAll();
