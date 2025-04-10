import { Request, Response } from 'express';
/**
 * Controlador para realizar búsquedas en PubMed
 */
export declare function searchPubMedController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
