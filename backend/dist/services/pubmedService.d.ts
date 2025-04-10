export interface SearchOptions {
    yearFilters?: {
        from?: string;
        to?: string;
    };
    studyTypes?: string[];
    recommendedFilters?: string[];
    useAI?: boolean;
}
export interface Author {
    lastName: string;
    foreName: string;
}
export interface Article {
    title: string;
    abstract: string;
    authors: Author[];
    journal: string;
    pubDate: string;
    year: string;
    pmid: string;
    doi: string;
    meshTerms: string[];
}
export interface SearchResult {
    articles: Article[];
    count: number;
    totalAvailable: number;
    isSimulated: boolean;
    detectedConcepts?: string[];
    searchStrategy?: string;
}
export declare function checkPubMedConnectivity(): Promise<boolean>;
export declare function searchPubMed(query: string, limit?: number, useAI?: boolean): Promise<SearchResult>;
