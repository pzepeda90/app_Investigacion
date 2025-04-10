"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseBuilder = void 0;
const logger_1 = __importDefault(require("../config/logger"));
class ApiResponseBuilder {
    static success(res, data, message) {
        const response = {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString()
        };
        return res.json(response);
    }
    static error(res, message, statusCode = 500) {
        const response = {
            success: false,
            error: message,
            timestamp: new Date().toISOString()
        };
        return res.status(statusCode).json(response);
    }
    static send(res, statusCode, data, message) {
        const response = ApiResponseBuilder.success(res, data, message);
        logger_1.default.info(`Respuesta API: ${statusCode}`, {
            path: res.req?.path,
            method: res.req?.method,
            statusCode
        });
        res.status(statusCode).json(response);
    }
    static sendError(res, statusCode, error, message) {
        const response = ApiResponseBuilder.error(res, error, statusCode);
        logger_1.default.error(`Error API: ${statusCode}`, {
            path: res.req?.path,
            method: res.req?.method,
            statusCode,
            error,
            message
        });
        res.status(statusCode).json(response);
    }
}
exports.ApiResponseBuilder = ApiResponseBuilder;
//# sourceMappingURL=apiResponse.js.map