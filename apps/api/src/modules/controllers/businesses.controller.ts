import { Controller, Get, Post } from '@nestjs/common';

@Controller('businesses')
export class BusinessesController {
  @Get()
  listBusinesses() {
    return {
      data: [
        {
          id: 'biz_demo',
          displayName: 'Ceylon Fresh Mart',
          locations: ['Colombo 07', 'Nugegoda', 'Kandy'],
          googleAccountName: 'accounts/demo',
        },
      ],
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
