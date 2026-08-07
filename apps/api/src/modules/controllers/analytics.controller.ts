import { Controller, Get } from '@nestjs/common';
import { mockAnalytics, mockRules, mockTrends } from '@review-maintain/shared';

@Controller('analytics')
export class AnalyticsController {
  @Get('overview')
  getOverview() {
    return {
      snapshot: mockAnalytics,
      trends: mockTrends,
      rules: mockRules,
      topComplaints: ['Parking', 'Late delivery', 'Slow response'],
      suggestedImprovements: ['Add proactive delivery updates', 'Reserve pickup bays', 'Extend support hours'],
    };
  }
}
