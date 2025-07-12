import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateJobCommentDto } from './dto/create-job-comment.dto';
import { UpdateJobCommentDto } from './dto/update-job-comment.dto';
import { CreateJobShareDto } from './dto/create-job-share.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Request() req, @Body() createJobDto: CreateJobDto) {
    console.log(createJobDto);
    return this.jobsService.create(req.user.userId, createJobDto);
  }

  @Get()
  findAll(
    @Query('limit') limit: string,
    @Query('page') page: string
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    const pageNum = page ? parseInt(page) : 1;
    return this.jobsService.findAll(limitNum, pageNum);
  }

  @Get('my-jobs')
  findMyJobs(@Request() req) {
    return this.jobsService.findByUserId(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateJobDto: Partial<any>,
  ) {
    return this.jobsService.update(id, req.user.userId, updateJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.jobsService.remove(id, req.user.userId);
  }

  @Post(':id/like')
  likeJob(@Request() req, @Param('id') id: string) {
    return this.jobsService.likeJob(id, req.user.userId);
  }
  
  @Post(':id/comment')
  addComment(
    @Request() req,
    @Param('id') id: string,
    @Body() createJobCommentDto: CreateJobCommentDto,
  ) {
    // Asegurarse de que el jobId en el DTO coincida con el ID en la URL
    createJobCommentDto.jobId = id;
    return this.jobsService.addComment(id, req.user.userId, createJobCommentDto);
  }
  
  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.jobsService.getComments(id);
  }
  
  @Patch('comment/:id')
  updateComment(
    @Request() req,
    @Param('id') commentId: string,
    @Body() updateJobCommentDto: UpdateJobCommentDto,
  ) {
    return this.jobsService.updateComment(req.user.userId, commentId, updateJobCommentDto);
  }
  
  @Delete('comment/:id')
  deleteComment(@Request() req, @Param('id') commentId: string) {
    return this.jobsService.deleteComment(req.user.userId, commentId);
  }
  
  @Post(':id/share')
  shareJob(
    @Request() req,
    @Param('id') id: string,
    @Body() createJobShareDto: CreateJobShareDto,
  ) {
    // Asegurarse de que el jobId en el DTO coincida con el ID en la URL
    createJobShareDto.jobId = id;
    return this.jobsService.shareJob(req.user.userId, createJobShareDto);
  }
}