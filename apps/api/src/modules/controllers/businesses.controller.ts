import { Controller, Get, Post } from '@nestjs/common';
import type { BusinessSummary } from '@review-maintain/shared';

@Controller('businesses')
export class BusinessesController {
  @Get()
  listBusinesses(): { data: BusinessSummary[] } {
    return {
      data: [],
    };
  }

  @Post('sync-locations')
  syncLocations() {
    return {
      queued: true,
      job: 'google.locations.sync',
      message: 'Location sync job would be queued for the connected Google account.',
    };
  }
}
