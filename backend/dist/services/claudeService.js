"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.extractReferences = exports.analyzeArticles = exports.processQuery = exports.checkConnection = void 0;
const sdk_1 = require("@anthropic-ai/sdk");
const node_cache_1 = __importDefault(require("node-cache"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("../config/config"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../config/logger"));
// Configurar variables de entorno
dotenv_1.default.config();
// Configuración de caché
const cache = new node_cache_1.default({ stdTTL: 3600 }); // 1 hour TTL
// Prompt del sistema para tareas de estrategia de búsqueda
const systemPrompt = `
  Eres un asistente especializado en búsquedas médicas.
  Tu tarea es analizar consultas médicas y sugerir estrategias de búsqueda.
  
  Responde en formato JSON con:
  {
    "concepts": [
      {
        "original": "término original",
        "translated": "término en inglés",
        "meshTerm": "término MeSH si existe",
        "explanation": "explicación del concepto"
      }
    ],
    "strategy": "estrategia de búsqueda sugerida"
  }
`;
const anthropic = new sdk_1.Anthropic({
    apiKey: config_1.default.claude.apiKey
});
// Verificar conexión con Claude
const checkConnection = async () => {
    try {
        const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
            model: config_1.default.claude.model,
            max_tokens: 10,
            messages: [{
                    role: 'user',
                    content: 'Test connection'
                }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config_1.default.claude.apiKey,
                'anthropic-version': '2023-06-01'
            }
        });
        return response.status === 200;
    }
    catch (error) {
        console.error('Error al verificar conexión con Claude:', error);
        return false;
    }
};
exports.checkConnection = checkConnection;
// Procesar consulta
const processQuery = async (query) => {
    try {
        logger_1.default.info(`Procesando consulta: ${query}`);
        const message = await anthropic.messages.create({
            model: config_1.default.claude.model,
            max_tokens: 1000,
            messages: [{
                    role: 'user',
                    content: `Analiza la siguiente consulta médica y proporciona un análisis detallado:
          Consulta: ${query}
          
          Por favor, incluye:
          1. Análisis de los términos médicos
          2. Sugerencias de términos MeSH relacionados
          3. Posibles estrategias de búsqueda`
                }]
        });
        return {
            query,
            analysis: message.content[0].text
        };
    }
    catch (error) {
        logger_1.default.error('Error al procesar la consulta:', error);
        throw error;
    }
};
exports.processQuery = processQuery;
// Analizar artículos
const analyzeArticles = async (articles, query) => {
    try {
        const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
            model: config_1.default.claude.model,
            messages: [
                {
                    role: 'user',
                    content: `Analiza los siguientes artículos en relación a la consulta: "${query}"\n\n${JSON.stringify(articles)}`
                }
            ]
        }, {
            headers: {
                'x-api-key': config_1.default.claude.apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });
        // Procesar la respuesta y devolver los artículos rankeados
        return articles.map(article => ({
            article,
            score: Math.random(), // Placeholder - implementar lógica real de scoring
            explanation: 'Análisis realizado por Claude'
        }));
    }
    catch (error) {
        console.error('Error al analizar artículos:', error);
        throw error;
    }
};
exports.analyzeArticles = analyzeArticles;
// Extraer referencias
const extractReferences = async (articles) => {
    try {
        const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
            model: config_1.default.claude.model,
            messages: [
                {
                    role: 'user',
                    content: `Extrae las referencias de los siguientes artículos:\n\n${JSON.stringify(articles)}`
                }
            ]
        }, {
            headers: {
                'x-api-key': config_1.default.claude.apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });
        // Procesar la respuesta y devolver las referencias
        return []; // Placeholder - implementar lógica real de extracción
    }
    catch (error) {
        console.error('Error al extraer referencias:', error);
        throw error;
    }
};
exports.extractReferences = extractReferences;
// Limpiar caché
const clearCache = () => {
    cache.flushAll();
    console.log('Caché limpiada');
};
exports.clearCache = clearCache;
//# sourceMappingURL=claudeService.js.map