import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CircuitBreakerService } from '../services/circuit-breaker.service';

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  constructor(private circuitBreaker: CircuitBreakerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const serviceName = this.extractServiceName(request.url);

    if (serviceName && this.circuitBreaker.isOpen(serviceName)) {
      return throwError(
        new HttpException(
          `Service ${serviceName} is temporarily unavailable`,
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    }

    return next.handle().pipe(
      catchError((error) => {
        if (serviceName) {
          this.circuitBreaker.recordFailure(serviceName);
        }
        return throwError(error);
      }),
    );
  }

  private extractServiceName(url: string): string | null {
    const match = url.match(/\/api\/v1\/(\w+)/);
    return match ? match[1] : null;
  }
}