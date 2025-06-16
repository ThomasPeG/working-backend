import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/employee/create-employee.dto';
import { UpdateEmployeeDto } from './dto/employee/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Request() req, @Body() createEmployeeDto: CreateEmployeeDto) {
    // Obtener el ID del usuario del token JWT
    console.log('User from request:', req.user); // Para depuración
    const userId = req.user.userId;
    return this.employeeService.create(userId, createEmployeeDto);
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
}