import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsController } from './controllers/analytics.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { BusinessesController } from './controllers/businesses.controller.js';
import { ReviewsController } from './controllers/reviews.controller.js';
import { QueueService } from './services/queue.service.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AuthController, BusinessesController, ReviewsController, AnalyticsController],
  providers: [QueueService],
})
export class AppModule {}
