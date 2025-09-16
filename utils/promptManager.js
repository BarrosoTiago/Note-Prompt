// ===== GERENCIADOR DE PROMPTS =====
// Este módulo é responsável por todas as operações relacionadas aos prompts

import { readJSONFile, writeJSONFile, fileExists } from './fileUtils.js';
import { config, defaultCategories } from '../config/config.js';
// Removido import do uuid pois criamos função própria

/**
 * Gera um ID único simples (substituto do uuid)
 * @returns {string} ID único
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Estrutura padrão de um prompt
 * @param {Object} promptData - Dados do prompt
 * @returns {Object} Prompt formatado
 */
function createPromptStructure(promptData) {
  const now = new Date().toISOString();
  
  return {
    id: promptData.id || generateId(),
    title: promptData.title || '',
    description: promptData.description || '',
    content: promptData.content || '',
    category: promptData.category || 'Geral',
    tags: Array.isArray(promptData.tags) ? promptData.tags : [],
    tone: promptData.tone || 'Neutro',
    createdAt: promptData.createdAt || now,
    updatedAt: now,
    isExample: promptData.isExample || false,
    usageCount: promptData.usageCount || 0
  };
}

/**
 * Carrega todos os prompts do arquivo
 * @returns {Promise<Array>} Lista de prompts
 */
export async function getAllPrompts() {
  try {
    console.log('📂 Carregando prompts...');
    
    const prompts = await readJSONFile(config.data.promptsFile);
    
    // Se arquivo está vazio, criar prompts de exemplo
    if (!prompts || prompts.length === 0) {
      console.log('📝 Criando prompts de exemplo...');
      const examplePrompts = createExamplePrompts();
      await writeJSONFile(config.data.promptsFile, examplePrompts);
      return examplePrompts;
    }
    
    console.log(`✅ ${prompts.length} prompts carregados`);
    return prompts;
  } catch (error) {
    console.error('❌ Erro ao carregar prompts:', error);
    throw error;
  }
}

/**
 * Busca um prompt específico por ID
 * @param {string} id - ID do prompt
 * @returns {Promise<Object|null>} Prompt encontrado ou null
 */
export async function getPromptById(id) {
  try {
    const prompts = await getAllPrompts();
    const prompt = prompts.find(p => p.id === id);
    
    if (prompt) {
      console.log(`📋 Prompt encontrado: ${prompt.title}`);
      return prompt;
    } else {
      console.log(`⚠️ Prompt não encontrado: ${id}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar prompt:', error);
    throw error;
  }
}

/**
 * Cria um novo prompt
 * @param {Object} promptData - Dados do novo prompt
 * @returns {Promise<Object>} Prompt criado
 */
export async function createPrompt(promptData) {
  try {
    console.log('➕ Criando novo prompt...');
    
    // Validar dados obrigatórios
    if (!promptData.title || !promptData.content) {
      throw new Error('Título e conteúdo são obrigatórios');
    }
    
    // Criar estrutura do prompt
    const newPrompt = createPromptStructure(promptData);
    
    // Carregar prompts existentes
    const prompts = await getAllPrompts();
    
    // Adicionar novo prompt
    prompts.push(newPrompt);
    
    // Salvar no arquivo
    await writeJSONFile(config.data.promptsFile, prompts);
    
    console.log(`✅ Prompt criado: ${newPrompt.title}`);
    return newPrompt;
  } catch (error) {
    console.error('❌ Erro ao criar prompt:', error);
    throw error;
  }
}

/**
 * Atualiza um prompt existente
 * @param {string} id - ID do prompt
 * @param {Object} updateData - Dados para atualizar
 * @returns {Promise<Object|null>} Prompt atualizado ou null
 */
export async function updatePrompt(id, updateData) {
  try {
    console.log(`📝 Atualizando prompt: ${id}`);
    
    const prompts = await getAllPrompts();
    const promptIndex = prompts.findIndex(p => p.id === id);
    
    if (promptIndex === -1) {
      console.log(`⚠️ Prompt não encontrado para atualização: ${id}`);
      return null;
    }
    
    // Manter dados originais e atualizar apenas os novos
    const updatedPrompt = createPromptStructure({
      ...prompts[promptIndex],
      ...updateData,
      id: prompts[promptIndex].id, // Garantir que ID não muda
      createdAt: prompts[promptIndex].createdAt // Manter data de criação
    });
    
    prompts[promptIndex] = updatedPrompt;
    
    await writeJSONFile(config.data.promptsFile, prompts);
    
    console.log(`✅ Prompt atualizado: ${updatedPrompt.title}`);
    return updatedPrompt;
  } catch (error) {
    console.error('❌ Erro ao atualizar prompt:', error);
    throw error;
  }
}

/**
 * Remove um prompt
 * @param {string} id - ID do prompt
 * @returns {Promise<boolean>} True se removido com sucesso
 */
export async function deletePrompt(id) {
  try {
    console.log(`🗑️ Removendo prompt: ${id}`);
    
    const prompts = await getAllPrompts();
    const initialLength = prompts.length;
    const filteredPrompts = prompts.filter(p => p.id !== id);
    
    if (filteredPrompts.length === initialLength) {
      console.log(`⚠️ Prompt não encontrado para remoção: ${id}`);
      return false;
    }
    
    await writeJSONFile(config.data.promptsFile, filteredPrompts);
    
    console.log(`✅ Prompt removido com sucesso`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover prompt:', error);
    throw error;
  }
}

/**
 * Busca prompts com filtros
 * @param {Object} filters - Filtros de busca
 * @returns {Promise<Array>} Prompts filtrados
 */
export async function searchPrompts(filters = {}) {
  try {
    console.log('🔍 Buscando prompts com filtros:', filters);
    
    let prompts = await getAllPrompts();
    
    // Filtrar por termo de busca (título, descrição, conteúdo)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      prompts = prompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchTerm) ||
        prompt.description.toLowerCase().includes(searchTerm) ||
        prompt.content.toLowerCase().includes(searchTerm) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filtrar por categoria
    if (filters.category) {
      prompts = prompts.filter(prompt => prompt.category === filters.category);
    }
    
    // Filtrar por tom
    if (filters.tone) {
      prompts = prompts.filter(prompt => prompt.tone === filters.tone);
    }
    
    // Filtrar por tag
    if (filters.tag) {
      prompts = prompts.filter(prompt => 
        prompt.tags.includes(filters.tag)
      );
    }
    
    // Ordenar resultados
    const sortBy = filters.sortBy || 'updatedAt';
    const sortOrder = filters.sortOrder || 'desc';
    
    prompts.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
          break;
        case 'usageCount':
          comparison = a.usageCount - b.usageCount;
          break;
        default:
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    console.log(`✅ ${prompts.length} prompts encontrados`);
    return prompts;
  } catch (error) {
    console.error('❌ Erro ao buscar prompts:', error);
    throw error;
  }
}

/**
 * Incrementa contador de uso de um prompt
 * @param {string} id - ID do prompt
 * @returns {Promise<Object|null>} Prompt atualizado
 */
export async function incrementUsage(id) {
  try {
    const prompt = await getPromptById(id);
    if (!prompt) return null;
    
    return await updatePrompt(id, {
      usageCount: (prompt.usageCount || 0) + 1
    });
  } catch (error) {
    console.error('❌ Erro ao incrementar uso:', error);
    throw error;
  }
}

/**
 * Obtém estatísticas dos prompts
 * @returns {Promise<Object>} Estatísticas
 */
export async function getPromptsStats() {
  try {
    const prompts = await getAllPrompts();
    
    const stats = {
      total: prompts.length,
      categories: {},
      tones: {},
      tags: {},
      totalUsage: prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0),
      mostUsed: prompts.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 5),
      recent: prompts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)
    };
    
    // Contar categorias
    prompts.forEach(prompt => {
      stats.categories[prompt.category] = (stats.categories[prompt.category] || 0) + 1;
    });
    
    // Contar tons
    prompts.forEach(prompt => {
      stats.tones[prompt.tone] = (stats.tones[prompt.tone] || 0) + 1;
    });
    
    // Contar tags
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => {
        stats.tags[tag] = (stats.tags[tag] || 0) + 1;
      });
    });
    
    return stats;
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    throw error;
  }
}

/**
 * Cria prompts de exemplo para inicializar o sistema
 * @returns {Array} Lista de prompts de exemplo
 */
function createExamplePrompts() {
  const examples = [
    {
      title: 'Resumo de Artigo Acadêmico',
      description: 'Cria resumos concisos de artigos científicos mantendo os pontos principais',
      content: 'Resuma o seguinte artigo acadêmico em 3 pontos principais, mantendo o tom científico e destacando:\n\n1. Objetivo principal do estudo\n2. Metodologia utilizada\n3. Conclusões e implicações\n\nArtigo: [COLAR TEXTO DO ARTIGO AQUI]\n\nFormato: Use marcadores para cada ponto e seja conciso mas informativo.',
      category: 'Estudos',
      tags: ['resumo', 'acadêmico', 'pesquisa', 'científico'],
      tone: 'Formal',
      isExample: true
    },
    {
      title: 'Post Criativo para Instagram',
      description: 'Gera posts envolventes para Instagram com hooks, emojis e hashtags',
      content: 'Crie um post para Instagram sobre [TEMA/PRODUTO] seguindo esta estrutura:\n\n📱 HOOK inicial (primeira linha que prende atenção)\n💡 Desenvolvimento do tema (2-3 frases explicativas)\n🎯 Call-to-action no final\n\nUse:\n- Emojis relevantes\n- Tom [casual/profissional]\n- 5-7 hashtags populares\n- Máximo 150 palavras\n\nObjetivo: [engajar/vender/informar/educar]',
      category: 'Marketing',
      tags: ['instagram', 'redes sociais', 'post', 'engajamento'],
      tone: 'Criativo',
      isExample: true
    },
    {
      title: 'Debug e Análise de Código',
      description: 'Analisa códigos em busca de bugs, melhorias de performance e boas práticas',
      content: 'Analise o seguinte código [LINGUAGEM] e forneça:\n\n🔍 **ANÁLISE DE BUGS:**\n- Possíveis erros de lógica\n- Problemas de sintaxe\n- Casos extremos não tratados\n\n⚡ **OTIMIZAÇÃO:**\n- Melhorias de performance\n- Refatoração sugerida\n- Padrões mais eficientes\n\n✅ **BOAS PRÁTICAS:**\n- Convenções de nomenclatura\n- Estrutura do código\n- Documentação necessária\n\nCódigo:\n[COLAR CÓDIGO AQUI]',
      category: 'Programação',
      tags: ['debug', 'código', 'programação', 'otimização'],
      tone: 'Técnico',
      isExample: true
    },
    {
      title: 'E-mail Profissional Personalizado',
      description: 'Redige e-mails profissionais para diferentes contextos e destinatários',
      content: 'Redija um e-mail profissional com os seguintes parâmetros:\n\n📧 **CONTEXTO:**\nDestinatário: [NOME/CARGO]\nAssunto: [TEMA PRINCIPAL]\nObjetivo: [informar/solicitar/agradecer/resolver]\nTom: [formal/cordial/urgente]\n\n📝 **ESTRUTURA:**\n- Saudação adequada ao contexto\n- Introdução clara do motivo\n- Desenvolvimento organizado\n- Call-to-action específico\n- Fechamento profissional\n\n⏰ Urgência: [baixa/média/alta]\n🎯 Resultado esperado: [DESCREVER]',
      category: 'Atendimento',
      tags: ['email', 'comunicação', 'profissional', 'negócios'],
      tone: 'Formal',
      isExample: true
    },
    {
      title: 'Brainstorm de Ideias Criativas',
      description: 'Gera múltiplas ideias criativas para projetos, campanhas ou soluções',
      content: 'Faça um brainstorm criativo sobre [TEMA/DESAFIO] gerando:\n\n💡 **10 IDEIAS PRINCIPAIS:**\n(Numere de 1-10, seja específico e criativo)\n\n🎨 **3 CONCEITOS INOVADORES:**\n- Ideia disruptiva 1: [explicação]\n- Abordagem inusitada 2: [explicação] \n- Solução criativa 3: [explicação]\n\n🎯 **CRITÉRIOS:**\n- Público-alvo: [DEFINIR]\n- Orçamento: [baixo/médio/alto]\n- Prazo: [DEFINIR]\n- Objetivo: [DEFINIR]\n\nPense fora da caixa e explore diferentes ângulos!',
      category: 'Criatividade',
      tags: ['brainstorm', 'ideias', 'criatividade', 'inovação'],
      tone: 'Criativo',
      isExample: true
    }
  ];
  
  return examples.map(prompt => createPromptStructure(prompt));
}