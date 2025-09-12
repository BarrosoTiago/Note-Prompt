
// 1. IMPORTAR DEPENDÊNCIAS (ES Modules)
import express from 'express';                
import path from 'path';                      
import bodyParser from 'body-parser';       
import { fileURLToPath } from 'url';          
import { config } from './config/config.js'; 
import { createDirectories } from './utils/fileUtils.js'; 

// 2. CONFIGURAR __dirname PARA ES MODULES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. CRIAR APLICAÇÃO EXPRESS
const app = express();
const PORT = config.server.port;

// 4. CONFIGURAÇÕES DO EXPRESS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, config.paths.views));

app.use(express.static(path.join(__dirname, config.paths.public)));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 5. ROTAS BÁSICAS
app.get('/', (req, res) => {
    console.log('📖 Usuário acessou a página inicial');
    res.send(`
        <h1>🏠 ${config.app.name}</h1>
        <p>Servidor funcionando perfeitamente com <strong>ES Modules</strong>! 🚀</p>
        <p>Versão: ${config.app.version}</p>
        <p>Ambiente: ${config.server.environment}</p>
        <p>Em breve teremos a interface completa...</p>
        <style>
            body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                max-width: 700px; 
                margin: 50px auto; 
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            h1 { 
                color: #fff; 
                margin-bottom: 20px;
                font-size: 2.5em;
            }
            p { 
                font-size: 1.1em; 
                margin: 15px 0;
                opacity: 0.9;
            }
            strong { color: #FFD700; }
        </style>
    `);
});

app.get('/teste', (req, res) => {
    res.json({ 
        status: 'success', 
        message: '✅ API funcionando com ES Modules!',
        timestamp: new Date().toISOString(),
        config: {
            name: config.app.name,
            version: config.app.version,
            environment: config.server.environment
        }
    });
});

// 6. INICIAR SERVIDOR
async function startServer() {
    try {
        await createDirectories([
            config.paths.public,
            config.paths.views, 
            config.paths.data,
            'public/css',
            'public/js',
            'config',
            'utils'
        ]);

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n🚀 === BIBLIOTECA DE PROMPTS INICIADA ===');
            console.log(`📡 Servidor rodando em: http://localhost:${PORT}`);
            console.log(`🧪 Teste da API: http://localhost:${PORT}/teste`);
            console.log(`⚡ Usando ES Modules (sintaxe moderna)`);
            console.log(`🌍 Ambiente: ${config.server.environment}`);
            console.log('💡 Pressione Ctrl+C para parar o servidor\n');
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Chamar função de inicialização
startServer();

// 7. TRATAMENTO DE ERROS
process.on('uncaughtException', (err) => {
    console.error('❌ Erro não tratado:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Promise rejeitada:', err);
    process.exit(1);
});