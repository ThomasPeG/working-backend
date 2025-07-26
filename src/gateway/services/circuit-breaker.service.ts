import { Injectable, Logger } from '@nestjs/common';

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: Date | null;
  nextAttemptTime: Date | null;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuits: Map<string, CircuitBreakerState> = new Map();
  
  private readonly failureThreshold = 5;
  private readonly timeoutDuration = 60000; // 1 minuto
  private readonly retryTimePeriod = 30000; // 30 segundos

  private getCircuit(serviceName: string): CircuitBreakerState {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        state: 'CLOSED',
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
      });
    }
    return this.circuits.get(serviceName)!;
  }

  isOpen(serviceName: string): boolean {
    const circuit = this.getCircuit(serviceName);
    
    if (circuit.state === 'OPEN') {
      if (circuit.nextAttemptTime && new Date() > circuit.nextAttemptTime) {
        circuit.state = 'HALF_OPEN';
        this.logger.log(`Circuit breaker for ${serviceName} moved to HALF_OPEN`);
        return false;
      }
      return true;
    }
    
    return false;
  }

  recordSuccess(serviceName: string): void {
    const circuit = this.getCircuit(serviceName);
    
    if (circuit.state === 'HALF_OPEN') {
      circuit.state = 'CLOSED';
      circuit.failureCount = 0;
      circuit.lastFailureTime = null;
      circuit.nextAttemptTime = null;
      this.logger.log(`Circuit breaker for ${serviceName} moved to CLOSED`);
    } else if (circuit.state === 'CLOSED') {
      circuit.failureCount = Math.max(0, circuit.failureCount - 1);
    }
  }

  recordFailure(serviceName: string): void {
    const circuit = this.getCircuit(serviceName);
    circuit.failureCount++;
    circuit.lastFailureTime = new Date();
    
    if (circuit.failureCount >= this.failureThreshold) {
      circuit.state = 'OPEN';
      circuit.nextAttemptTime = new Date(Date.now() + this.retryTimePeriod);
      this.logger.warn(
        `Circuit breaker for ${serviceName} moved to OPEN after ${circuit.failureCount} failures`
      );
    }
  }

  getCircuitState(serviceName: string): CircuitBreakerState {
    return this.getCircuit(serviceName);
  }

  getAllCircuits(): Record<string, CircuitBreakerState> {
    const result: Record<string, CircuitBreakerState> = {};
    this.circuits.forEach((state, serviceName) => {
      result[serviceName] = state;
    });
    return result;
  }

  resetCircuit(serviceName: string): void {
    const circuit = this.getCircuit(serviceName);
    circuit.state = 'CLOSED';
    circuit.failureCount = 0;
    circuit.lastFailureTime = null;
    circuit.nextAttemptTime = null;
    this.logger.log(`Circuit breaker for ${serviceName} manually reset`);
  }
}