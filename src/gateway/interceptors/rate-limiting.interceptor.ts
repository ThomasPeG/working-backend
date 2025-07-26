import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RateLimitingService } from '../services/rate-limiting.service';

@Injectable()
export class RateLimitingInterceptor implements NestInterceptor {
  constructor(private readonly rateLimitingService: RateLimitingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Extraer nombre del servicio de la URL
    const serviceName = this.extractServiceName(request.url);
    
    if (serviceName) {
      // Obtener configuración de rate limit para el servicio
      const config = this.rateLimitingService.getServiceRateLimit(serviceName);
      
      // Usar IP + servicio como identificador
      const identifier = `${request.ip}:${serviceName}`;
      
      // Verificar si está permitido
      const result = this.rateLimitingService.isAllowed(identifier, config);
      
      // Agregar headers de rate limit
      response.setHeader('X-RateLimit-Limit', config.maxRequests);
      response.setHeader('X-RateLimit-Remaining', result.remaining || 0);
      response.setHeader('X-RateLimit-Reset', result.resetTime || 0);
      
      if (!result.allowed) {
        throw new HttpException(
          {
            message: 'Rate limit exceeded',
            service: serviceName,
            resetTime: result.resetTime,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return next.handle();
  }

  private extractServiceName(url: string): string | null {
    const match = url.match(/\/api\/v1\/(\w+)/);
    return match ? match[1] : null;
  }
}