import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection =
    process.env.REDIS_URL && new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

  private readonly reviewQueue =
    this.connection && new Queue('review-sync', { connection: this.connection });

  private readonly aiQueue =
    this.connection && new Queue('ai-replies', { connection: this.connection });

  async addReviewSyncJob(data: { businessId: string }) {
    if (!this.reviewQueue) return null;
    return this.reviewQueue.add('sync-business-reviews', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
    });
  }

  async addAiReplyJob(data: { reviewId: string }) {
    if (!this.aiQueue) return null;
    return this.aiQueue.add('generate-review-reply', data, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 100,
    });
  }

  async onModuleDestroy() {
    await this.reviewQueue?.close();
    await this.aiQueue?.close();
    await this.connection?.quit();
  }
}
