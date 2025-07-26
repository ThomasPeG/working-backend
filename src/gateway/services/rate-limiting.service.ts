import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en milisegundos
  maxRequests: number; // Máximo número de requests
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitingService {
  private readonly logger = new Logger(RateLimitingService.name);
  private readonly rateLimitStore = new Map<string, RateLimitEntry>();
  private readonly defaultConfig: RateLimitConfig;

  constructor(private configService: ConfigService) {
    this.defaultConfig = {
      windowMs: this.configService.get('RATE_LIMIT_WINDOW_MS', 60000), // 1 minuto
      maxRequests: this.configService.get('RATE_LIMIT_MAX_REQUESTS', 100),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    };

    // Limpiar entradas expiradas cada 5 minutos
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  /**
   * Verifica si una request está dentro del límite de rate limiting
   */
  isAllowed(
    identifier: string,
    config: Partial<RateLimitConfig> = {},
  ): { allowed: boolean; resetTime?: number; remaining?: number } {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    const key = this.generateKey(identifier, finalConfig.windowMs);

    let entry = this.rateLimitStore.get(key);

    // Si no existe entrada o ha expirado, crear nueva
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + finalConfig.windowMs,
      };
      this.rateLimitStore.set(key, entry);
      
      return {
        allowed: true,
        resetTime: entry.resetTime,
        remaining: finalConfig.maxRequests - 1,
      };
    }

    // Incrementar contador
    entry.count++;

    const allowed = entry.count <= finalConfig.maxRequests;
    const remaining = Math.max(0, finalConfig.maxRequests - entry.count);

    if (!allowed) {
      this.logger.warn(
        `Rate limit exceeded for ${identifier}. Count: ${entry.count}, Max: ${finalConfig.maxRequests}`,
      );
    }

    return {
      allowed,
      resetTime: entry.resetTime,
      remaining,
    };
  }

  /**
   * Obtiene información del rate limit para un identificador
   */
  getRateLimitInfo(
    identifier: string,
    windowMs: number = this.defaultConfig.windowMs,
  ): { count: number; resetTime: number; remaining: number } | null {
    const key = this.generateKey(identifier, windowMs);
    const entry = this.rateLimitStore.get(key);

    if (!entry || Date.now() >= entry.resetTime) {
      return null;
    }

    return {
      count: entry.count,
      resetTime: entry.resetTime,
      remaining: Math.max(0, this.defaultConfig.maxRequests - entry.count),
    };
  }

  /**
   * Resetea el rate limit para un identificador específico
   */
  resetRateLimit(identifier: string, windowMs: number = this.defaultConfig.windowMs): void {
    const key = this.generateKey(identifier, windowMs);
    this.rateLimitStore.delete(key);
    this.logger.log(`Rate limit reset for ${identifier}`);
  }

  /**
   * Obtiene estadísticas generales del rate limiting
   */
  getStats(): {
    totalEntries: number;
    activeEntries: number;
    expiredEntries: number;
  } {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    this.rateLimitStore.forEach((entry) => {
      if (now < entry.resetTime) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
    });

    return {
      totalEntries: this.rateLimitStore.size,
      activeEntries,
      expiredEntries,
    };
  }

  /**
   * Configura rate limits específicos por servicio
   */
  getServiceRateLimit(serviceName: string): RateLimitConfig {
    const serviceConfigs: Record<string, Partial<RateLimitConfig>> = {
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 10, // Máximo 5 intentos de login por 15 min
      },
      users: {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 30,
      },
      jobs: {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 50,
      },
      notifications: {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 5,
      },
      messages: {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 40,
      },
    };

    return {
      ...this.defaultConfig,
      ...serviceConfigs[serviceName],
    };
  }

  private generateKey(identifier: string, windowMs: number): string {
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
    return `${identifier}:${windowStart}`;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    this.rateLimitStore.forEach((entry, key) => {
      if (now >= entry.resetTime) {
        this.rateLimitStore.delete(key);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }
}