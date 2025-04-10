"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Usuario de prueba (en producción esto estaría en una base de datos)
const testUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Usuario de Prueba',
    password: bcryptjs_1.default.hashSync('password123', 10)
};
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro';
exports.authService = {
    async login(email, password) {
        try {
            // Validar entrada
            if (!email || !password) {
                throw new Error('Email y contraseña son requeridos');
            }
            // En producción, buscarías el usuario en la base de datos
            if (email !== testUser.email) {
                throw new Error('Usuario no encontrado');
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, testUser.password);
            if (!isValidPassword) {
                throw new Error('Contraseña incorrecta');
            }
            const token = jsonwebtoken_1.default.sign({
                id: testUser.id,
                email: testUser.email,
                name: testUser.name
            }, JWT_SECRET, { expiresIn: '24h' });
            return {
                token,
                user: {
                    id: testUser.id,
                    email: testUser.email,
                    name: testUser.name
                }
            };
        }
        catch (error) {
            console.error('Error en login service:', error);
            throw new Error(error.message || 'Error en la autenticación');
        }
    },
    async verifyToken(token) {
        try {
            if (!token) {
                throw new Error('Token no proporcionado');
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // En producción, verificarías que el usuario aún existe en la base de datos
            return {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name
            };
        }
        catch (error) {
            console.error('Error en verify token service:', error);
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expirado');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Token inválido');
            }
            throw new Error('Error en la verificación del token');
        }
    }
};
exports.default = exports.authService;
//# sourceMappingURL=authService.js.map