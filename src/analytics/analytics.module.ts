import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UserInteraction, UserInteractionSchema } from './schemas/user-interaction.schema';
import { PopularityMetrics, PopularityMetricsSchema } from './schemas/popularity-metrics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserInteraction.name, schema: UserInteractionSchema },
      { name: PopularityMetrics.name, schema: PopularityMetricsSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}