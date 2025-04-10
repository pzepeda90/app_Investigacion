"use strict";
/**
 * Utilidad para mapear términos médicos a términos MeSH
 * Proporciona funciones para traducir términos y construir consultas PubMed
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComplexPubMedQuery = exports.getPubMedQuery = exports.buildPubMedQuery = exports.translateToMeSH = void 0;
// Diccionario de términos comunes en oftalmología y sus equivalentes MeSH
const meshDictionary = {
    // Enfermedades
    'glaucoma': 'Glaucoma',
    'catarata': 'Cataract',
    'degeneración macular': 'Macular Degeneration',
    'retinopatía diabética': 'Diabetic Retinopathy',
    'conjuntivitis': 'Conjunctivitis',
    'queratitis': 'Keratitis',
    'uveítis': 'Uveitis',
    'estrabismo': 'Strabismus',
    'ambliopía': 'Amblyopia',
    'miodesopsias': 'Vitreous Floaters',
    'desprendimiento de retina': 'Retinal Detachment',
    'redesprendimiento': 'Retinal Detachment',
    'redesprendimiento de retina': 'Retinal Detachment',
    'desprendimiento': 'Detachment',
    'recurrencia de desprendimiento': 'Recurrent Retinal Detachment',
    'retina redetachment': 'Retinal Detachment',
    'vitreoretinopatía proliferativa': 'Proliferative Vitreoretinopathy',
    'proliferación vitreoretinal': 'Proliferative Vitreoretinopathy',
    'pvr': 'Proliferative Vitreoretinopathy',
    'proliferación': 'Proliferation',
    'proliferativa': 'Proliferative',
    'vitreoretinal': 'Vitreoretinal',
    'vitreoretiniana': 'Vitreoretinal',
    'retinosis pigmentaria': 'Retinitis Pigmentosa',
    'dacriocistitis': 'Dacryocystitis',
    'blefaritis': 'Blepharitis',
    'ptosis': 'Blepharoptosis',
    'entropión': 'Entropion',
    'ectropión': 'Ectropion',
    'chalazión': 'Chalazion',
    'orzuelo': 'Hordeolum',
    'xeroftalmia': 'Xerophthalmia',
    'ojo seco': 'Dry Eye Syndromes',
    'miopía': 'Myopia',
    'hipermetropía': 'Hyperopia',
    'astigmatismo': 'Astigmatism',
    'presbicia': 'Presbyopia',
    // Procedimientos
    'facoemulsificación': 'Phacoemulsification',
    'vitrectomía': 'Vitrectomy',
    'queratoplastia': 'Keratoplasty',
    'trabeculectomía': 'Trabeculectomy',
    'implante de lente intraocular': 'Lens Implantation, Intraocular',
    'cirugía refractiva': 'Refractive Surgical Procedures',
    'laser in situ keratomileusis': 'Laser In Situ Keratomileusis',
    'lasik': 'Laser In Situ Keratomileusis',
    'fotocoagulación': 'Photocoagulation',
    'inyección intravítrea': 'Intravitreal Injections',
    'drenaje de glaucoma': 'Glaucoma Drainage Implants',
    'transplante de córnea': 'Corneal Transplantation',
    'cirugía de párpados': 'Eyelid Surgery',
    'cirugía de estrabismo': 'Strabismus Surgery',
    // Medicamentos
    'methotrexate': 'Methotrexate',
    'metotrexato': 'Methotrexate',
    'mtx': 'Methotrexate',
    'timolol': 'Timolol',
    'latanoprost': 'Latanoprost',
    'travoprost': 'Travoprost',
    'bimatoprost': 'Bimatoprost',
    'brimonidina': 'Brimonidine',
    'dorzolamida': 'Dorzolamide',
    'atropina': 'Atropine',
    'tropicamida': 'Tropicamide',
    'fenilefrina': 'Phenylephrine',
    'cicloplejicos': 'Cycloplegics',
    'antibióticos oculares': 'Ophthalmic Solutions',
    'antiinflamatorios oculares': 'Anti-Inflammatory Agents',
    'lubricantes oculares': 'Ophthalmic Solutions',
    // Conceptos de prevención, control y reducción
    'prevención': 'Prevention',
    'preventivo': 'Prevention',
    'control': 'Control',
    'reducción': 'Reduction',
    'reduction': 'Reduction',
    'reduce': 'Reduction',
    'prevenir': 'Prevention',
    'prophylaxis': 'Prophylaxis',
    'profilaxis': 'Prophylaxis',
    'tratamiento': 'Treatment',
    'terapia': 'Therapy',
    // Diagnóstico
    'tonometría': 'Tonometry, Ocular',
    'campo visual': 'Visual Fields',
    'retinografía': 'Retinal Photography',
    'angiografía': 'Fluorescein Angiography',
    'tomografía de coherencia óptica': 'Tomography, Optical Coherence',
    'oct': 'Tomography, Optical Coherence',
    'biometría': 'Biometry',
    'topografía corneal': 'Corneal Topography',
    'paquimetría': 'Pachymetry',
    'gonioscopia': 'Gonioscopy',
    'oftalmoscopia': 'Ophthalmoscopy',
    'esquiascopía': 'Retinoscopy',
    'refractometría': 'Refractometry',
    // Anatomía
    'córnea': 'Cornea',
    'iris': 'Iris',
    'cristalino': 'Lens, Crystalline',
    'retina': 'Retina',
    'mácula': 'Macula Lutea',
    'nervio óptico': 'Optic Nerve',
    'conjuntiva': 'Conjunctiva',
    'esclerótica': 'Sclera',
    'coroides': 'Choroid',
    'cuerpo vítreo': 'Vitreous Body',
    'párpado': 'Eyelids',
    'glándula lagrimal': 'Lacrimal Apparatus',
    'músculos extraoculares': 'Oculomotor Muscles',
    'humor acuoso': 'Aqueous Humor',
    'humor vítreo': 'Vitreous Body'
};
// Términos relacionados agrupados por concepto (para búsquedas complejas)
const relatedConcepts = {
    'Retinal Detachment': [
        'Retinal Detachment',
        'recurrent retinal detachment',
        'retina redetachment',
        'redetachment',
        'retinal redetachment'
    ],
    'Methotrexate': [
        'Methotrexate',
        'methotrexate',
        'MTX',
        'amethopterin'
    ],
    'Proliferative Vitreoretinopathy': [
        'Proliferative Vitreoretinopathy',
        'proliferation vitreoretinal',
        'vitreoretinal proliferation',
        'PVR'
    ],
    'Prevention': [
        'Prevention',
        'reduce',
        'reduction',
        'control',
        'prophylaxis',
        'prevention',
        'preventive'
    ]
};
/**
 * Traduce un término médico a su equivalente MeSH
 * @param term Término médico a traducir
 * @returns Array de términos MeSH encontrados
 */
const translateToMeSH = (term) => {
    const cleanTerm = term.toLowerCase().trim();
    const translations = [];
    // Buscar coincidencias exactas
    if (meshDictionary[cleanTerm]) {
        translations.push(meshDictionary[cleanTerm]);
    }
    // Buscar coincidencias parciales
    Object.entries(meshDictionary).forEach(([key, value]) => {
        if (cleanTerm.includes(key.toLowerCase()) && !translations.includes(value)) {
            translations.push(value);
        }
    });
    return translations;
};
exports.translateToMeSH = translateToMeSH;
/**
 * Construye una consulta PubMed a partir de términos MeSH
 * @param terms Array de términos MeSH
 * @returns Consulta PubMed formateada
 */
const buildPubMedQuery = (terms) => {
    if (terms.length === 0) {
        return '';
    }
    // Formatear cada término con el sufijo [MeSH Terms]
    const formattedTerms = terms.map(term => `"${term}"[MeSH Terms]`);
    // Unir términos con operador AND
    return formattedTerms.join(' AND ');
};
exports.buildPubMedQuery = buildPubMedQuery;
/**
 * Obtiene la consulta de búsqueda para PubMed en base a un término
 * @param term Término de búsqueda
 * @returns Consulta formateada para PubMed
 */
const getPubMedQuery = (term) => {
    const translations = (0, exports.translateToMeSH)(term);
    if (translations.length === 0) {
        // Si no hay traducciones, usar el término original
        return `${term}[All Fields]`;
    }
    // Formatear cada término con el sufijo [MeSH Terms]
    const formattedTerms = translations.map(term => `"${term}"[MeSH Terms]`);
    // Unir términos con operador OR
    return formattedTerms.join(' OR ');
};
exports.getPubMedQuery = getPubMedQuery;
/**
 * Detecta conceptos clave en la consulta y construye una consulta PubMed compleja
 * @param query Consulta original
 * @returns Consulta PubMed estructurada con operadores AND y OR
 */
const buildComplexPubMedQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    // En lugar de buscar conceptos predefinidos, extraer términos relevantes de la consulta
    // y buscar sus equivalentes MeSH
    // Extraer palabras clave limpiando la consulta de palabras comunes y signos de puntuación
    const keywords = lowerQuery
        .replace(/[¿?.,;:()]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !['para', 'como', 'entre', 'sobre', 'desde', 'hacia', 'hasta', 'mediante',
        'según', 'acerca', 'durante', 'mediante', 'porque', 'aunque', 'cuando', 'los', 'las', 'con', 'por', 'una', 'unos', 'unas'].includes(word));
    // Si no hay palabras clave, devolver una consulta simple con todos los términos
    if (keywords.length === 0) {
        return `"${query}"[All Fields]`;
    }
    // Verificar si la consulta es sobre niños, pediatría o población infantil
    const isPediatricQuery = /niño|infant|child|pediatr|adolescent/i.test(lowerQuery);
    // Verificar si la consulta es sobre factores de riesgo
    const isRiskFactorQuery = /riesgo|factor|risk|cause|etiology/i.test(lowerQuery);
    // Convertir palabras clave a términos MeSH cuando sea posible
    const meshTermGroups = [];
    const processedKeywords = new Set();
    // Procesar frases completas primero (2-3 palabras juntas)
    const phrases = [];
    for (let i = 0; i < keywords.length - 1; i++) {
        if (i + 2 <= keywords.length) {
            phrases.push(`${keywords[i]} ${keywords[i + 1]}`);
        }
        if (i + 3 <= keywords.length) {
            phrases.push(`${keywords[i]} ${keywords[i + 1]} ${keywords[i + 2]}`);
        }
    }
    // Convertir frases a términos MeSH
    for (const phrase of phrases) {
        const meshTerms = (0, exports.translateToMeSH)(phrase);
        if (meshTerms.length > 0) {
            // Marcar las palabras en esta frase como procesadas
            phrase.split(/\s+/).forEach(word => processedKeywords.add(word));
            const termGroup = buildTermGroup(phrase, meshTerms);
            meshTermGroups.push(termGroup);
        }
    }
    // Procesar palabras individuales que no han sido procesadas como parte de frases
    for (const keyword of keywords) {
        if (!processedKeywords.has(keyword)) {
            const meshTerms = (0, exports.translateToMeSH)(keyword);
            if (meshTerms.length > 0) {
                const termGroup = buildTermGroup(keyword, meshTerms);
                meshTermGroups.push(termGroup);
            }
            else {
                // Si no hay término MeSH, usar el término original como palabra clave
                meshTermGroups.push(`"${keyword}"[All Fields]`);
            }
        }
    }
    // Si no se generaron grupos de términos, usar palabras clave directamente
    if (meshTermGroups.length === 0) {
        return keywords.map(word => `"${word}"[All Fields]`).join(' OR ');
    }
    // Construir la consulta final
    let finalQuery = meshTermGroups.join(' AND ');
    // Añadir filtros de edad si la consulta es sobre niños/pediatría
    if (isPediatricQuery && !finalQuery.includes('"Child"[Mesh]') && !finalQuery.includes('"Infant"[Mesh]')) {
        finalQuery += ' AND ("Child"[Mesh] OR "Infant"[Mesh] OR "Adolescent"[Mesh] OR "Pediatrics"[Mesh])';
    }
    // Añadir filtros de factores de riesgo si la consulta es sobre riesgos
    if (isRiskFactorQuery && !finalQuery.includes('"Risk Factors"[Mesh]')) {
        finalQuery += ' AND ("Risk Factors"[Mesh] OR "risk"[tiab] OR "factors"[tiab] OR "etiology"[Subheading])';
    }
    // Añadir filtro de humanos para mejorar la especificidad
    if (!finalQuery.includes('"Humans"[Mesh]')) {
        finalQuery += ' AND "Humans"[Mesh]';
    }
    return finalQuery;
};
exports.buildComplexPubMedQuery = buildComplexPubMedQuery;
/**
 * Crea un grupo de términos para un concepto
 * @param originalTerm Término original
 * @param meshTerms Array de términos MeSH relacionados
 * @returns Grupo de términos formateado para PubMed
 */
function buildTermGroup(originalTerm, meshTerms) {
    // Limitar a los 2 primeros términos MeSH para evitar una consulta demasiado restrictiva
    const limitedTerms = meshTerms.slice(0, 2);
    let group = `(`;
    // Añadir términos MeSH con posibles calificadores para aumentar especificidad
    for (let i = 0; i < limitedTerms.length; i++) {
        if (i > 0) {
            group += ` OR `;
        }
        // Término MeSH básico
        group += `"${limitedTerms[i]}"[Mesh]`;
        // Detectar si es un término relacionado con edad o población específica
        if (/niño|child|infant|adolescent|pediatric/i.test(limitedTerms[i])) {
            // Añadir filtro de edad si es relevante
            if (!group.includes("[Mesh:NoExp]")) {
                group += ` OR "${limitedTerms[i]}"[Mesh:NoExp]`;
            }
        }
        // Detectar si es un término relacionado con enfermedad o condición
        if (/disease|syndrome|disorder|condition|complication/i.test(limitedTerms[i])) {
            // Añadir subencabezados relevantes para enfermedades
            group += ` OR "${limitedTerms[i]}/etiology"[Mesh] OR "${limitedTerms[i]}/epidemiology"[Mesh]`;
        }
        // Detectar si es un factor de riesgo o causa
        if (/risk|factor|cause|etiology/i.test(originalTerm.toLowerCase())) {
            group += ` OR "Risk Factors"[Mesh]`;
        }
    }
    // Añadir el término original como texto palabra por palabra y en título/resumen
    group += ` OR "${originalTerm}"[tw] OR "${originalTerm}"[tiab]`;
    // Añadir variantes del término si son relevantes (singular/plural)
    if (originalTerm.endsWith('s') && originalTerm.length > 4) {
        const singularForm = originalTerm.substring(0, originalTerm.length - 1);
        group += ` OR "${singularForm}"[tiab]`;
    }
    else if (!originalTerm.endsWith('s') && originalTerm.length > 3) {
        group += ` OR "${originalTerm}s"[tiab]`;
    }
    // Cerrar el grupo
    group += `)`;
    return group;
}
//# sourceMappingURL=meshMapper.js.map