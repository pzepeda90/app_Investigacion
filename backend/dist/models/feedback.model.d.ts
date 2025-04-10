interface Feedback {
    articleId: string;
    query: string;
    isRelevant: boolean;
    userId?: string;
    comments?: string;
}
export declare class FeedbackModel {
    private feedbackData;
    private relevanceAdjustments;
    constructor();
    addFeedback(feedback: Feedback): void;
    private updateRelevanceAdjustments;
    getRelevanceFactor(term: string): number;
    getAllFeedback(): Feedback[];
    getFeedbackForArticle(articleId: string): Feedback[];
    getFeedbackForQuery(query: string): Feedback[];
}
export {};
