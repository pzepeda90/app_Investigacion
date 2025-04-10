"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
const config = {
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development'
    },
    pubmed: {
        apiKey: process.env.PUBMED_API_KEY || '',
        email: process.env.PUBMED_EMAIL || '',
        baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
        searchUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
        summaryUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi',
        fetchUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
    },
    claude: {
        apiKey: process.env.CLAUDE_API_KEY || '',
        model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229'
    },
    cache: {
        ttl: 3600, // 1 hora en segundos
        checkperiod: 600 // 10 minutos en segundos
    }
};
exports.default = config;
//# sourceMappingURL=config.js.map