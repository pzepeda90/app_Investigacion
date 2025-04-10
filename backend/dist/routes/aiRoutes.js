"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aiService_1 = require("../services/aiService");
const express_1 = require("express");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../config/logger"));
const aiAnalysisController_1 = require("../controllers/aiAnalysisController");
const router = (0, express_1.Router)();
/**
 * @route GET /api/ai/health
 * @desc Verifica el estado del servicio de IA
 * @access Public
 */
router.get('/health', (req, res) => {
    try {
        return apiResponse_1.ApiResponseBuilder.success(res, null, 'Servicio de IA funcionando correctamente');
    }
    catch (error) {
        logger_1.default.error('Error al verificar el servicio de IA:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al verificar el servicio de IA', 500);
    }
});
/**
 * @route POST /api/ai/analyze
 * @desc Analizar artículos según una consulta
 * @access Public
 */
router.post('/analyze', async (req, res) => {
    try {
        const { articles, query } = req.body;
        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            return apiResponse_1.ApiResponseBuilder.error(res, 'Se requiere un array de artículos válido', 400);
        }
        if (!query || typeof query !== 'string') {
            return apiResponse_1.ApiResponseBuilder.error(res, 'Se requiere una consulta válida', 400);
        }
        const analysis = await (0, aiService_1.analyzeArticles)(articles, query);
        return apiResponse_1.ApiResponseBuilder.success(res, analysis);
    }
    catch (error) {
        logger_1.default.error('Error al analizar artículos:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al analizar artículos', 500);
    }
});
/**
 * @route POST /api/ai/generate-summary
 * @desc Generar un resumen de un artículo científico
 * @access Public
 */
router.post('/generate-summary', async (req, res) => {
    try {
        const { article } = req.body;
        if (!article || typeof article !== 'object') {
            return apiResponse_1.ApiResponseBuilder.error(res, 'Se requiere un artículo válido', 400);
        }
        const summary = await (0, aiService_1.generateSummary)(article, process.env.CLAUDE_API_KEY || '');
        return apiResponse_1.ApiResponseBuilder.success(res, { summary });
    }
    catch (error) {
        logger_1.default.error('Error al generar resumen:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al generar resumen', 500);
    }
});
/**
 * @route POST /api/ai/extract-references
 * @desc Extraer referencias de un artículo
 * @access Public
 */
router.post('/extract-references', async (req, res) => {
    try {
        const { article } = req.body;
        if (!article || typeof article !== 'object') {
            return apiResponse_1.ApiResponseBuilder.error(res, 'Se requiere un artículo válido', 400);
        }
        const references = await (0, aiService_1.extractReferences)(article);
        return apiResponse_1.ApiResponseBuilder.success(res, { references });
    }
    catch (error) {
        logger_1.default.error('Error al extraer referencias:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al extraer referencias', 500);
    }
});
/**
 * @route POST /api/ai/analyze-query
 * @desc Analizar una consulta médica
 * @access Public
 */
router.post('/analyze-query', aiAnalysisController_1.analyzeQuery);
exports.default = router;
//# sourceMappingURL=aiRoutes.js.map