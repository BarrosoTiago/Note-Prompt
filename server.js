// ===== BIBLIOTECA PESSOAL DE PROMPTS =====
// Servidor principal da aplicação

// 1. IMPORTAR DEPENDÊNCIAS (ES Modules)
import express from 'express';                // Framework web para Node.js
import path from 'path';                      // Utilitário para trabalhar com caminhos
import bodyParser from 'body-parser';        // Para processar dados de formulários
import expressLayouts from 'express-ejs-layouts'; // Para usar layouts EJS
import { fileURLToPath } from 'url';          // Para trabalhar com __dirname em ES Modules
import { config, defaultCategories, availableTones } from './config/config.js'; // Configurações da aplicação
import { createDirectories } from './utils/fileUtils.js'; // Utilitários de arquivo
import * as promptManager from './utils/promptManager.js'; // Gerenciador de prompts

// 2. CONFIGURAR __dirname PARA ES MODULES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. CRIAR APLICAÇÃO EXPRESS
const app = express();
const PORT = config.server.port;

// 4. CONFIGURAÇÕES DO EXPRESS
// Definir EJS como engine de templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, config.paths.views));

// Configurar layouts EJS
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, config.paths.public)));

// Middleware para processar dados de formulários
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
    next();
});

// 5. ROTAS PRINCIPAIS

// ===== PÁGINA INICIAL =====
app.get('/', async (req, res) => {
    console.log('📖 Usuário acessou a página inicial');
    
    try {
        // Carregar prompts de exemplo para mostrar na homepage
        const allPrompts = await promptManager.getAllPrompts();
        const examplePrompts = allPrompts
            .filter(p => p.isExample)
            .slice(0, 4); // Mostrar apenas 4 exemplos
        
        // Obter estatísticas
        const stats = await promptManager.getPromptsStats();
        
        // Dados para o template
        const templateData = {
            title: 'Início - Biblioteca Pessoal de Prompts',
            description: 'Organize e reutilize seus prompts de IA em um só lugar. Crie, salve e encontre rapidamente seus melhores prompts.',
            currentPage: 'home',
            examplePrompts: examplePrompts,
            totalPrompts: stats.total,
            totalCategories: Object.keys(stats.categories).length,
            breadcrumb: []
        };

        res.render('index', templateData);
    } catch (error) {
        console.error('❌ Erro ao renderizar página inicial:', error);
        res.status(500).render('error', { 
            title: 'Erro', 
            message: 'Erro interno do servidor',
            error: config.server.environment === 'development' ? error : {}
        });
    }
});

// ===== MINHA BIBLIOTECA =====
app.get('/biblioteca', async (req, res) => {
    console.log('📚 Usuário acessou Minha Biblioteca');
    
    try {
        // Parâmetros de busca e filtros da query string
        const filters = {
            search: req.query.search || '',
            category: req.query.category || '',
            tone: req.query.tone || '',
            tag: req.query.tag || '',
            sortBy: req.query.sortBy || 'updatedAt',
            sortOrder: req.query.sortOrder || 'desc'
        };
        
        // Buscar prompts com filtros
        const prompts = await promptManager.searchPrompts(filters);
        
        // Obter estatísticas para sidebar
        const stats = await promptManager.getPromptsStats();
        
        const templateData = {
            title: 'Minha Biblioteca - Biblioteca de Prompts',
            description: 'Todos os seus prompts organizados em um só lugar',
            currentPage: 'biblioteca',
            prompts: prompts,
            filters: filters,
            categories: defaultCategories,
            availableTones: availableTones,
            stats: stats,
            breadcrumb: [
                { name: 'Minha Biblioteca', url: '/biblioteca' }
            ]
        };

        res.render('biblioteca', templateData);
    } catch (error) {
        console.error('❌ Erro ao carregar biblioteca:', error);
        res.status(500).render('error', { 
            title: 'Erro', 
            message: 'Erro ao carregar biblioteca',
            error: config.server.environment === 'development' ? error : {}
        });
    }
});

// ===== CRIAR PROMPT =====
app.get('/criar', async (req, res) => {
    console.log('➕ Usuário acessou Criar Prompt');
    
    try {
        const templateData = {
            title: 'Criar Prompt - Biblioteca de Prompts',
            description: 'Crie um novo prompt para sua biblioteca',
            currentPage: 'criar',
            categories: defaultCategories,
            availableTones: availableTones,
            breadcrumb: [
                { name: 'Criar Prompt', url: '/criar' }
            ]
        };

        res.render('criar', templateData);
    } catch (error) {
        console.error('❌ Erro ao carregar página de criação:', error);
        res.status(500).render('error', { 
            title: 'Erro', 
            message: 'Erro ao carregar página',
            error: config.server.environment === 'development' ? error : {}
        });
    }
});

// ===== API ROUTES =====

// Criar novo prompt
app.post('/api/prompts', async (req, res) => {
    try {
        console.log('📝 Criando novo prompt via API:', req.body.title);
        
        const promptData = {
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category,
            tags: Array.isArray(req.body.tags) ? req.body.tags : 
                  req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            tone: req.body.tone
        };
        
        const newPrompt = await promptManager.createPrompt(promptData);
        
        res.status(201).json({
            success: true,
            message: 'Prompt criado com sucesso!',
            data: newPrompt
        });
    } catch (error) {
        console.error('❌ Erro na API criar prompt:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Obter prompt por ID
app.get('/api/prompts/:id', async (req, res) => {
    try {
        const prompt = await promptManager.getPromptById(req.params.id);
        
        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: prompt
        });
    } catch (error) {
        console.error('❌ Erro na API obter prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Atualizar prompt
app.put('/api/prompts/:id', async (req, res) => {
    try {
        console.log('📝 Atualizando prompt via API:', req.params.id);
        
        const updateData = {
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category,
            tags: Array.isArray(req.body.tags) ? req.body.tags : 
                  req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            tone: req.body.tone
        };
        
        const updatedPrompt = await promptManager.updatePrompt(req.params.id, updateData);
        
        if (!updatedPrompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt não encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Prompt atualizado com sucesso!',
            data: updatedPrompt
        });
    } catch (error) {
        console.error('❌ Erro na API atualizar prompt:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Deletar prompt
app.delete('/api/prompts/:id', async (req, res) => {
    try {
        console.log('🗑️ Deletando prompt via API:', req.params.id);
        
        const success = await promptManager.deletePrompt(req.params.id);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Prompt não encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Prompt deletado com sucesso!'
        });
    } catch (error) {
        console.error('❌ Erro na API deletar prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Incrementar contador de uso
app.post('/api/prompts/:id/use', async (req, res) => {
    try {
        const updatedPrompt = await promptManager.incrementUsage(req.params.id);
        
        if (!updatedPrompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: updatedPrompt
        });
    } catch (error) {
        console.error('❌ Erro na API incrementar uso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Obter estatísticas
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await promptManager.getPromptsStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('❌ Erro na API obter estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// ===== ROTA DE TESTE =====
app.get('/teste', (req, res) => {
    res.json({ 
        status: 'success', 
        message: '✅ API funcionando com sistema de prompts!',
        timestamp: new Date().toISOString(),
        config: {
            name: config.app.name,
            version: config.app.version,
            environment: config.server.environment
        },
        endpoints: {
            prompts: '/api/prompts',
            stats: '/api/stats'
        }
    });
});

// ===== PÁGINA DE ERRO 404 =====
app.use((req, res) => {
    console.log(`❌ 404 - Página não encontrada: ${req.path}`);
    res.status(404).render('error', {
        title: 'Página não encontrada',
        message: 'A página que você procura não existe',
        error: { status: 404 }
    });
});

// 6. INICIAR SERVIDOR
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

        // Inicializar dados (criar prompts de exemplo se necessário)
        await promptManager.getAllPrompts();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n🚀 === BIBLIOTECA DE PROMPTS INICIADA ===');
            console.log(`📡 Servidor rodando em: http://localhost:${PORT}`);
            console.log(`🧪 Teste da API: http://localhost:${PORT}/teste`);
            console.log(`📚 Biblioteca: http://localhost:${PORT}/biblioteca`);
            console.log(`➕ Criar Prompt: http://localhost:${PORT}/criar`);
            console.log(`⚡ Sistema de dados funcionando!`);
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