import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ServiceRegistryService } from './services/service-registry.service';
import { LoadBalancerService } from './services/load-balancer.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { MessageBrokerService } from './services/message-broker.service';
import { HealthCheckService } from './services/health-check.service';
import axios, { AxiosResponse } from 'axios';

export interface RequestOptions {
  body?: any;
  query?: any;
  headers?: any;
  timeout?: number;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private readonly serviceRegistry: ServiceRegistryService,
    private readonly loadBalancer: LoadBalancerService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly messageBroker: MessageBrokerService,
    private readonly healthCheck: HealthCheckService,
  ) {}

  async forwardRequest(
    serviceName: string,
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<any> {
    try {
      // 1. Obtener instancia del servicio
      const serviceInstance = await this.loadBalancer.getServiceInstance(
        serviceName,
      );

      if (!serviceInstance) {
        throw new HttpException(
          `Service ${serviceName} not available`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // 2. Verificar circuit breaker
      if (this.circuitBreaker.isOpen(serviceName)) {
        throw new HttpException(
          `Service ${serviceName} is temporarily unavailable`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // 3. Construir URL completa
      const url = `${serviceInstance.url}${path}`;

      // 4. Preparar configuración de la petición
      const config = {
        method: method.toLowerCase(),
        url,
        timeout: options.timeout || 10000,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...(options.body && { data: options.body }),
        ...(options.query && { params: options.query }),
      };

      // AGREGAR: Log detallado de la configuración
      this.logger.log(`Forwarding ${method} request to ${serviceName}: ${url}`);
      this.logger.debug('Request config:', JSON.stringify(config, null, 2));

      // 5. Realizar petición
      const response: AxiosResponse = await axios(config);

      // 6. Registrar éxito en circuit breaker
      this.circuitBreaker.recordSuccess(serviceName);

      // 7. Enviar evento de auditoría
      await this.messageBroker.publishEvent('request.completed', {
        service: serviceName,
        method,
        path,
        status: response.status,
        timestamp: new Date(),
      });

      return response.data;
    } catch (error) {
      // Registrar fallo en circuit breaker
      this.circuitBreaker.recordFailure(serviceName);

      // MEJORAR: Log más detallado del error
      this.logger.error(
        `Error forwarding request to ${serviceName}: ${error.message}`,
        {
          method,
          path,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          requestConfig: error.config,
          stack: error.stack
        }
      );

      // Enviar evento de error
      await this.messageBroker.publishEvent('request.failed', {
        service: serviceName,
        method,
        path,
        error: error.message,
        timestamp: new Date(),
      });

      // Manejar diferentes tipos de errores
      if (error.response) {
        throw new HttpException(
          error.response.data,
          error.response.status,
        );
      } else if (error.code === 'ECONNREFUSED') {
        throw new HttpException(
          `Service ${serviceName} is unavailable`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getHealthStatus(): Promise<any> {
    return this.healthCheck.checkAllServices();
  }

  async getRegisteredServices(): Promise<any> {
    return this.serviceRegistry.getAllServices();
  }

  // Método para comunicación asíncrona
  async publishEvent(eventType: string, data: any): Promise<void> {
    await this.messageBroker.publishEvent(eventType, data);
  }

  // Método para suscribirse a eventos
  async subscribeToEvents(eventType: string, handler: Function): Promise<void> {
    await this.messageBroker.subscribeToEvent(eventType, handler);
  }
}