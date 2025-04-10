declare const config: {
    server: {
        port: string | number;
        environment: string;
    };
    pubmed: {
        apiKey: string;
        email: string;
        baseUrl: string;
        searchUrl: string;
        summaryUrl: string;
        fetchUrl: string;
    };
    claude: {
        apiKey: string;
        model: string;
    };
    cache: {
        ttl: number;
        checkperiod: number;
    };
};
export default config;
