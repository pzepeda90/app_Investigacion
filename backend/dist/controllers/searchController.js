"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPubMedController = searchPubMedController;
const pubmedService_1 = require("../services/pubmedService");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../config/logger"));
const meshMapper_1 = require("../utils/meshMapper");
/**
 * Controlador para realizar búsquedas en PubMed
 */
async function searchPubMedController(req, res) {
    try {
        // Recibir parámetros de la consulta
        logger_1.default.info('Parámetros recibidos:', req.query);
        // Extraer query y límite de resultados - usar valor alto por defecto (500)
        const { q: query, limit = 500, useAI } = req.query;
        // Validar la consulta
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return apiResponse_1.ApiResponseBuilder.error(res, 'La consulta no puede estar vacía', 400);
        }
        // Mostrar información sobre el tipo de query y su valor
        logger_1.default.info(`Tipo de query: ${typeof query}, Valor: ${query}`);
        // Determinar si se debe usar IA para la búsqueda
        const useArtificialIntelligence = useAI === '1' || useAI === 'true';
        logger_1.default.info(`Usando IA para generar estrategia: ${useArtificialIntelligence}`);
        logger_1.default.info(`Búsqueda iniciada con query: "${query}"`, {
            service: 'backend-service',
            timestamp: new Date().toISOString()
        });
        // Generar la consulta para PubMed si NO usamos IA (para mostrar en logs)
        // La consulta real se generará dentro de searchPubMed si useAI=true
        if (!useArtificialIntelligence) {
            const pubmedQuery = (0, meshMapper_1.buildComplexPubMedQuery)(query);
            logger_1.default.info(`Consulta PubMed generada: ${pubmedQuery}`);
        }
        // Realizar la búsqueda
        const limitNum = parseInt(typeof limit === 'string' ? limit : String(limit), 10) || 500;
        logger_1.default.info(`Límite de resultados configurado: ${limitNum}`);
        // Realizar la búsqueda con límite explícito
        const searchResult = await (0, pubmedService_1.searchPubMed)(query, limitNum, useArtificialIntelligence);
        // Verificar que tenemos resultados
        if (!searchResult || !searchResult.articles || searchResult.articles.length === 0) {
            logger_1.default.warn(`No se encontraron resultados para la consulta: "${query}"`);
            // Devolver un array vacío con estructura correcta para que el frontend pueda procesarlo
            return apiResponse_1.ApiResponseBuilder.success(res, {
                results: [],
                count: 0,
                totalAvailable: 0,
                isSimulated: false,
                useAI: useArtificialIntelligence,
                query: query,
                searchStrategy: searchResult?.searchStrategy || ''
            });
        }
        logger_1.default.info(`Se encontraron ${searchResult.articles.length} artículos de un total de ${searchResult.totalAvailable}`);
        // Verificar el formato de los autores
        if (searchResult.articles.length > 0) {
            const sampleArticle = searchResult.articles[0];
            logger_1.default.info(`Ejemplo de autores: ${JSON.stringify(sampleArticle.authors)}`);
        }
        // Devolver resultados con formato correcto para el frontend
        return apiResponse_1.ApiResponseBuilder.success(res, {
            results: searchResult.articles,
            count: searchResult.count,
            totalAvailable: searchResult.totalAvailable,
            isSimulated: searchResult.isSimulated,
            useAI: useArtificialIntelligence,
            query: query,
            detectedConcepts: searchResult.detectedConcepts || [],
            searchStrategy: searchResult.searchStrategy || ''
        });
    }
    catch (error) {
        logger_1.default.error('Error en búsqueda:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al procesar la búsqueda', 500);
    }
}
//# sourceMappingURL=searchController.js.map