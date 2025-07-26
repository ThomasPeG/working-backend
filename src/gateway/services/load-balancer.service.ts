import { Injectable, Logger } from '@nestjs/common';
import { ServiceRegistryService, ServiceInstance } from './service-registry.service';

type LoadBalancingStrategy = 'round-robin' | 'random' | 'least-connections';

@Injectable()
export class LoadBalancerService {
  private readonly logger = new Logger(LoadBalancerService.name);
  private roundRobinCounters: Map<string, number> = new Map();
  private connectionCounts: Map<string, number> = new Map();
  private strategy: LoadBalancingStrategy = 'round-robin';

  constructor(private serviceRegistry: ServiceRegistryService) {}

  async getServiceInstance(serviceName: string): Promise<ServiceInstance | null> {
    const healthyInstances = this.serviceRegistry.getHealthyInstances(serviceName);
    
    if (healthyInstances.length === 0) {
      // Fallback a instancias no saludables si no hay saludables
      const allInstances = this.serviceRegistry.getServiceInstances(serviceName);
      if (allInstances.length === 0) {
        this.logger.warn(`No instances available for service: ${serviceName}`);
        return null;
      }
      return this.selectInstance(allInstances, serviceName);
    }

    return this.selectInstance(healthyInstances, serviceName);
  }

  private selectInstance(instances: ServiceInstance[], serviceName: string): ServiceInstance {
    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobinSelection(instances, serviceName);
      case 'random':
        return this.randomSelection(instances);
      case 'least-connections':
        return this.leastConnectionsSelection(instances);
      default:
        return this.roundRobinSelection(instances, serviceName);
    }
  }

  private roundRobinSelection(instances: ServiceInstance[], serviceName: string): ServiceInstance {
    const currentCounter = this.roundRobinCounters.get(serviceName) || 0;
    const selectedInstance = instances[currentCounter % instances.length];
    this.roundRobinCounters.set(serviceName, currentCounter + 1);
    return selectedInstance;
  }

  private randomSelection(instances: ServiceInstance[]): ServiceInstance {
    const randomIndex = Math.floor(Math.random() * instances.length);
    return instances[randomIndex];
  }

  private leastConnectionsSelection(instances: ServiceInstance[]): ServiceInstance {
    let selectedInstance = instances[0];
    let minConnections = this.connectionCounts.get(selectedInstance.id) || 0;

    for (const instance of instances) {
      const connections = this.connectionCounts.get(instance.id) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedInstance = instance;
      }
    }

    return selectedInstance;
  }

  incrementConnections(instanceId: string): void {
    const current = this.connectionCounts.get(instanceId) || 0;
    this.connectionCounts.set(instanceId, current + 1);
  }

  decrementConnections(instanceId: string): void {
    const current = this.connectionCounts.get(instanceId) || 0;
    this.connectionCounts.set(instanceId, Math.max(0, current - 1));
  }

  setStrategy(strategy: LoadBalancingStrategy): void {
    this.strategy = strategy;
    this.logger.log(`Load balancing strategy changed to: ${strategy}`);
  }
}