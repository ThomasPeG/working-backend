import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/job/create-job.dto';
import { UpdateJobDto } from './dto/job/update-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createJobDto: CreateJobDto) {
    // Obtener el ID del empleador del token JWT
    const employerId = req.user.userId;
    return this.jobService.create(employerId, createJobDto);
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.jobService.findAll(filters);
  }

  @Get('my-jobs')
  @UseGuards(JwtAuthGuard)
  findMyJobs(@Request() req) {
    // Obtener el ID del empleador del token JWT
    const employerId = req.user.userId;
    return this.jobService.findByEmployerId(employerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    // Obtener el ID del empleador del token JWT
    const employerId = req.user.userId;
    return this.jobService.update(id, employerId, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    // Obtener el ID del empleador del token JWT
    const employerId = req.user.userId;
    return this.jobService.remove(id, employerId);
  }
}