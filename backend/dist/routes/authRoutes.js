"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../config/logger"));
const router = express_1.default.Router();
// Ruta de prueba
router.get('/test', (req, res) => {
    console.log('📌 DEBUG AUTH - Solicitud de prueba recibida');
    res.json({
        success: true,
        message: 'Ruta de autenticación funcionando',
        timestamp: new Date().toISOString()
    });
});
// Ruta de login
router.post('/login', async (req, res) => {
    try {
        logger_1.default.info('Solicitud de login recibida', {
            email: req.body.email,
            headers: req.headers
        });
        const { email, password } = req.body;
        // Validar que se proporcionaron email y password
        if (!email || !password) {
            logger_1.default.warn('Intento de login sin credenciales completas');
            return apiResponse_1.ApiResponseBuilder.error(res, 'Por favor proporciona email y contraseña', 400);
        }
        // Credenciales de prueba simplificadas
        const testUser = {
            id: '1',
            email: 'test@test.com',
            password: '123',
            name: 'Usuario de Prueba'
        };
        logger_1.default.info(`Verificando credenciales para: ${email}`);
        // Verificar si el email coincide
        if (email !== testUser.email) {
            logger_1.default.warn(`Intento de login con email no registrado: ${email}`);
            return apiResponse_1.ApiResponseBuilder.error(res, 'Usuario no encontrado', 401);
        }
        // Verificar si la contraseña coincide
        if (password !== testUser.password) {
            logger_1.default.warn(`Contraseña incorrecta para usuario: ${email}`);
            return apiResponse_1.ApiResponseBuilder.error(res, 'Contraseña incorrecta', 401);
        }
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({
            id: testUser.id,
            email: testUser.email,
            name: testUser.name
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        logger_1.default.info(`Login exitoso para: ${email}`);
        // Enviar respuesta exitosa
        return apiResponse_1.ApiResponseBuilder.success(res, {
            token,
            user: {
                id: testUser.id,
                email: testUser.email,
                name: testUser.name
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error en login:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error en el servidor', 500);
    }
});
// Ruta para verificar token
router.get('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return apiResponse_1.ApiResponseBuilder.error(res, 'No se proporcionó token de autenticación', 401);
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            return apiResponse_1.ApiResponseBuilder.success(res, {
                isValid: true,
                user: decoded
            });
        }
        catch (error) {
            return apiResponse_1.ApiResponseBuilder.error(res, 'Token inválido o expirado', 401);
        }
    }
    catch (error) {
        logger_1.default.error('Error al verificar autenticación:', error);
        return apiResponse_1.ApiResponseBuilder.error(res, 'Error al verificar autenticación', 500);
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map