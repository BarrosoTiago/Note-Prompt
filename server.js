// ===== BIBLIOTECA PESSOAL DE PROMPTS =====
// Servidor principal da aplicação

// 1. IMPORTAR DEPENDÊNCIAS (ES Modules)
import express from 'express';                // Framework web para Node.js
import path from 'path';                      // Utilitário para trabalhar com caminhos
import bodyParser from 'body-parser';        // Para processar dados de formulários
import expressLayouts from 'express-ejs-layouts'; // Para usar layouts EJS
import { fileURLToPath } from 'url';          // Para trabalhar com __dirname em ES Modules
import { config } from './config/config.js'; // Configurações da aplicação
import { createDirectories } from './utils/fileUtils.js'; // Utilitários de arquivo

// 2. CONFIGURAR __dirname PARA ES MODULES
// Em ES Modules, __dirname não existe nativamente, então criamos manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. CRIAR APLICAÇÃO EXPRESS
const app = express();
const PORT = config.server.port;

// 4. CONFIGURAÇÕES DO EXPRESS
// Definir EJS como engine de templates (para criar páginas dinâmicas)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, config.paths.views));

// Configurar layouts EJS
app.use(expressLayouts);
app.set('layout', 'layout'); // arquivo layout.ejs como padrão
app.set('layout extractScripts', true); // extrair scripts para o final
app.set('layout extractStyles', true);  // extrair estilos para o head

// Middleware para servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, config.paths.public)));

// Middleware para processar dados de formulários
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 5. ROTAS BÁSICAS
// Rota principal - página inicial
app.get('/', async (req, res) => {
    console.log('📖 Usuário acessou a página inicial');
    
    try {
        // Dados exemplo para a página inicial
        const examplePrompts = [
            {
                emoji: '📚',
                title: 'Resumo de Artigo',
                category: 'Estudos',
                categoryColor: '#3498db',
                description: 'Resuma textos acadêmicos mantendo os pontos principais',
                content: 'Resuma o seguinte artigo em 3 pontos principais, mantendo o tom acadêmico e destacando as conclusões mais importantes: [TEXTO DO ARTIGO]',
                tone: 'Acadêmico'
            },
            {
                emoji: '📈',
                title: 'Post para Instagram',
                category: 'Marketing', 
                categoryColor: '#e74c3c',
                description: 'Crie posts envolventes para redes sociais',
                content: 'Crie um post para Instagram sobre [TEMA] que seja envolvente, use emojis relevantes e inclua 5 hashtags populares. O tom deve ser [casual/profissional] e o objetivo é [engajar/vender/informar].',
                tone: 'Criativo'
            },
            {
                emoji: '💻',
                title: 'Debug de Código',
                category: 'Programação',
                categoryColor: '#2ecc71', 
                description: 'Analise e corrija erros em códigos de programação',
                content: 'Analise o seguinte código [LINGUAGEM] e identifique possíveis bugs, problemas de performance ou melhorias. Explique cada problema e sugira a correção: [CÓDIGO]',
                tone: 'Técnico'
            },
            {
                emoji: '✉️',
                title: 'E-mail Profissional',
                category: 'Atendimento',
                categoryColor: '#f39c12',
                description: 'Redija e-mails profissionais para diferentes situações',
                content: 'Redija um e-mail profissional para [DESTINATÁRIO] sobre [ASSUNTO]. O tom deve ser [formal/cordial] e o objetivo é [informar/solicitar/agradecer]. Inclua uma saudação apropriada e fechamento adequado.',
                tone: 'Formal'
            }
        ];

        // Dados para o template
        const templateData = {
            title: 'Início - Biblioteca Pessoal de Prompts',
            description: 'Organize e reutilize seus prompts de IA em um só lugar. Crie, salve e encontre rapidamente seus melhores prompts.',
            currentPage: 'home',
            examplePrompts: examplePrompts,
            totalPrompts: 156, // Dados fictícios por enquanto
            totalCategories: 5,
            breadcrumb: [] // Página inicial não precisa de breadcrumb
        };

        res.render('index', templateData);
    } catch (error) {
        console.error('❌ Erro ao renderizar página inicial:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota de teste para verificar se está tudo funcionando
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
// Função assíncrona para inicializar a aplicação
async function startServer() {
    try {
        // Criar diretórios necessários
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