export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed';
export type ReviewReplyMode = 'auto' | 'approval' | 'draft';
export type ReviewStatus = 'new' | 'queued' | 'drafted' | 'approved' | 'posted' | 'flagged';
export interface Review {
    id: string;
    authorName: string;
    rating: 1 | 2 | 3 | 4 | 5;
    content: string;
    businessName: string;
    locationName: string;
    createdAt: string;
    sentiment: Sentiment;
    status: ReviewStatus;
    aiReply?: string;
    keywords: string[];
}
export interface AnalyticsSnapshot {
    averageRating: number;
    reviewCount: number;
    responseTimeHours: number;
    positivePercent: number;
    aiHandledPercent: number;
    negativePercent: number;
}
export interface TrendPoint {
    month: string;
    rating: number;
    reviews: number;
    negative: number;
}
export interface AutomationRule {
    id: string;
    name: string;
    condition: string;
    action: string;
    mode: ReviewReplyMode;
    enabled: boolean;
}
export declare const mockReviews: Review[];
export declare const mockAnalytics: AnalyticsSnapshot;
export declare const mockTrends: TrendPoint[];
export declare const mockRules: AutomationRule[];
