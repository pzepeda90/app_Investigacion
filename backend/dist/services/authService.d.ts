export declare const authService: {
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    verifyToken(token: string): Promise<{
        id: string;
        email: string;
        name: string;
    }>;
};
export default authService;
