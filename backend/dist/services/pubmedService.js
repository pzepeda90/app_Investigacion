"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPubMedConnectivity = checkPubMedConnectivity;
exports.searchPubMed = searchPubMed;
/**
 * Servicio para interactuar con la API de PubMed (E-utilities)
 * Este servicio se conecta con PubMed para realizar búsquedas utilizando términos MeSH
 */
const axios_1 = __importStar(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const meshMapper_1 = require("../utils/meshMapper");
const xml2js_1 = require("xml2js");
const config_1 = __importDefault(require("../config/config"));
const node_cache_1 = __importDefault(require("node-cache"));
const dns_1 = __importDefault(require("dns"));
const util_1 = require("util");
const xml2js_2 = __importDefault(require("xml2js"));
const aiService_1 = require("./aiService");
// Promisify DNS lookup
const dnsLookup = (0, util_1.promisify)(dns_1.default.lookup);
dotenv_1.default.config();
// URLs base para las E-utilities de PubMed
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const ESEARCH_URL = `${PUBMED_BASE_URL}/esearch.fcgi`;
const ESUMMARY_URL = `${PUBMED_BASE_URL}/esummary.fcgi`;
const EFETCH_URL = `${PUBMED_BASE_URL}/efetch.fcgi`;
// API Key y credenciales
const API_KEY = process.env.PUBMED_API_KEY || '';
const TOOL_NAME = 'evidencia-cientifica-app';
const EMAIL = process.env.CONTACT_EMAIL || 'patriciozepedarojas@gmail.com';
// Configuración de caché
const cache = new node_cache_1.default({
    stdTTL: 3600, // 1 hora
    checkperiod: 600 // 10 minutos
});
const parser = new xml2js_2.default.Parser({
    explicitArray: false,
    mergeAttrs: true
});
// Función para verificar la conectividad con PubMed
async function checkPubMedConnectivity() {
    try {
        console.log('Verificando conectividad con PubMed...');
        // 1. Verificar resolución DNS
        try {
            const { address } = await dnsLookup('eutils.ncbi.nlm.nih.gov');
            console.log(`✓ Resolución DNS exitosa: ${address}`);
        }
        catch (error) {
            console.error('✗ Error en resolución DNS:', error);
            return false;
        }
        // 2. Verificar API key
        if (!API_KEY) {
            console.warn('⚠️ No se ha configurado la API key de PubMed');
        }
        // 3. Intentar una petición simple
        let testUrl = `${PUBMED_BASE_URL}?db=pubmed&term=test&retmode=json`;
        if (API_KEY) {
            testUrl += `&api_key=${API_KEY}`;
        }
        const response = await axios_1.default.get(testUrl, {
            timeout: 5000,
            validateStatus: (status) => status === 200
        });
        if (!response.data || !response.data.esearchresult) {
            console.error('✗ Respuesta inválida de PubMed');
            return false;
        }
        console.log('✓ Conexión a PubMed establecida');
        return true;
    }
    catch (error) {
        console.error('✗ Error al verificar conectividad con PubMed:', error);
        if (error instanceof axios_1.AxiosError) {
            console.error('Detalles del error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        }
        return false;
    }
}
/**
 * Parsea un XML a objeto JavaScript usando Promise
 */
async function parseXMLPromise(xml) {
    return new Promise((resolve, reject) => {
        (0, xml2js_1.parseString)(xml, {
            explicitArray: false,
            mergeAttrs: true,
            explicitRoot: false,
            trim: true
        }, (err, result) => {
            if (err)
                reject(err);
            else
                resolve(result);
        });
    });
}
const parseXmlAsync = (0, util_1.promisify)(xml2js_1.parseString);
async function searchPubMed(query, limit = 500, useAI = false) {
    try {
        // Validar la consulta antes de procesar
        if (!query || typeof query !== 'string') {
            console.error('Error: La consulta debe ser un string válido');
            throw new Error('La consulta debe ser un string válido');
        }
        // Limpiar la consulta para PubMed
        let cleanedQuery = query.trim();
        // Verificar caché
        const cacheKey = `search:${cleanedQuery}:${limit}:${useAI}`;
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            console.log(`Usando resultado en caché para: "${cleanedQuery}"`);
            return cachedResult;
        }
        console.log(`Consulta original: "${cleanedQuery}"`);
        // Detectar conceptos para el frontend de manera más genérica
        const detectedConcepts = [];
        // Extraer palabras clave más relevantes
        const keywordMap = {};
        const words = cleanedQuery
            .replace(/[¿?.,;:()]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !['para', 'como', 'entre', 'sobre', 'desde', 'hacia', 'hasta', 'mediante',
            'según', 'acerca', 'durante', 'mediante', 'porque', 'aunque', 'cuando', 'los', 'las', 'con', 'por', 'una', 'unos', 'unas'].includes(word));
        // Buscar términos MeSH para cada palabra clave
        words.forEach(word => {
            const meshTerms = (0, meshMapper_1.translateToMeSH)(word);
            if (meshTerms.length > 0) {
                meshTerms.forEach(term => {
                    if (!keywordMap[term]) {
                        keywordMap[term] = 0;
                    }
                    keywordMap[term]++;
                });
            }
        });
        // Seleccionar los términos MeSH más frecuentes (hasta 5)
        const topConcepts = Object.entries(keywordMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
        detectedConcepts.push(...topConcepts);
        // Si no se detectaron conceptos, usar algunos genéricos basados en palabras clave
        if (detectedConcepts.length === 0) {
            const medicalFields = ['Disease', 'Treatment', 'Diagnosis', 'Therapy', 'Medicine'];
            const matchedWords = words.filter(word => word.length > 4).slice(0, 3);
            if (matchedWords.length > 0) {
                detectedConcepts.push(...matchedWords);
            }
            else {
                detectedConcepts.push('Medical Research');
            }
        }
        console.log('Conceptos detectados:', detectedConcepts);
        // Generar consulta para PubMed
        let pubmedSearchTerms = '';
        let searchStrategy = '';
        if (useAI) {
            try {
                // Usar IA para generar la estrategia de búsqueda
                console.log('Usando IA para generar estrategia de búsqueda');
                pubmedSearchTerms = await (0, aiService_1.generateSearchStrategy)(cleanedQuery);
                searchStrategy = pubmedSearchTerms;
            }
            catch (aiError) {
                console.error('Error al generar estrategia con IA, usando método alternativo:', aiError);
                // Usar el método de respaldo si falla la IA
                pubmedSearchTerms = (0, meshMapper_1.buildComplexPubMedQuery)(cleanedQuery);
                searchStrategy = pubmedSearchTerms;
            }
        }
        else {
            // Usar el método estándar (sin IA)
            pubmedSearchTerms = (0, meshMapper_1.buildComplexPubMedQuery)(cleanedQuery);
            searchStrategy = pubmedSearchTerms;
        }
        console.log(`Términos de búsqueda para PubMed: "${pubmedSearchTerms}"`);
        // Construir URL de búsqueda con términos
        const searchUrl = `${config_1.default.pubmed.searchUrl}?db=pubmed&term=${encodeURIComponent(pubmedSearchTerms)}&retmode=json&retmax=${limit}&api_key=${config_1.default.pubmed.apiKey}`;
        try {
            // Realizar búsqueda con timeout adecuado para consultas complejas
            console.log(`Realizando búsqueda en: ${searchUrl}`);
            const searchResponse = await axios_1.default.get(searchUrl, {
                timeout: 30000 // 30 segundos para consultas complejas
            });
            if (!searchResponse.data || !searchResponse.data.esearchresult) {
                console.error('Respuesta inválida de PubMed (sin esearchresult):', searchResponse.data);
                throw new Error('Respuesta inválida de PubMed (sin esearchresult)');
            }
            const { esearchresult } = searchResponse.data;
            if (!esearchresult.idlist || !Array.isArray(esearchresult.idlist)) {
                console.error('Respuesta inválida de PubMed (sin idlist):', esearchresult);
                throw new Error('Respuesta inválida de PubMed (sin idlist)');
            }
            const pmids = esearchresult.idlist;
            const totalAvailable = parseInt(esearchresult.count || '0', 10);
            console.log(`PubMed encontró ${totalAvailable} resultados, recuperando ${pmids.length}`);
            // Si no hay resultados, devolver un array vacío en lugar de resultados simulados
            if (pmids.length === 0) {
                console.log('No se encontraron resultados reales');
                const searchResult = {
                    articles: [],
                    count: 0,
                    totalAvailable: 0,
                    isSimulated: false,
                    detectedConcepts,
                    searchStrategy
                };
                // Guardar en caché
                cache.set(cacheKey, searchResult);
                return searchResult;
            }
            // Obtener detalles de los artículos
            const fetchUrl = `${config_1.default.pubmed.fetchUrl}?db=pubmed&id=${pmids.join(',')}&retmode=xml&api_key=${config_1.default.pubmed.apiKey}`;
            console.log(`Obteniendo detalles de artículos desde: ${fetchUrl}`);
            const fetchResponse = await axios_1.default.get(fetchUrl, {
                timeout: 30000 // 30 segundos de timeout para recuperar detalles
            });
            if (!fetchResponse.data) {
                console.error('Respuesta inválida al obtener detalles');
                throw new Error('Respuesta inválida al obtener detalles');
            }
            // Parsear XML
            try {
                const result = await parser.parseStringPromise(fetchResponse.data);
                if (!result || !result.PubmedArticleSet || !result.PubmedArticleSet.PubmedArticle) {
                    console.error('Error al parsear XML de PubMed (formato incorrecto)');
                    throw new Error('Error al parsear XML de PubMed (formato incorrecto)');
                }
                const articles = parsePubMedResponse(result);
                console.log(`Artículos parseados correctamente: ${articles.length}`);
                if (articles.length === 0) {
                    console.warn('No se pudieron parsear artículos del XML');
                    const searchResult = {
                        articles: [],
                        count: 0,
                        totalAvailable: 0,
                        isSimulated: false,
                        detectedConcepts,
                        searchStrategy
                    };
                    cache.set(cacheKey, searchResult);
                    return searchResult;
                }
                const searchResult = {
                    articles,
                    count: articles.length,
                    totalAvailable,
                    isSimulated: false,
                    detectedConcepts,
                    searchStrategy
                };
                // Guardar en caché
                cache.set(cacheKey, searchResult);
                return searchResult;
            }
            catch (parseError) {
                console.error('Error al parsear XML de PubMed:', parseError);
                throw new Error('Error al parsear XML de PubMed');
            }
        }
        catch (axiosError) {
            console.error('Error en la solicitud a PubMed:', axiosError);
            throw axiosError;
        }
    }
    catch (error) {
        console.error('Error en búsqueda PubMed:', error);
        // En caso de error, devolver un array vacío en lugar de resultados simulados
        console.log('Error en la búsqueda');
        // Determinar conceptos detectados en la consulta
        const lowerQuery = query.toLowerCase();
        const detectedConcepts = [];
        // Verificar Methotrexate
        if (lowerQuery.includes('methotrexate') || lowerQuery.includes('metotrexato') || lowerQuery.includes('mtx')) {
            detectedConcepts.push('Methotrexate');
        }
        // Verificar Retinal Detachment
        if (lowerQuery.includes('desprendimiento') || lowerQuery.includes('redesprend') ||
            lowerQuery.includes('retina') || lowerQuery.includes('detachment')) {
            detectedConcepts.push('Retinal Detachment');
        }
        // Verificar Proliferative Vitreoretinopathy
        if (lowerQuery.includes('proliferación') || lowerQuery.includes('vitreoretinal')) {
            detectedConcepts.push('Proliferative Vitreoretinopathy');
        }
        // Generar una estrategia de respaldo simple para mostrar
        let fallbackStrategy = '';
        try {
            fallbackStrategy = (0, meshMapper_1.buildComplexPubMedQuery)(query);
        }
        catch (strategyError) {
            fallbackStrategy = `("${query}"[All Fields])`;
        }
        return {
            articles: [],
            count: 0,
            totalAvailable: 0,
            isSimulated: false,
            detectedConcepts: detectedConcepts,
            searchStrategy: fallbackStrategy
        };
    }
}
/**
 * Parsear respuesta XML de PubMed
 */
function parsePubMedResponse(response) {
    try {
        if (!response || !response.PubmedArticleSet || !response.PubmedArticleSet.PubmedArticle) {
            console.error('Formato de respuesta XML inválido');
            return [];
        }
        const articles = Array.isArray(response.PubmedArticleSet.PubmedArticle)
            ? response.PubmedArticleSet.PubmedArticle
            : [response.PubmedArticleSet.PubmedArticle];
        return articles.map((article) => {
            try {
                // Extraer datos del artículo
                const citation = article.MedlineCitation;
                if (!citation) {
                    console.warn('Cita sin MedlineCitation', article);
                    return null;
                }
                const articleData = citation.Article;
                if (!articleData) {
                    console.warn('Cita sin Article', citation);
                    return null;
                }
                // Parseo mejorado de autores desde XML
                const parseAuthors = (authorList) => {
                    if (!authorList)
                        return [];
                    // Convertir a array si no lo es
                    const authors = Array.isArray(authorList) ? authorList : [authorList];
                    return authors.map((author) => {
                        if (!author)
                            return { lastName: '', foreName: '' };
                        // Manejar caso donde LastName y ForeName están dentro de propiedad 'name'
                        if (author.name) {
                            return {
                                lastName: author.name.LastName || '',
                                foreName: author.name.ForeName || author.name.Initials || '',
                            };
                        }
                        // Manejar caso donde LastName y ForeName están directamente en el objeto
                        if (author.LastName || author.ForeName) {
                            return {
                                lastName: author.LastName || '',
                                foreName: author.ForeName || author.Initials || '',
                            };
                        }
                        // Manejar caso donde lastName y foreName están en minúsculas
                        if (author.lastName || author.foreName) {
                            return {
                                lastName: author.lastName || '',
                                foreName: author.foreName || author.initials || '',
                            };
                        }
                        // Caso fallback: intentar convertir el objeto completo a string
                        try {
                            const authorStr = String(author);
                            return {
                                lastName: authorStr,
                                foreName: '',
                            };
                        }
                        catch (e) {
                            return { lastName: '', foreName: '' };
                        }
                    }).filter(author => author.lastName || author.foreName); // Filtrar autores vacíos
                };
                // Obtener la lista de autores si existe
                const authors = articleData.AuthorList && articleData.AuthorList.Author
                    ? parseAuthors(articleData.AuthorList.Author)
                    : [];
                // Extraer año y fecha de publicación
                const pubDate = articleData.Journal?.JournalIssue?.PubDate;
                let year = '';
                let fullDate = '';
                if (pubDate) {
                    if (pubDate.Year) {
                        year = pubDate.Year;
                    }
                    if (pubDate.Month && pubDate.Year) {
                        fullDate = `${pubDate.Month} ${pubDate.Day || ''} ${pubDate.Year}`.trim();
                    }
                    else if (pubDate.MedlineDate) {
                        fullDate = pubDate.MedlineDate;
                        // Intentar extraer año si no se encontró antes
                        const yearMatch = pubDate.MedlineDate.match(/\b(19|20)\d{2}\b/);
                        if (yearMatch && !year) {
                            year = yearMatch[0];
                        }
                    }
                }
                // Extraer PMID
                const pmid = citation.PMID?._
                    ? citation.PMID._
                    : (citation.PMID || '');
                // Extraer DOIs y otros identificadores externos
                let doi = '';
                const articleIds = article.PubmedData?.ArticleIdList?.ArticleId;
                if (articleIds) {
                    const doiEntry = Array.isArray(articleIds)
                        ? articleIds.find((id) => id.$ && id.$.IdType === 'doi')
                        : (articleIds.$ && articleIds.$.IdType === 'doi' ? articleIds : null);
                    if (doiEntry) {
                        doi = Array.isArray(doiEntry) ? doiEntry[0]._ : doiEntry._;
                    }
                }
                // Construir objeto final del artículo
                return {
                    title: articleData.ArticleTitle || 'Sin título',
                    abstract: articleData.Abstract?.AbstractText
                        ? Array.isArray(articleData.Abstract.AbstractText)
                            ? articleData.Abstract.AbstractText.map((text) => typeof text === 'string' ? text : text._).join(' ')
                            : (typeof articleData.Abstract.AbstractText === 'string'
                                ? articleData.Abstract.AbstractText
                                : articleData.Abstract.AbstractText._ || '')
                        : 'No hay resumen disponible',
                    authors: authors,
                    journal: articleData.Journal?.Title || 'Revista desconocida',
                    pubDate: fullDate,
                    year: year,
                    pmid: pmid,
                    doi: doi,
                    meshTerms: []
                };
            }
            catch (err) {
                console.error('Error al parsear artículo:', err);
                return null;
            }
        }).filter(Boolean);
    }
    catch (error) {
        console.error('Error en parsePubMedResponse:', error);
        return [];
    }
}
/**
 * Genera resultados simulados basados en la consulta
 */
function generateSimulatedResults(query, count) {
    console.log(`===== Generando ${count} resultados simulados para la consulta: "${query}" =====`);
    const today = new Date();
    const currentYear = today.getFullYear();
    // Detectar conceptos clave en la consulta
    const lowercaseQuery = query.toLowerCase();
    const concepts = [];
    // Verificar si la consulta contiene términos específicos
    if (lowercaseQuery.includes('methotrexate') || lowercaseQuery.includes('metotrexato') || lowercaseQuery.includes('mtx')) {
        concepts.push('methotrexate');
    }
    if (lowercaseQuery.includes('desprendimiento') || lowercaseQuery.includes('retina') || lowercaseQuery.includes('detachment')) {
        concepts.push('retinal detachment');
    }
    if (lowercaseQuery.includes('proliferación') || lowercaseQuery.includes('vitreoretinal') || lowercaseQuery.includes('pvr')) {
        concepts.push('proliferative vitreoretinopathy');
    }
    if (lowercaseQuery.includes('prevención') || lowercaseQuery.includes('control') || lowercaseQuery.includes('reducción') || lowercaseQuery.includes('prevention')) {
        concepts.push('prevention');
    }
    // Si no se detectaron conceptos, usar términos genéricos de oftalmología
    if (concepts.length === 0) {
        concepts.push('ophthalmology');
    }
    const simulatedArticles = [];
    // Títulos específicos basados en conceptos detectados
    const titleTemplates = [
        "Efficacy of {concept1} in the {concept2} of patients with {concept3}",
        "A randomized controlled trial of {concept1} for {concept2} in {concept3}",
        "Systematic review: {concept1} in the {concept2} of {concept3}",
        "Meta-analysis of {concept1} for {concept2} in patients with {concept3}",
        "Long-term outcomes of {concept1} in {concept2} for patients with {concept3}",
        "Clinical significance of {concept1} in {concept2} of {concept3}"
    ];
    // Abstracts específicos basados en conceptos detectados
    const abstractTemplates = [
        "PURPOSE: To evaluate the efficacy of {concept1} in the {concept2} of {concept3} in a prospective study. METHODS: We conducted a study on {n} patients who received {concept1} after primary vitrectomy for {concept3}. RESULTS: The rate of {concept3} was significantly lower in the treatment group compared to controls (p<0.05). CONCLUSIONS: {concept1} appears to be effective in the {concept2} of {concept3} following primary retinal detachment surgery.",
        "BACKGROUND: {concept3} remains a significant complication after retinal detachment surgery. This study investigates whether {concept1} can provide effective {concept2}. METHODS: {n} eyes were included in this randomized study. RESULTS: Treatment with {concept1} was associated with a lower incidence of {concept3} (15% vs 35%, p<0.01). CONCLUSIONS: {concept1} shows promise as an adjunctive treatment for {concept2} of {concept3}.",
        "OBJECTIVE: To perform a systematic review of the literature on {concept1} for {concept2} of {concept3}. METHODS: We searched PubMed, Embase, and Cochrane databases. RESULTS: Analysis of {n} studies showed that {concept1} was effective in reducing the incidence of {concept3} by approximately 40%. CONCLUSIONS: Evidence supports the use of {concept1} for {concept2} of {concept3}, although more randomized trials are needed."
    ];
    // Asegurar que count sea un número entero positivo
    let actualCount;
    try {
        actualCount = parseInt(count.toString(), 10);
        if (isNaN(actualCount) || actualCount <= 0) {
            console.log(`Valor de count inválido: ${count}, usando valor por defecto 50`);
            actualCount = 50;
        }
        else if (actualCount > 500) {
            actualCount = 500; // Limitar a 500 máximo
            console.log(`Limitando count a máximo 500`);
        }
    }
    catch (e) {
        console.log(`Error al interpretar count=${count}, usando valor por defecto 50`);
        actualCount = 50;
    }
    console.log(`Generando exactamente ${actualCount} artículos simulados`);
    // Generar plantillas de autores
    const authorTemplates = [
        [
            { lastName: "Rodriguez", foreName: "M" },
            { lastName: "Fernandez", foreName: "A" },
            { lastName: "Lopez", foreName: "J" }
        ],
        [
            { lastName: "Garcia", foreName: "JL" },
            { lastName: "Martinez", foreName: "P" },
            { lastName: "Sanchez", foreName: "R" }
        ],
        [
            { lastName: "Hernandez", foreName: "A" },
            { lastName: "Gonzalez", foreName: "B" },
            { lastName: "Castro", foreName: "M" }
        ],
        [
            { lastName: "Lopez", foreName: "R" },
            { lastName: "Smith", foreName: "J" },
            { lastName: "Johnson", foreName: "M" }
        ],
        [
            { lastName: "Jimenez", foreName: "D" },
            { lastName: "Williams", foreName: "K" },
            { lastName: "Brown", foreName: "S" }
        ]
    ];
    // Revistas para simular
    const journals = [
        "Journal of Ophthalmology",
        "British Journal of Ophthalmology",
        "Retina",
        "Ophthalmology",
        "American Journal of Ophthalmology",
        "JAMA Ophthalmology"
    ];
    // Generar artículos simulados
    for (let i = 0; i < actualCount; i++) {
        // Generar año reciente con más probabilidad para estudios recientes
        const yearOffset = Math.floor(Math.random() * 10);
        const year = (currentYear - yearOffset).toString();
        // Seleccionar conceptos aleatorios para el título y abstract
        const shuffledConcepts = [...concepts].sort(() => 0.5 - Math.random());
        // Asegurar que tenemos al menos 3 conceptos (repetir si es necesario)
        const usedConcepts = [
            shuffledConcepts[0] || concepts[0],
            shuffledConcepts[1] || concepts[0],
            shuffledConcepts[2] || concepts[0]
        ];
        // Generar título relevante
        const titleTemplate = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
        const title = titleTemplate
            .replace('{concept1}', usedConcepts[0])
            .replace('{concept2}', usedConcepts[1])
            .replace('{concept3}', usedConcepts[2]);
        // Seleccionar un conjunto de autores
        const authors = JSON.parse(JSON.stringify(authorTemplates[Math.floor(Math.random() * authorTemplates.length)]));
        // Generar número aleatorio de participantes para el estudio
        const participants = Math.floor(Math.random() * 500) + 50;
        // Generar abstract relevante
        const abstractTemplate = abstractTemplates[Math.floor(Math.random() * abstractTemplates.length)];
        const abstract = abstractTemplate
            .replace('{concept1}', usedConcepts[0])
            .replace('{concept2}', usedConcepts[1])
            .replace('{concept3}', usedConcepts[2])
            .replace('{n}', participants.toString());
        // Generar fechas aleatorias
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const pubDate = `${year} ${month < 10 ? '0' + month : month} ${day < 10 ? '0' + day : day}`;
        // Crear artículo
        const article = {
            pmid: `SIM${10000000 + i}`,
            title,
            abstract,
            authors,
            journal: journals[Math.floor(Math.random() * journals.length)],
            pubDate,
            year,
            doi: `10.1111/sim.${2000 + i}`,
            meshTerms: []
        };
        simulatedArticles.push(article);
    }
    // Verificar algunos autores generados
    if (simulatedArticles.length > 0) {
        console.log(`Ejemplo de artículo generado:`);
        console.log(`  - ID: ${simulatedArticles[0].pmid}`);
        console.log(`  - Título: ${simulatedArticles[0].title}`);
        console.log(`  - Autores: ${JSON.stringify(simulatedArticles[0].authors)}`);
    }
    console.log(`Generados ${simulatedArticles.length} artículos simulados`);
    return simulatedArticles;
}
//# sourceMappingURL=pubmedService.js.map