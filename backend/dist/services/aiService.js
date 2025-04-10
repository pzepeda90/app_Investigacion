"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractReferences = exports.analyzeArticles = exports.generateSummary = exports.rankArticles = exports.generateSearchStrategy = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const logger_1 = __importDefault(require("../config/logger"));
const config_1 = __importDefault(require("../config/config"));
const anthropic = new sdk_1.default({
    apiKey: config_1.default.claude.apiKey,
});
/**
 * Genera una estrategia de búsqueda estructurada para PubMed basada en una pregunta clínica
 * @param clinicalQuestion Pregunta clínica en lenguaje natural
 * @returns Estrategia de búsqueda formateada para PubMed
 */
const generateSearchStrategy = async (clinicalQuestion) => {
    try {
        logger_1.default.info(`Generando estrategia de búsqueda para: "${clinicalQuestion}"`);
        const prompt = `Como experto en búsquedas bibliográficas médicas, crea una estrategia de búsqueda estructurada para PubMed que me ayude a encontrar evidencia científica sobre la siguiente pregunta clínica:

"${clinicalQuestion}"

Basado en la pregunta clínica, identifica:
1. Población o problema
2. Intervención o exposición
3. Comparación (si aplica)
4. Resultado o desenlace

Luego, genera una estrategia de búsqueda avanzada para PubMed siguiendo estas pautas:
- Para cada concepto principal (población, intervención, comparación, resultado):
  * Incluye el término MeSH relevante con etiqueta [Mesh] y utiliza subencabezados [Mesh:NoExp] cuando sea apropiado para aumentar especificidad
  * Utiliza calificadores de términos MeSH como "/etiology", "/epidemiology", "/genetics", etc. cuando sea relevante
  * Incluye 2-3 variantes o sinónimos con etiquetas [tw] o [tiab] específicamente
  * Agrupa cada concepto con paréntesis y conecta con operadores AND
- Utiliza filtros metodológicos cuando sea apropiado (como "Humans"[Mesh], o limitadores de edad como "Child"[Mesh], "Infant"[Mesh], etc.)
- Considera añadir filtros de idioma [lang] solo si es esencial
- El formato debe ser similar a este:
  ("Concepto1"[Mesh] OR "Concepto1/subencabezado"[Mesh] OR "variante1"[tiab] OR "sinónimo1"[tw]) 
  AND ("Concepto2"[Mesh] OR "variante2"[tiab] OR "sinónimo2"[tw]) 
  AND ("Concepto3"[Mesh] OR "variante3"[tiab] OR "sinónimo3"[tw])
  AND Filtros metodológicos si son apropiados
- Mantén la estrategia equilibrada entre especificidad y sensibilidad
- Evita usar términos demasiado genéricos que puedan producir miles de resultados irrelevantes

Tu respuesta debe incluir SOLAMENTE la estrategia de búsqueda formateada para PubMed con el formato exacto que se podría copiar y pegar en PubMed, sin texto adicional.`;
        const message = await anthropic.messages.create({
            model: config_1.default.claude.model,
            max_tokens: 1500,
            temperature: 0.2,
            messages: [{
                    role: 'user',
                    content: prompt
                }]
        });
        // Extraer solo la estrategia de búsqueda y limpiarla
        let searchStrategy = message.content[0].text.trim();
        // Si la respuesta contiene texto adicional, tratar de extraer solo la estrategia
        if (searchStrategy.includes('(') && searchStrategy.includes(')')) {
            // Intentar extraer solo la parte que contiene la sintaxis de PubMed
            const lines = searchStrategy.split('\n');
            const strategyLines = lines.filter(line => (line.includes('[Mesh]') || line.includes('[tw]') || line.includes('[tiab]') ||
                line.includes('AND') || line.includes('OR') || line.includes('[Filter]') ||
                line.includes('[lang]') || line.includes('[Mesh:NoExp]')) &&
                !line.startsWith('#') && !line.startsWith('•'));
            if (strategyLines.length > 0) {
                searchStrategy = strategyLines.join('\n');
            }
        }
        logger_1.default.info(`Estrategia de búsqueda generada: ${searchStrategy}`);
        return searchStrategy;
    }
    catch (error) {
        logger_1.default.error('Error al generar estrategia de búsqueda:', error);
        throw error;
    }
};
exports.generateSearchStrategy = generateSearchStrategy;
const rankArticles = async (articles, query) => {
    try {
        logger_1.default.info('Iniciando ranking de artículos');
        // Implementar lógica de ranking
        return articles;
    }
    catch (error) {
        logger_1.default.error('Error al rankear artículos:', error);
        throw error;
    }
};
exports.rankArticles = rankArticles;
const generateSummary = async (article, apiKey) => {
    try {
        logger_1.default.info(`Generando resumen para artículo: ${article.title}`);
        const message = await anthropic.messages.create({
            model: config_1.default.claude.model,
            max_tokens: 1000,
            messages: [{
                    role: 'user',
                    content: `Por favor, genera un resumen conciso del siguiente artículo científico:
          Título: ${article.title}
          Abstract: ${article.abstract}
          
          El resumen debe incluir:
          1. Objetivo principal del estudio
          2. Metodología utilizada
          3. Resultados principales
          4. Conclusiones clave`
                }]
        });
        return message.content[0].text;
    }
    catch (error) {
        logger_1.default.error('Error al generar resumen:', error);
        throw error;
    }
};
exports.generateSummary = generateSummary;
const analyzeArticles = async (articles, query) => {
    try {
        logger_1.default.info('Analizando artículos');
        // Implementar lógica de análisis
        return {
            relevantArticles: articles,
            analysis: 'Análisis pendiente de implementación'
        };
    }
    catch (error) {
        logger_1.default.error('Error al analizar artículos:', error);
        throw error;
    }
};
exports.analyzeArticles = analyzeArticles;
const extractReferences = async (article) => {
    try {
        logger_1.default.info(`Extrayendo referencias del artículo: ${article.title}`);
        // Implementar lógica de extracción de referencias
        return [];
    }
    catch (error) {
        logger_1.default.error('Error al extraer referencias:', error);
        throw error;
    }
};
exports.extractReferences = extractReferences;
//# sourceMappingURL=aiService.js.map