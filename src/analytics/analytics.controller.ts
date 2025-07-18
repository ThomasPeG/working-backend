import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { TrackInteractionDto } from './dto/track-interaction.dto';
import { Response } from '../interfaces/response.interface';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  async trackInteraction(
    @Body() trackInteractionDto: TrackInteractionDto,
    @Req() req: any,
  ): Promise<Response> {
    const userId = req.user.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    console.log('userAgent', userAgent);

    return this.analyticsService.trackInteraction(
      userId,
      trackInteractionDto,
      ipAddress,
      userAgent,
    );
  }

  @Get('popularity')
  async getPopularityMetrics(
    @Query('targetType') targetType: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Response> {
    return this.analyticsService.getPopularityMetrics(
      targetType,
      period,
      limit,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('user')
  async getUserAnalytics(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventType') eventType?: string,
  ): Promise<Response> {
    const userId = req.user.userId;
    
    return this.analyticsService.getUserAnalytics(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      eventType,
    );
  }

  @Get('trending')
  async getTrendingItems(
    @Query('targetType') targetType: string,
    @Query('timeframe') timeframe: 'hour' | 'day' | 'week' | 'month' = 'day',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Response> {
    return this.analyticsService.getTrendingItems(targetType, timeframe, limit);
  }
}