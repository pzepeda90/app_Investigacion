/**
 * Utilidad para mapear términos médicos a términos MeSH
 * Proporciona funciones para traducir términos y construir consultas PubMed
 */
/**
 * Traduce un término médico a su equivalente MeSH
 * @param term Término médico a traducir
 * @returns Array de términos MeSH encontrados
 */
export declare const translateToMeSH: (term: string) => string[];
/**
 * Construye una consulta PubMed a partir de términos MeSH
 * @param terms Array de términos MeSH
 * @returns Consulta PubMed formateada
 */
export declare const buildPubMedQuery: (terms: string[]) => string;
/**
 * Obtiene la consulta de búsqueda para PubMed en base a un término
 * @param term Término de búsqueda
 * @returns Consulta formateada para PubMed
 */
export declare const getPubMedQuery: (term: string) => string;
/**
 * Detecta conceptos clave en la consulta y construye una consulta PubMed compleja
 * @param query Consulta original
 * @returns Consulta PubMed estructurada con operadores AND y OR
 */
export declare const buildComplexPubMedQuery: (query: string) => string;
