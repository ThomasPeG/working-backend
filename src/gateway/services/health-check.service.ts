import { Injectable, Logger } from '@nestjs/common';
import { ServiceRegistryService } from './service-registry.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import axios from 'axios';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
  lastCheck: Date;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private healthCheckInterval: NodeJS.Timeout;

  constructor(
    private serviceRegistry: ServiceRegistryService,
    private circuitBreaker: CircuitBreakerService,
  ) {
    // Ejecutar health checks cada 30 segundos
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000);
  }

  async checkAllServices(): Promise<Record<string, HealthStatus[]>> {
    const allServices = this.serviceRegistry.getAllServices();
    const healthStatuses: Record<string, HealthStatus[]> = {};

    for (const [serviceName, instances] of Object.entries(allServices)) {
      healthStatuses[serviceName] = await Promise.all(
        instances.map(instance => this.checkServiceHealth(instance.url, serviceName))
      );
    }

    return healthStatuses;
  }

  private async checkServiceHealth(serviceUrl: string, serviceName: string): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${serviceUrl}/${serviceName}/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500,
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.status >= 200 && response.status < 300;
      
      return {
        service: serviceName,
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        lastCheck: new Date(),
      };
    }
  }

  private async performHealthChecks(): Promise<void> {
    const allServices = this.serviceRegistry.getAllServices();
    
    for (const [serviceName, instances] of Object.entries(allServices)) {
      for (const instance of instances) {
        const healthStatus = await this.checkServiceHealth(instance.url, serviceName);
        
        // Actualizar el estado en el registro de servicios
        this.serviceRegistry.updateServiceHealth(
          serviceName,
          instance.id,
          healthStatus.status
        );
        
        // Si el servicio está unhealthy, registrar fallo en circuit breaker
        if (healthStatus.status === 'unhealthy') {
          this.circuitBreaker.recordFailure(serviceName);
        } else {
          this.circuitBreaker.recordSuccess(serviceName);
        }
      }
    }
  }

  getSystemHealth(): any {
    const circuits = this.circuitBreaker.getAllCircuits();
    const services = this.serviceRegistry.getAllServices();
    
    return {
      timestamp: new Date(),
      services: Object.keys(services).map(serviceName => ({
        name: serviceName,
        instances: services[serviceName].length,
        healthyInstances: services[serviceName].filter(s => s.health === 'healthy').length,
        circuitBreakerState: circuits[serviceName]?.state || 'CLOSED',
      })),
      circuitBreakers: circuits,
    };
  }

  onModuleDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}