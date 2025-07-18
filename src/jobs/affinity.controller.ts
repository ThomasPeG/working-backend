import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AffinityService, AffinityResult } from './services/affinity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('affinity')
@UseGuards(JwtAuthGuard)
export class AffinityController {
  constructor(private readonly affinityService: AffinityService) {}

  @Post('calculate')
  async calculateAffinity(
    @Body() body: { userId: string; jobId: string; customWeights?: any }
  ): Promise<AffinityResult> {
    return this.affinityService.calculateAffinity(
      body.userId, 
      body.jobId, 
      body.customWeights
    );
  }

  @Get('job/:jobId/candidates')
  async getBestCandidates(
    @Param('jobId') jobId: string,
    @Query('limit') limit?: string,
    @Query('minAffinity') minAffinity?: string
  ): Promise<AffinityResult[]> {
    return this.affinityService.findBestCandidates(
      jobId,
      limit ? parseInt(limit) : 20,
      minAffinity ? parseInt(minAffinity) : 30
    );
  }

  @Get('user/:userId/recommendations')
  async getJobRecommendations(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('minAffinity') minAffinity?: string
  ): Promise<AffinityResult[]> {
    return this.affinityService.findBestJobsForUser(
      userId,
      limit ? parseInt(limit) : 20,
      minAffinity ? parseInt(minAffinity) : 30
    );
  }
}