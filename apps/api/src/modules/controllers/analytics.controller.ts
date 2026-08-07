import { Controller, Get } from '@nestjs/common';
import type { AnalyticsOverview } from '@review-maintain/shared';

@Controller('analytics')
export class AnalyticsController {
  @Get('overview')
  getOverview(): AnalyticsOverview {
    return {
      snapshot: null,
      trends: [],
      rules: [],
      topComplaints: [],
      suggestedImprovements: [],
    };
  }
}
