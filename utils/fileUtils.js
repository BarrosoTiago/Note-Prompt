// ===== UTILITÁRIOS PARA TRABALHAR COM ARQUIVOS =====

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lê um arquivo JSON e retorna os dados parseados
 * @param {string} filePath - Caminho para o arquivo
 * @returns {Promise<Object|Array>} Dados do arquivo JSON
 */
export async function readJSONFile(filePath) {
  try {
    const fullPath = path.resolve(__dirname, '..', filePath);
    const data = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`📄 Arquivo ${filePath} não encontrado, criando arquivo vazio...`);
      return [];
    }
    throw new Error(`Erro ao ler arquivo ${filePath}: ${error.message}`);
  }
}

/**
 * Escreve dados em um arquivo JSON
 * @param {string} filePath - Caminho para o arquivo
 * @param {Object|Array} data - Dados para escrever
 */
export async function writeJSONFile(filePath, data) {
  try {
    const fullPath = path.resolve(__dirname, '..', filePath);
    
    // Criar diretório se não existir
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Escrever arquivo com formatação bonita
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Arquivo ${filePath} salvo com sucesso`);
  } catch (error) {
    throw new Error(`Erro ao escrever arquivo ${filePath}: ${error.message}`);
  }
}

/**
 * Verifica se um arquivo existe
 * @param {string} filePath - Caminho para o arquivo
 * @returns {Promise<boolean>} True se o arquivo existe
 */
export async function fileExists(filePath) {
  try {
    const fullPath = path.resolve(__dirname, '..', filePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Cria a estrutura de diretórios necessária
 * @param {string[]} directories - Lista de diretórios para criar
 */
export async function createDirectories(directories) {
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`📁 Diretório criado/verificado: ${dir}`);
    } catch (error) {
      console.error(`❌ Erro ao criar diretório ${dir}:`, error.message);
    }
  }
}