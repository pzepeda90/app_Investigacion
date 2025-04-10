"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const searchRoutes_1 = __importDefault(require("./searchRoutes"));
const aiRoutes_1 = __importDefault(require("./aiRoutes"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const router = express_1.default.Router();
// Configurar rutas
router.use('/search', searchRoutes_1.default);
router.use('/ai', aiRoutes_1.default);
router.use('/auth', authRoutes_1.default);
// Ruta raíz de la API
router.get('/', (req, res) => {
    res.json({
        name: 'API de Evidencia Científica para Oftalmología',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            search: '/api/search',
            health: '/api/search/health',
            ai: '/api/ai',
            auth: '/api/auth'
        },
        documentation: 'Utilice los endpoints específicos para acceder a la funcionalidad'
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map