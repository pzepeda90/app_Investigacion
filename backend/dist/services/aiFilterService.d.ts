/**
 * Servicio de filtrado inteligente para mejorar la especificidad de los resultados
 * sin modificar la consulta original del usuario
 */
/**
 * Filtra resultados para mejorar la especificidad de la búsqueda
 * @param articles Artículos originales de PubMed
 * @param query Consulta original del usuario
 * @returns Artículos filtrados con mayor relevancia
 */
export declare const filterResultsForSpecificity: (articles: any[], query: string) => {
    filtered: never[];
    count: number;
    originalCount: number;
    metrics: {
        precision: number;
        recall: number;
    };
} | {
    filtered: any[];
    count: number;
    originalCount: number;
    metrics: {
        precision: number;
        recall: number;
        f1Score: number;
    };
};
