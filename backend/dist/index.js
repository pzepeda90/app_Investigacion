"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const response_time_1 = __importDefault(require("response-time"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const logger_1 = __importDefault(require("./config/logger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Configuración de CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
// Configuración de Helmet
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: {
        policy: "cross-origin"
    },
    crossOriginOpenerPolicy: {
        policy: 'unsafe-none'
    }
}));
app.use((0, compression_1.default)());
app.use((0, response_time_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Middleware para establecer headers CORS en cada respuesta
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin === 'http://localhost:5173' || origin === 'http://localhost:5174')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});
// Rutas
app.use('/api/search', searchRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API funcionando correctamente'
    });
});
// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Conexión exitosa con el servidor',
        timestamp: new Date().toISOString()
    });
});
// Manejo de errores
app.use((err, req, res, next) => {
    logger_1.default.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Iniciar servidor
const startServer = async () => {
    try {
        app.listen(port, () => {
            logger_1.default.info(`Servidor iniciado en puerto ${port}`);
        });
    }
    catch (error) {
        logger_1.default.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map