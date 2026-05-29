import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// 📡 Servidor para o Render não desligar o bot
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Multibot T-I-Z V3 Ativo');
}).listen(process.env.PORT || 3000, '0.0.0.0');

const numbers = [process.env.PHONE_NUMBER_1, process.env.PHONE_NUMBER_2].filter(n => n);

async function startBot(phone, id) {
    console.log(`\n🤖 [BOT ${id}] -> Iniciando motor para ${phone}...`);
    
    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: `./.wwebjs_auth_bot_${id}` }),
        puppeteer: {
            headless: 'new',
            executablePath: '/usr/bin/google-chrome',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // Crucial para economizar RAM
                '--disable-gpu'
            ]
        }
    });

    client.on('ready', () => console.log(`\n✅ [BOT ${id}] TOTALMENTE CONECTADO E ATIVO!\n`));

    // Sistema de Auto-Recuperação de Código
    async function solicitarCodigoComRetry() {
        let sucesso = false;
        while (!sucesso) {
            try {
                if (client.info) { sucesso = true; break; }
                
                console.log(`📲 [BOT ${id}] Solicitando código de pareamento...`);
                const code = await client.requestPairingCode(phone);
                
                console.log('\n=========================================');
                console.log(`   👉 CÓDIGO DO BOT ${id}: ${code}   `);
                console.log('=========================================');
                console.log(`⚠️  Digite agora no WhatsApp do número ${phone}\n`);
                
                sucesso = true;
            } catch (err) {
                console.log(`❌ [BOT ${id}] Erro ao gerar código. Tentando novamente em 20s...`);
                await new Promise(res => setTimeout(res, 20000));
            }
        }
    }

    try {
        await client.initialize();
        
        // Aguarda o navegador estabilizar
        await new Promise(res => setTimeout(res, 20000));
        
        if (!client.info) {
            await solicitarCodigoComRetry();
        }
    } catch (err) {
        console.error(`💀 [BOT ${id}] Falha Crítica:`, err.message);
    }
}

// Lógica de Inicialização Escalonada (Staggered)
async function runAll() {
    console.log(`🚀 T-I-Z MULTIBOT: Detectados ${numbers.length} números.`);

    if (numbers[0]) {
        await startBot(numbers[0], 1);
    }
    
    if (numbers[1]) {
        // Aumentei para 4 minutos para dar tempo total de conexão do primeiro bot
        console.log("\n⏳ Aguardando 4 minutos para iniciar o Bot 2 e não travar a RAM...");
        setTimeout(() => startBot(numbers[1], 2), 240000);
    }
}

runAll();
