import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { JobTypesService } from './job-types.service';
import { CreateJobTypeDto } from './dto/create-job-type.dto';
import { CreateManyJobTypesDto } from './dto/create-many-job-types.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('job-types')
export class JobTypesController {
  constructor(private readonly jobTypesService: JobTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createJobTypeDto: CreateJobTypeDto) {
    return this.jobTypesService.create(createJobTypeDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  createMany(@Body() createManyJobTypesDto: CreateManyJobTypesDto) {
    return this.jobTypesService.createMany(createManyJobTypesDto);
  }

  @Get()
  findAll() {
    return this.jobTypesService.findAll();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.jobTypesService.findByCategory(category);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.jobTypesService.search(query);
  }

  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.jobTypesService.findByName(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateData: Partial<CreateJobTypeDto>) {
    return this.jobTypesService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.jobTypesService.remove(id);
  }

  @Get('suggest')
  suggest(@Query('q') query: string) {
    return this.jobTypesService.suggestJobTypes(query);
  }

  @Get('suggest-similar')
  findSimilar(@Query('name') name: string, @Query('threshold') threshold: number) {
    return this.jobTypesService.findSimilarJobTypes(name, threshold || 0.85);
  }
}