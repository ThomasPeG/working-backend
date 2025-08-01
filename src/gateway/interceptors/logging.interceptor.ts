import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - User Agent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        this.logger.log(
          `Outgoing Response: ${method} ${url} - Status: ${response.statusCode} - ${responseTime}ms`,
        );
      }),
    );
  }
}