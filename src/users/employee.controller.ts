import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/employee/create-employee.dto';
import { UpdateEmployeeDto } from './dto/employee/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEducationDto } from './dto/education/create-education.dto';
import { CreateExperienceDto } from './dto/experience/create-experience.dto';
import { UpdateExperienceDto } from './dto/experience/update-experience.dto';

@Controller('employee-profile')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post(':id')
  create(@Param('id') id: string, @Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(id, createEmployeeDto);
  }

  @Get('profile')
  findMyProfile(@Request() req) {
    // Obtener el ID del usuario del token JWT
    console.log('User from request:', req.user); // Para depuración
    const userId = req.user.userId;
    return this.employeeService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findByUserId(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

  // Nuevos endpoints para Education y Experience

  @Post(':id/education')
  addEducation(
    @Param('id') id: string,
    @Body() createEducationDto: CreateEducationDto
  ) {
    return this.employeeService.addEducation(id, createEducationDto);
  }

  @Post(':id/experience')
  addExperience(
    @Param('id') id: string,
    @Body() createExperienceDto: CreateExperienceDto
  ) {
    return this.employeeService.addExperience(id, createExperienceDto);
  }

  @Patch('experience/:id')
  updateExperience(
    @Param('id') id: string,
    @Body() updateExperienceDto: UpdateExperienceDto
  ) {
    return this.employeeService.updateExperience(id, updateExperienceDto);
  }

  @Patch('education/:id')
  updateEducation(
    @Param('id') id: string,
    @Body() updateEducationDto: CreateEducationDto
  ) {
    return this.employeeService.updateEducation(id, updateEducationDto);
  }

  @Delete('experience/:id')
  removeExperience(@Param('id') id: string) {
    return this.employeeService.removeExperience(id);
  }

  @Delete('education/:id')
  removeEducation(@Param('id') id: string) {
    return this.employeeService.removeEducation(id);
  }
}