import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInteraction, UserInteractionDocument } from './schemas/user-interaction.schema';
import { PopularityMetrics, PopularityMetricsDocument } from './schemas/popularity-metrics.schema';
import { TrackInteractionDto } from './dto/track-interaction.dto';
import { Response } from '../interfaces/response.interface';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(UserInteraction.name)
    private userInteractionModel: Model<UserInteractionDocument>,
    @InjectModel(PopularityMetrics.name)
    private popularityMetricsModel: Model<PopularityMetricsDocument>,
  ) {}

  // Registrar interacción de usuario
  async trackInteraction(
    userId: string,
    trackInteractionDto: TrackInteractionDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Response> {
    try {
      const interaction = new this.userInteractionModel({
        userId,
        ...trackInteractionDto,
        timestamp: trackInteractionDto.timestamp ? new Date(trackInteractionDto.timestamp) : new Date(),
        ipAddress,
        userAgent,
      });

      await interaction.save();

      // Actualizar métricas en tiempo real (opcional, puede ser async)
      this.updatePopularityMetrics(trackInteractionDto);

      return {
        access_token: null,
        data: { interactionId: interaction._id },
        message: 'Interaction tracked successfully',
      };
    } catch (error) {
      throw new Error(`Error tracking interaction: ${error.message}`);
    }
  }

  // Obtener métricas de popularidad
  async getPopularityMetrics(
    targetType: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Response> {
    const query: any = { targetType, period };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const metrics = await this.popularityMetricsModel
      .find(query)
      .sort({ 'metrics.popularityScore': -1, date: -1 })
      .limit(limit)
      .allowDiskUse(true)
      .exec();

    return {
      access_token: null,
      data: { metrics },
      message: 'Popularity metrics retrieved successfully',
    };
  }

  // Obtener analytics de usuario específico
  async getUserAnalytics(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    eventType?: string,
  ): Promise<Response> {
    const query: any = { userId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }
    
    if (eventType) {
      query.eventType = eventType;
    }

    const interactions = await this.userInteractionModel
      .find(query)
      .sort({ timestamp: -1 })
      .allowDiskUse(true)
      .exec();

    // Agregar estadísticas
    const stats = await this.userInteractionModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          lastInteraction: { $max: '$timestamp' },
        },
      },
    ]);

    return {
      access_token: null,
      data: { interactions, stats },
      message: 'User analytics retrieved successfully',
    };
  }

  // Obtener trending items
  async getTrendingItems(
    targetType: string,
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day',
    limit: number = 10,
  ): Promise<Response> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const trending = await this.userInteractionModel.aggregate([
      {
        $match: {
          targetType,
          targetId: { $exists: true },
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$targetId',
          totalInteractions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          views: {
            $sum: { $cond: [{ $eq: ['$eventType', 'view'] }, 1, 0] },
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] },
          },
          applications: {
            $sum: { $cond: [{ $eq: ['$eventType', 'application'] }, 1, 0] },
          },
          likes: {
            $sum: { $cond: [{ $eq: ['$eventType', 'like'] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          popularityScore: {
            $add: [
              { $multiply: ['$views', 1] },
              { $multiply: ['$clicks', 2] },
              { $multiply: ['$applications', 5] },
              { $multiply: ['$likes', 3] },
            ],
          },
        },
      },
      { $sort: { popularityScore: -1 } },
      { $limit: limit },
    ]);

    return {
      access_token: null,
      data: { trending, timeframe, period: `${startDate.toISOString()} - ${now.toISOString()}` },
      message: 'Trending items retrieved successfully',
    };
  }

  // Actualizar métricas de popularidad (proceso en background)
  private async updatePopularityMetrics(interaction: TrackInteractionDto) {
    if (!interaction.targetId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const periods = ['daily', 'weekly', 'monthly'];
    
    for (const period of periods) {
      let periodDate = new Date(today);
      
      if (period === 'weekly') {
        const dayOfWeek = today.getDay();
        periodDate.setDate(today.getDate() - dayOfWeek);
      } else if (period === 'monthly') {
        periodDate.setDate(1);
      }

      await this.popularityMetricsModel.findOneAndUpdate(
        {
          targetType: interaction.targetType,
          targetId: interaction.targetId,
          period,
          date: periodDate,
        },
        {
          $inc: {
            [`metrics.${interaction.eventType}`]: 1,
            'metrics.totalInteractions': 1,
          },
          $set: {
            lastUpdated: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    }
  }
}