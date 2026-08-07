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

export const mockReviews: Review[] = [
  {
    id: 'rev_1001',
    authorName: 'Nimali Perera',
    rating: 5,
    content: 'Friendly team, quick service, and the order was ready earlier than expected.',
    businessName: 'Ceylon Fresh Mart',
    locationName: 'Colombo 07',
    createdAt: '2026-08-06T10:25:00.000Z',
    sentiment: 'positive',
    status: 'drafted',
    aiReply:
      'Thank you, Nimali. We are glad the team could make your visit quick and pleasant. Hope to see you again soon.',
    keywords: ['friendly staff', 'quick service', 'prepared early'],
  },
  {
    id: 'rev_1002',
    authorName: 'Rashan Silva',
    rating: 2,
    content: 'Delivery was late and no one updated me until I called twice.',
    businessName: 'Ceylon Fresh Mart',
    locationName: 'Nugegoda',
    createdAt: '2026-08-06T07:40:00.000Z',
    sentiment: 'negative',
    status: 'flagged',
    aiReply:
      'Hi Rashan, we are sorry for the delay and lack of updates. Please share your order number so we can review this and make it right.',
    keywords: ['late delivery', 'poor communication'],
  },
  {
    id: 'rev_1003',
    authorName: 'Ahamed Khan',
    rating: 4,
    content: 'Good prices overall. Parking is difficult during lunch time.',
    businessName: 'Ceylon Fresh Mart',
    locationName: 'Colombo 07',
    createdAt: '2026-08-05T15:10:00.000Z',
    sentiment: 'mixed',
    status: 'queued',
    keywords: ['good price', 'parking'],
  },
];

export const mockAnalytics: AnalyticsSnapshot = {
  averageRating: 4.4,
  reviewCount: 1842,
  responseTimeHours: 3.2,
  positivePercent: 72,
  negativePercent: 11,
  aiHandledPercent: 64,
};

export const mockTrends: TrendPoint[] = [
  { month: 'Jan', rating: 4.7, reviews: 212, negative: 14 },
  { month: 'Feb', rating: 4.5, reviews: 238, negative: 21 },
  { month: 'Mar', rating: 4.3, reviews: 246, negative: 28 },
  { month: 'Apr', rating: 4.6, reviews: 264, negative: 18 },
  { month: 'May', rating: 4.4, reviews: 302, negative: 31 },
  { month: 'Jun', rating: 4.2, reviews: 286, negative: 34 },
  { month: 'Jul', rating: 4.5, reviews: 294, negative: 19 },
];

export const mockRules: AutomationRule[] = [
  {
    id: 'rule_1',
    name: 'Five-star fast lane',
    condition: 'rating = 5 and no sensitive keywords',
    action: 'Generate and post reply',
    mode: 'auto',
    enabled: true,
  },
  {
    id: 'rule_2',
    name: 'Low-rating approval',
    condition: 'rating <= 2 or contains refund',
    action: 'Generate draft and notify manager',
    mode: 'approval',
    enabled: true,
  },
  {
    id: 'rule_3',
    name: 'Competitor attack watch',
    condition: 'spam_score > 0.75',
    action: 'Create report suggestion',
    mode: 'draft',
    enabled: false,
  },
];
