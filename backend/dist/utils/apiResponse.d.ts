import { Response } from 'express';
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}
export declare class ApiResponseBuilder {
    static success<T>(res: Response, data?: T, message?: string): Response;
    static error(res: Response, message: string, statusCode?: number): Response;
    static send<T>(res: Response, statusCode: number, data: T, message?: string): void;
    static sendError(res: Response, statusCode: number, error: string, message?: string): void;
}
