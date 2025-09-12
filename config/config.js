// ===== CONFIGURAÇÕES DA APLICAÇÃO =====

export const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },

  // Configurações da aplicação
  app: {
    name: 'Biblioteca Pessoal de Prompts',
    version: '1.0.0',
    description: 'Plataforma para criar, organizar e reutilizar prompts de IA'
  },

  // Configurações de paths
  paths: {
    views: 'views',
    public: 'public',
    data: 'data'
  },

  // Configurações de dados
  data: {
    promptsFile: 'data/prompts.json',
    categoriesFile: 'data/categories.json'
  }
};

// Categorias padrão do sistema
export const defaultCategories = [
  { id: 1, name: 'Estudos', icon: '📚', color: '#3498db' },
  { id: 2, name: 'Marketing', icon: '📈', color: '#e74c3c' },
  { id: 3, name: 'Programação', icon: '💻', color: '#2ecc71' },
  { id: 4, name: 'Atendimento', icon: '🎧', color: '#f39c12' },
  { id: 5, name: 'Criatividade', icon: '🎨', color: '#9b59b6' }
];

// Tons disponíveis para os prompts
export const availableTones = [
  'Formal',
  'Criativo', 
  'Instrutivo',
  'Persuasivo',
  'Casual',
  'Técnico'
];