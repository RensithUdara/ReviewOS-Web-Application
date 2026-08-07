import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

const reviewSyncWorker = new Worker(
  'review-sync',
  async (job) => {
    console.log('[review-sync]', job.name, job.data);
    return {
      syncedReviews: 0,
      note: 'Connect Google Business Profile API client here.',
    };
  },
  { connection },
);

const aiReplyWorker = new Worker(
  'ai-replies',
  async (job) => {
    console.log('[ai-replies]', job.name, job.data);
    return {
      draftCreated: true,
      note: 'Call Gemini JSON-output prompt and persist ReviewReply here.',
    };
  },
  { connection },
);

for (const worker of [reviewSyncWorker, aiReplyWorker]) {
  worker.on('completed', (job) => console.log(`[${worker.name}] completed`, job.id));
  worker.on('failed', (job, error) => console.error(`[${worker.name}] failed`, job?.id, error));
}

async function shutdown() {
  await reviewSyncWorker.close();
  await aiReplyWorker.close();
  await connection.quit();
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

console.log('ReviewOS worker started.');
