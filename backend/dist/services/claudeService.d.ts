import { Article, QueryAnalysis, RankedArticle } from '../types';
export declare const checkConnection: () => Promise<boolean>;
export declare const processQuery: (query: string) => Promise<QueryAnalysis>;
export declare const analyzeArticles: (articles: Article[], query: string) => Promise<RankedArticle[]>;
export declare const extractReferences: (articles: Article[]) => Promise<string[]>;
export declare const clearCache: () => void;
