"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackModel = void 0;
class FeedbackModel {
    constructor() {
        this.feedbackData = [];
        this.relevanceAdjustments = {};
    }
    addFeedback(feedback) {
        if (!feedback.articleId || !feedback.query) {
            throw new Error('Se requieren articleId y query');
        }
        this.feedbackData.push({
            articleId: feedback.articleId,
            query: feedback.query,
            isRelevant: !!feedback.isRelevant,
            userId: feedback.userId || 'anonymous',
            comments: feedback.comments || ''
        });
        this.updateRelevanceAdjustments(feedback);
    }
    updateRelevanceAdjustments(feedback) {
        const keywords = feedback.query.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        keywords.forEach(keyword => {
            if (!this.relevanceAdjustments[keyword]) {
                this.relevanceAdjustments[keyword] = {
                    positive: 0,
                    negative: 0,
                    total: 0,
                    factor: 1.0
                };
            }
            if (feedback.isRelevant) {
                this.relevanceAdjustments[keyword].positive += 1;
            }
            else {
                this.relevanceAdjustments[keyword].negative += 1;
            }
            this.relevanceAdjustments[keyword].total += 1;
            const posRate = this.relevanceAdjustments[keyword].positive / this.relevanceAdjustments[keyword].total;
            const newFactor = 1.0 + (posRate - 0.5) * 0.5;
            this.relevanceAdjustments[keyword].factor = newFactor;
        });
    }
    getRelevanceFactor(term) {
        const termLower = term.toLowerCase();
        return this.relevanceAdjustments[termLower]?.factor || 1.0;
    }
    getAllFeedback() {
        return this.feedbackData;
    }
    getFeedbackForArticle(articleId) {
        return this.feedbackData.filter(f => f.articleId === articleId);
    }
    getFeedbackForQuery(query) {
        return this.feedbackData.filter(f => f.query === query);
    }
}
exports.FeedbackModel = FeedbackModel;
//# sourceMappingURL=feedback.model.js.map