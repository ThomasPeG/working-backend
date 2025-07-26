import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  UseGuards,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GatewayService } from './gateway.service';
import { CircuitBreakerInterceptor } from './interceptors/circuit-breaker.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RateLimitingInterceptor } from './interceptors/rate-limiting.interceptor';

@ApiTags('Gateway')
@Controller('api/v1')
@UseGuards(ThrottlerGuard)
@UseInterceptors(LoggingInterceptor, CircuitBreakerInterceptor, RateLimitingInterceptor) // AGREGAR AQUÍ
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  // ========== USERS MICROSERVICE ==========
  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(@Query() query: any, @Headers() headers: any) {
    return this.gatewayService.forwardRequest('users', 'GET', '/users', {
      query,
      headers,
    });
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserById(@Param('id') id: string, @Headers() headers: any) {
    return this.gatewayService.forwardRequest('users', 'GET', `/users/${id}`, {
      headers,
    });
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateUser(
    @Param('id') id: string,
    @Body() body: any,
    @Headers() headers: any,
  ) {
    return this.gatewayService.forwardRequest('users', 'PUT', `/users/${id}`, {
      body,
      headers,
    });
  }

  // ========== AUTH MICROSERVICE ==========
  @Post('auth/login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() body: any) {
    return this.gatewayService.forwardRequest('auth', 'POST', '/auth/login', {
      body,
    });
  }

  @Post('auth/register')
  @ApiOperation({ summary: 'User registration' })
  async register(@Body() body: any) {
    return this.gatewayService.forwardRequest('auth', 'POST', '/auth/register', {
      body,
    });
  }

  @Post('auth/refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async refreshToken(@Headers() headers: any) {
    return this.gatewayService.forwardRequest('auth', 'POST', '/auth/refresh', {
      headers,
    });
  }

  // ========== JOBS MICROSERVICE ==========
  @Get('jobs')
  @ApiOperation({ summary: 'Get all jobs' })
  async getJobs(@Query() query: any) {
    return this.gatewayService.forwardRequest('jobs', 'GET', '/jobs', {
      query,
    });
  }

  @Post('jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createJob(@Body() body: any, @Headers() headers: any) {
    return this.gatewayService.forwardRequest('jobs', 'POST', '/jobs', {
      body,
      headers,
    });
  }

  @Get('jobs/:id')
  async getJobById(@Param('id') id: string) {
    return this.gatewayService.forwardRequest('jobs', 'GET', `/jobs/${id}`, {});
  }

  // ========== NOTIFICATIONS MICROSERVICE ==========
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getNotifications(@Query() query: any, @Headers() headers: any) {
    console.log('query', JSON.stringify(query), 'headers', headers);
    return this.gatewayService.forwardRequest(
      'notifications',
      'GET',
      '/notifications',
      { query, headers },
    );
  }

  @Post('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createNotification(@Body() body: any, @Headers() headers: any) {
    return this.gatewayService.forwardRequest(
      'notifications',
      'POST',
      '/notifications',
      { body, headers },
    );
  }

  // ========== MESSAGES MICROSERVICE ==========
  @Get('messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMessages(@Query() query: any, @Headers() headers: any) {
    return this.gatewayService.forwardRequest('messages', 'GET', '/messages', {
      query,
      headers,
    });
  }

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async sendMessage(@Body() body: any, @Headers() headers: any) {
    return this.gatewayService.forwardRequest('messages', 'POST', '/messages', {
      body,
      headers,
    });
  }

  // ========== HEALTH CHECK ==========
  @Get('health')
  @ApiOperation({ summary: 'Health check for all services' })
  async healthCheck() {
    return this.gatewayService.getHealthStatus();
  }

  // ========== SERVICE DISCOVERY ==========
  @Get('services')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get registered services' })
  async getServices() {
    return this.gatewayService.getRegisteredServices();
  }

  @Post('reset-circuit/:serviceName')
  async resetCircuitBreaker(@Param('serviceName') serviceName: string) {
    console.log('serviceName', serviceName);
    // Acceder al circuit breaker a través del gateway service
    this.gatewayService['circuitBreaker'].resetCircuit(serviceName);
    return { message: `Circuit breaker for ${serviceName} has been reset` };
  }
}