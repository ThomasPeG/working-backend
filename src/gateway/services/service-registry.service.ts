import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ServiceInstance {
  id: string;
  name: string;
  url: string;
  health: 'healthy' | 'unhealthy';
  lastHealthCheck: Date;
  metadata?: any;
}

@Injectable()
export class ServiceRegistryService {
  private readonly logger = new Logger(ServiceRegistryService.name);
  private services: Map<string, ServiceInstance[]> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeServices();
  }

  private initializeServices() {
    // Configuración de servicios desde variables de entorno
    const services = [
      // {
      //   name: 'users',
      //   instances: [
      //     {
      //       id: 'users-1',
      //       url: this.configService.get('USERS_SERVICE_URL', 'http://localhost:3001'),
      //     },
      //   ],
      // },
      // {
      //   name: 'auth',
      //   instances: [
      //     {
      //       id: 'auth-1',
      //       url: this.configService.get('AUTH_SERVICE_URL', 'http://localhost:3002'),
      //     },
      //   ],
      // },
      // {
      //   name: 'jobs',
      //   instances: [
      //     {
      //       id: 'jobs-1',
      //       url: this.configService.get('JOBS_SERVICE_URL', 'http://localhost:3003'),
      //     },
      //   ],
      // },
      // {
      //   name: 'messages',
      //   instances: [
      //     {
      //       id: 'messages-1',
      //       url: this.configService.get('MESSAGES_SERVICE_URL', 'http://localhost:3005'),
      //     },
      //   ],
      // },
      {
        name: 'notifications',
        instances: [
          {
            id: 'notifications-1',
            url: this.configService.get('NOTIFICATIONS_SERVICE_URL', 'http://localhost:3004'),
          },
        ],
      }      
    ];

    services.forEach(service => {
      const instances = service.instances.map(instance => ({
        ...instance,
        name: service.name,
        health: 'unhealthy' as const, // Changed from 'unknown' to 'unhealthy'
        lastHealthCheck: new Date(),
      }));
      this.services.set(service.name, instances);
    });

    this.logger.log('Services initialized:', Array.from(this.services.keys()));
  }

  registerService(service: ServiceInstance): void {
    const existingServices = this.services.get(service.name) || [];
    const existingIndex = existingServices.findIndex(s => s.id === service.id);

    if (existingIndex >= 0) {
      existingServices[existingIndex] = service;
    } else {
      existingServices.push(service);
    }

    this.services.set(service.name, existingServices);
    this.logger.log(`Service registered: ${service.name}#${service.id}`);
  }

  unregisterService(serviceName: string, serviceId: string): void {
    const services = this.services.get(serviceName) || [];
    const filteredServices = services.filter(s => s.id !== serviceId);
    this.services.set(serviceName, filteredServices);
    this.logger.log(`Service unregistered: ${serviceName}#${serviceId}`);
  }

  getServiceInstances(serviceName: string): ServiceInstance[] {
    return this.services.get(serviceName) || [];
  }

  getHealthyInstances(serviceName: string): ServiceInstance[] {
    const instances = this.getServiceInstances(serviceName);
    return instances.filter(instance => instance.health === 'healthy');
  }

  getAllServices(): Record<string, ServiceInstance[]> {
    const result: Record<string, ServiceInstance[]> = {};
    this.services.forEach((instances, serviceName) => {
      result[serviceName] = instances;
    });
    return result;
  }

  updateServiceHealth(serviceName: string, serviceId: string, health: 'healthy' | 'unhealthy'): void {
    const instances = this.services.get(serviceName) || [];
    const instance = instances.find(s => s.id === serviceId);
    if (instance) {
      instance.health = health;
      instance.lastHealthCheck = new Date();
    }
  }
}