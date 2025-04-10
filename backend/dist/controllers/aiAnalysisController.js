"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractReferencesController = exports.analyzeArticlesController = exports.getReferences = exports.analyzeSearchResults = exports.generateArticleSummary = exports.extractArticleReferences = exports.rankArticles = exports.analyzeQuery = exports.checkAIService = void 0;
const claudeService_1 = require("../services/claudeService");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../config/logger"));
const checkAIService = async (req, res) => {
    try {
        const isConnected = await (0, claudeService_1.checkConnection)();
        if (!isConnected) {
            return res.status(503).json({
                success: false,
                error: 'No se pudo conectar con el servicio de IA',
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            message: 'Servicio de IA disponible',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error al verificar el servicio de IA:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            timestamp: new Date().toISOString()
        });
    }
};
exports.checkAIService = checkAIService;
const analyzeQuery = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            return apiResponse_1.ApiResponseBuilder.error(res, 'Se requiere una consulta válida', 400);
        }
        const analysis = {
            query,
            analysis: 'Análisis pendiente de implementación'
        };
        return apiResponse_1.ApiResponseBuilder.success(res, analysis);
    }
    catch (error) {
        logger_1.default.error('Error al analizar consulta:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al analizar consulta', 500);
    }
};
exports.analyzeQuery = analyzeQuery;
const rankArticles = async (req, res) => {
    try {
        const { articles, query } = req.body;
        if (!Array.isArray(articles) || !query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Se requieren artículos válidos y una consulta',
                timestamp: new Date().toISOString()
            });
        }
        console.log(`Rankeando ${articles.length} artículos`);
        const rankedArticles = await (0, claudeService_1.analyzeArticles)(articles, query);
        const response = {
            success: true,
            data: rankedArticles,
            timestamp: new Date().toISOString()
        };
        return res.json(response);
    }
    catch (error) {
        console.error('Error al rankear artículos:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al rankear los artículos',
            timestamp: new Date().toISOString()
        });
    }
};
exports.rankArticles = rankArticles;
const extractArticleReferences = async (req, res) => {
    try {
        const { articles } = req.body;
        if (!Array.isArray(articles)) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere una lista de artículos válida',
                timestamp: new Date().toISOString()
            });
        }
        console.log(`Extrayendo referencias de ${articles.length} artículos`);
        const references = await (0, claudeService_1.extractReferences)(articles);
        const response = {
            success: true,
            data: references,
            timestamp: new Date().toISOString()
        };
        return res.json(response);
    }
    catch (error) {
        console.error('Error al extraer referencias:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al extraer las referencias',
            timestamp: new Date().toISOString()
        });
    }
};
exports.extractArticleReferences = extractArticleReferences;
const generateArticleSummary = async (req, res) => {
    try {
        const { article } = req.body;
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'No se ha configurado la clave de API de Claude',
                timestamp: new Date().toISOString()
            });
        }
        if (!article || typeof article !== 'object') {
            return res.status(400).json({
                error: 'Se requiere un artículo',
                timestamp: new Date().toISOString()
            });
        }
        console.log(`Generando resumen para: "${article.title}"`);
        const summary = await (0, claudeService_1.analyzeArticles)(article, apiKey);
        if (!summary) {
            return res.status(500).json({
                error: 'Error al generar el resumen',
                timestamp: new Date().toISOString()
            });
        }
        const response = {
            articleId: article.pmid,
            summary: summary[0].explanation,
            processingTime: 0,
            timestamp: new Date().toISOString()
        };
        return res.json(response);
    }
    catch (error) {
        console.error('Error en generateArticleSummary:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            timestamp: new Date().toISOString()
        });
    }
};
exports.generateArticleSummary = generateArticleSummary;
const analyzeSearchResults = async (req, res) => {
    try {
        const { articles, query } = req.body;
        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Se requieren artículos para el análisis',
                timestamp: new Date().toISOString()
            });
            return;
        }
        if (!query || typeof query !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Se requiere una consulta para el análisis',
                timestamp: new Date().toISOString()
            });
            return;
        }
        const cleanQuery = query.trim();
        const rankedArticles = await (0, claudeService_1.analyzeArticles)(articles, cleanQuery);
        const response = {
            articleId: articles[0].pmid,
            summary: rankedArticles[0].explanation,
            processingTime: 0,
            timestamp: new Date().toISOString()
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error en analyzeSearchResults:', error);
        res.status(500).json({
            success: false,
            message: 'Error al analizar los resultados de búsqueda',
            timestamp: new Date().toISOString()
        });
    }
};
exports.analyzeSearchResults = analyzeSearchResults;
const getReferences = async (req, res) => {
    try {
        const { articles } = req.body;
        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Se requieren artículos para extraer referencias',
                timestamp: new Date().toISOString()
            });
            return;
        }
        const references = await (0, claudeService_1.extractReferences)(articles);
        const response = {
            articleId: articles[0].pmid,
            references: references,
            processingTime: 0,
            timestamp: new Date().toISOString()
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error en getReferences:', error);
        res.status(500).json({
            success: false,
            message: 'Error al extraer las referencias',
            timestamp: new Date().toISOString()
        });
    }
};
exports.getReferences = getReferences;
const analyzeArticlesController = async (req, res) => {
    try {
        const { articles, query } = req.body;
        if (!articles || !Array.isArray(articles)) {
            return apiResponse_1.ApiResponseBuilder.error(res, 'Se requiere un array de artículos válido', 400);
        }
        if (!query || typeof query !== 'string') {
            return apiResponse_1.ApiResponseBuilder.error(res, 'Se requiere una consulta válida', 400);
        }
        const analysis = await (0, claudeService_1.analyzeArticles)(articles, query);
        return apiResponse_1.ApiResponseBuilder.success(res, analysis);
    }
    catch (error) {
        logger_1.default.error('Error al analizar artículos:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al analizar artículos', 500);
    }
};
exports.analyzeArticlesController = analyzeArticlesController;
const extractReferencesController = async (req, res) => {
    try {
        const { article } = req.body;
        if (!article || typeof article !== 'object') {
            return apiResponse_1.ApiResponseBuilder.error(res, 'Se requiere un artículo válido', 400);
        }
        const references = await (0, claudeService_1.extractReferences)(article);
        return apiResponse_1.ApiResponseBuilder.success(res, { references });
    }
    catch (error) {
        logger_1.default.error('Error al extraer referencias:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al extraer referencias', 500);
    }
};
exports.extractReferencesController = extractReferencesController;
//# sourceMappingURL=aiAnalysisController.js.map