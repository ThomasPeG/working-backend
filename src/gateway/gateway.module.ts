import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ServiceRegistryService } from './services/service-registry.service';
import { LoadBalancerService } from './services/load-balancer.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { RateLimitingService } from './services/rate-limiting.service';
import { MessageBrokerService } from './services/message-broker.service';
import { HealthCheckService } from './services/health-check.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    NotificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [
    GatewayService,
    ServiceRegistryService,
    LoadBalancerService,
    CircuitBreakerService,
    RateLimitingService,
    MessageBrokerService,
    HealthCheckService,
  ],
  exports: [
    GatewayService,
    ServiceRegistryService,
    MessageBrokerService,
  ],
})
export class GatewayModule {}