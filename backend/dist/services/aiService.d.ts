import { Article } from './pubmedService';
/**
 * Genera una estrategia de búsqueda estructurada para PubMed basada en una pregunta clínica
 * @param clinicalQuestion Pregunta clínica en lenguaje natural
 * @returns Estrategia de búsqueda formateada para PubMed
 */
export declare const generateSearchStrategy: (clinicalQuestion: string) => Promise<string>;
export declare const rankArticles: (articles: Article[], query: string) => Promise<Article[]>;
export declare const generateSummary: (article: Article, apiKey: string) => Promise<string>;
export declare const analyzeArticles: (articles: Article[], query: string) => Promise<any>;
export declare const extractReferences: (article: Article) => Promise<string[]>;
