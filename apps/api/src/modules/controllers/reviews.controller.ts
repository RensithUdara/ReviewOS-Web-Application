import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QueueService } from '../services/queue.service.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly queueService: QueueService) {}

  @Get()
  listReviews() {
    return { data: [] };
  }

  @Post('sync')
  async syncReviews(@Body() body: { businessId?: string }) {
    if (!body.businessId) {
      return {
        queued: false,
        message: 'businessId is required before a review sync job can be queued.',
      };
    }

    const job = await this.queueService.addReviewSyncJob({ businessId: body.businessId });
    return {
      queued: true,
      jobId: job?.id ?? null,
      message: 'Review sync queued. Worker will fetch Google Business Profile reviews.',
    };
  }

  @Post(':reviewId/replies/generate')
  async generateReply(@Param('reviewId') reviewId: string) {
    const job = await this.queueService.addAiReplyJob({ reviewId });
    return {
      queued: true,
      jobId: job?.id ?? 'memory-dev',
      message: 'AI reply generation queued.',
    };
  }

  @Post(':reviewId/replies/post')
  postReply(@Param('reviewId') reviewId: string, @Body() body: { reply: string }) {
    return {
      reviewId,
      posted: false,
      draft: body.reply,
      message: 'Posting to Google is stubbed until OAuth token storage is configured.',
    };
  }
}
