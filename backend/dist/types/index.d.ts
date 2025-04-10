export interface Article {
    pmid: string;
    title: string;
    abstract: string;
    authors: string[];
    journal: string;
    pubDate: string;
    doi?: string;
}
export interface RankedArticle {
    article: Article;
    score: number;
    explanation: string;
}
export interface ArticleWithReferences extends Article {
    references: string[];
}
export interface QueryAnalysis {
    query: string;
    analysis: string;
}
export interface SearchResult {
    articles: Article[];
    count: number;
    totalAvailable: number;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}
export interface HealthCheckResponse {
    status: string;
    message: string;
}
export interface EnhanceQueryResponse {
    success: boolean;
    originalQuery: string;
    enhancedQuery: {
        concepts: Array<{
            original: string;
            translated: string;
            meshTerm?: string;
            explanation: string;
        }>;
        strategy: string;
        pubmedQuery: string;
    };
    timestamp: string;
    message?: string;
    error?: string;
    details?: string;
}
export interface CacheEntry {
    timestamp: number;
    data: any;
}
export interface ContentBlock {
    type: string;
    text: string;
}
export interface ArticleSummaryResponse {
    articleId: string;
    summary: string;
    processingTime: number;
    timestamp: string;
}
export interface ReferencesResponse {
    articleId: string;
    references: string[];
    processingTime: number;
    timestamp: string;
}
