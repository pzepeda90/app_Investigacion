"use strict";
/**
 * Servicio de filtrado inteligente para mejorar la especificidad de los resultados
 * sin modificar la consulta original del usuario
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterResultsForSpecificity = void 0;
/**
 * Filtra resultados para mejorar la especificidad de la búsqueda
 * @param articles Artículos originales de PubMed
 * @param query Consulta original del usuario
 * @returns Artículos filtrados con mayor relevancia
 */
const filterResultsForSpecificity = (articles, query) => {
    if (!articles || articles.length === 0) {
        console.log('No hay artículos para filtrar');
        return {
            filtered: [],
            count: 0,
            originalCount: 0,
            metrics: { precision: 0, recall: 1 }
        };
    }
    console.log(`Filtrando ${articles.length} resultados para "${query}"`);
    // Paso 1: Clasificar los artículos por relevancia
    const scored = scoreArticlesByRelevance(articles, query);
    // Paso 2: Identificar términos irrelevantes y términos de alta relevancia
    const termAnalysis = analyzeQueryTerms(scored, query);
    // Paso 3: Filtrar usando reglas de especificidad
    const filtered = applySpecificityFilters(scored, termAnalysis);
    // Paso 4: Calcular métricas
    const metrics = calculateFilterMetrics(articles.length, filtered.length);
    console.log(`Filtrado completado: ${filtered.length} de ${articles.length} artículos mantenidos (${Math.round(metrics.precision * 100)}% precisión estimada)`);
    return {
        filtered,
        count: filtered.length,
        originalCount: articles.length,
        metrics
    };
};
exports.filterResultsForSpecificity = filterResultsForSpecificity;
/**
 * Calcula una puntuación de relevancia para cada artículo
 */
const scoreArticlesByRelevance = (articles, query) => {
    // Extraer términos clave de la consulta
    const queryTerms = query.toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 3) // Solo términos significativos
        .map(term => ({
        term,
        medical: isMedicalTerm(term),
        weight: termWeight(term)
    }));
    console.log(`Términos clave identificados: ${queryTerms.map(t => t.term).join(', ')}`);
    return articles.map(article => {
        const title = (article.title || '').toLowerCase();
        const abstract = (article.abstract || '').toLowerCase();
        const meshTerms = Array.isArray(article.meshTerms)
            ? article.meshTerms.join(' ').toLowerCase()
            : '';
        // Calcular score para cada término de la consulta
        const termScores = queryTerms.map(({ term, weight }) => {
            let score = 0;
            // Verificar presencia en título (mayor peso)
            if (title.includes(term)) {
                score += 10 * weight;
            }
            // Verificar presencia en resumen
            if (abstract.includes(term)) {
                score += 5 * weight;
            }
            // Verificar presencia en términos MeSH (alta relevancia)
            if (meshTerms.includes(term)) {
                score += 8 * weight;
            }
            return { term, score };
        });
        // Score final es la suma de todos los scores de términos
        const relevanceScore = termScores.reduce((sum, { score }) => sum + score, 0);
        // Guardar también los scores individuales para análisis
        return {
            ...article,
            relevanceScore,
            termScores
        };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore); // Ordenar por relevancia
};
/**
 * Analiza los términos de la consulta para determinar su importancia
 */
const analyzeQueryTerms = (scoredArticles, query) => {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    // Para cada término, calcular su impacto en la relevancia
    const termAnalysis = terms.map(term => {
        // Contar cuántos artículos contienen este término en lugares importantes
        const articleContainsTerm = scoredArticles.filter(article => {
            const title = (article.title || '').toLowerCase();
            const abstract = (article.abstract || '').toLowerCase();
            const meshTerms = Array.isArray(article.meshTerms)
                ? article.meshTerms.join(' ').toLowerCase()
                : '';
            return title.includes(term) || abstract.includes(term) || meshTerms.includes(term);
        }).length;
        // Porcentaje de artículos con este término
        const coverage = articleContainsTerm / scoredArticles.length;
        // Términos muy comunes pueden ser poco específicos
        const isGeneric = coverage > 0.9;
        // Términos muy raros pueden ser muy específicos o irrelevantes
        const isHighlySpecific = coverage < 0.1;
        return {
            term,
            coverage,
            isGeneric,
            isHighlySpecific,
            isMedical: isMedicalTerm(term),
            weight: termWeight(term)
        };
    });
    return {
        terms: termAnalysis,
        genericTerms: termAnalysis.filter(t => t.isGeneric).map(t => t.term),
        specificTerms: termAnalysis.filter(t => !t.isGeneric && t.isMedical).map(t => t.term)
    };
};
/**
 * Aplica filtros de especificidad basados en el análisis de términos
 */
const applySpecificityFilters = (scoredArticles, termAnalysis) => {
    // Si hay pocos resultados, ser menos restrictivos
    if (scoredArticles.length < 15) {
        console.log('Pocos resultados, aplicando filtros mínimos');
        return scoredArticles;
    }
    // Para conjuntos grandes, podemos ser más selectivos
    if (scoredArticles.length > 50) {
        console.log('Conjunto grande de resultados, aplicando filtros avanzados');
        // 1. Asegurar que al menos 1 término específico esté presente en título o MeSH
        const highSpecificityArticles = scoredArticles.filter(article => {
            const title = (article.title || '').toLowerCase();
            const meshTerms = Array.isArray(article.meshTerms)
                ? article.meshTerms.join(' ').toLowerCase()
                : '';
            return termAnalysis.specificTerms.some((term) => title.includes(term) || meshTerms.includes(term));
        });
        // Si tenemos suficientes resultados específicos, usar esos
        if (highSpecificityArticles.length >= 15) {
            console.log(`Filtrado por términos específicos: ${highSpecificityArticles.length} artículos mantenidos`);
            return highSpecificityArticles;
        }
    }
    // Enfoque basado en umbral de relevancia
    // Determinar un umbral dinámico basado en la distribución de scores
    const scores = scoredArticles.map(a => a.relevanceScore);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    // Umbral es un porcentaje del score máximo, ajustado según el tamaño del conjunto
    const thresholdFactor = scoredArticles.length > 50 ? 0.25 : 0.15;
    const threshold = avgScore * thresholdFactor;
    console.log(`Aplicando umbral de relevancia: ${threshold.toFixed(2)} (avg: ${avgScore.toFixed(2)}, max: ${maxScore.toFixed(2)})`);
    return scoredArticles.filter(article => article.relevanceScore >= threshold);
};
/**
 * Calcula métricas estimadas del filtrado
 */
const calculateFilterMetrics = (originalCount, filteredCount) => {
    // Estimación simple de precisión y recall basada en tamaños
    // (en un caso real se necesitaría validación humana para métricas exactas)
    // Suponemos que la precisión mejora a medida que filtramos más
    const filterRatio = filteredCount / originalCount;
    // Modelo simple: precisión se incrementa cuando filtramos, recall disminuye
    // Estas son aproximaciones basadas en el ratio de filtrado
    const estimatedPrecision = 0.5 + (0.5 * (1 - filterRatio));
    const estimatedRecall = Math.min(1, filterRatio * 1.2); // Dar un poco de margen al recall
    return {
        precision: estimatedPrecision,
        recall: estimatedRecall,
        f1Score: 2 * (estimatedPrecision * estimatedRecall) / (estimatedPrecision + estimatedRecall)
    };
};
/**
 * Verifica si un término parece ser médico/científico
 */
const isMedicalTerm = (term) => {
    // Lista de sufijos comunes en términos médicos
    const medicalSuffixes = ['itis', 'osis', 'oma', 'pathy', 'plasty', 'ectomy', 'tomy', 'scopy'];
    // Lista de prefijos comunes en términos médicos
    const medicalPrefixes = ['hyper', 'hypo', 'neo', 'poly', 'meta', 'endo', 'exo'];
    // Términos específicos de oftalmología y retina
    const ophthalmologyTerms = [
        'retina', 'macula', 'vitreo', 'desprendimiento', 'ocular', 'intraocular',
        'proliferación', 'proliferativa', 'vitreoretiniana', 'vitreoretinal',
        'oftalmológica', 'fotocoagulación', 'metotrexa', 'metotrexato'
    ];
    // Verificar sufijos médicos
    const hasMedicalSuffix = medicalSuffixes.some(suffix => term.endsWith(suffix));
    // Verificar prefijos médicos
    const hasMedicalPrefix = medicalPrefixes.some(prefix => term.startsWith(prefix));
    // Verificar si es un término específico de oftalmología
    const isOphthalmologyTerm = ophthalmologyTerms.some(oTerm => term.includes(oTerm) || oTerm.includes(term));
    return hasMedicalSuffix || hasMedicalPrefix || isOphthalmologyTerm;
};
/**
 * Asigna un peso a un término basado en su importancia médica
 */
const termWeight = (term) => {
    // Lista de términos con pesos específicos
    const termWeights = {
        'metotrexato': 2.0,
        'metotrexa': 2.0,
        'mtx': 2.0,
        'retina': 1.5,
        'desprendimiento': 1.8,
        'redesprendimiento': 2.0,
        'proliferación': 1.7,
        'vitreoretinal': 1.9,
        'vitreoretiniana': 1.9,
        'prevención': 1.6,
        'tratamiento': 0.8,
        'estudio': 0.5,
        'paciente': 0.5,
        'resultado': 0.6,
        'caso': 0.7
    };
    // Verificar si el término está en la lista
    for (const [key, weight] of Object.entries(termWeights)) {
        if (term.includes(key) || key.includes(term)) {
            return weight;
        }
    }
    // Peso por defecto para términos médicos vs. no médicos
    return isMedicalTerm(term) ? 1.2 : 0.8;
};
//# sourceMappingURL=aiFilterService.js.map