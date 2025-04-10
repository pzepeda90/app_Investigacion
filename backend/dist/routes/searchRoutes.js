"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const searchController_1 = require("../controllers/searchController");
const express_1 = require("express");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../config/logger"));
const router = (0, express_1.Router)();
/**
 * @route GET /api/search
 * @desc Buscar en PubMed con términos MeSH optimizados para oftalmología
 * @access Public
 */
router.get('/', (req, res) => {
    (0, searchController_1.searchPubMedController)(req, res).catch(error => {
        logger_1.default.error('Error en la ruta de búsqueda:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al procesar la búsqueda', 500);
    });
});
/**
 * @route GET /api/search/health
 * @desc Verificar el estado de salud del servicio de búsqueda
 * @access Public
 */
router.get('/health', (req, res) => {
    try {
        return apiResponse_1.ApiResponseBuilder.success(res, null, 'Servicio de búsqueda funcionando correctamente');
    }
    catch (error) {
        logger_1.default.error('Error al verificar el servicio de búsqueda:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al verificar el servicio de búsqueda', 500);
    }
});
/**
 * @route GET /api/search/test
 * @desc Ruta de prueba para verificar que el servicio está funcionando
 * @access Public
 */
router.get('/test', (req, res) => {
    try {
        return apiResponse_1.ApiResponseBuilder.success(res, { message: 'Ruta de búsqueda funcionando' });
    }
    catch (error) {
        logger_1.default.error('Error en la ruta de prueba:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error en la ruta de prueba', 500);
    }
});
exports.default = router;
//# sourceMappingURL=searchRoutes.js.map