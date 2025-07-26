import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class MessageBrokerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessageBrokerService.name);
  private connection: any; // Usar any para evitar conflictos de tipos
  private channel: any;
  private readonly exchangeName = 'gateway.events';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const rabbitmqUrl = this.configService.get('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Crear exchange para eventos del gateway
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      
      this.logger.log('Connected to RabbitMQ for gateway events');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error.message);
      throw error;
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error.message);
    }
  }

  async publishEvent(eventType: string, data: any): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const message = {
        eventType,
        data,
        timestamp: new Date().toISOString(),
        source: 'gateway',
      };

      const routingKey = `gateway.${eventType}`;
      
      await this.channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      this.logger.debug(`Event published: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${eventType}:`, error.message);
    }
  }

  async subscribeToEvent(eventType: string, handler: Function): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const queueName = `gateway.${eventType}.queue`;
      const routingKey = `gateway.${eventType}`;
      
      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.bindQueue(queueName, this.exchangeName, routingKey);
      
      await this.channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await handler(content);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error(`Error processing event ${eventType}:`, error.message);
            this.channel.nack(msg, false, false);
          }
        }
      });

      this.logger.log(`Subscribed to event: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to event ${eventType}:`, error.message);
    }
  }

  // Método para comunicación directa entre servicios
  async sendDirectMessage(serviceName: string, message: any): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const queueName = `${serviceName}.direct`;
      await this.channel.assertQueue(queueName, { durable: true });
      
      await this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      this.logger.debug(`Direct message sent to ${serviceName}`);
    } catch (error) {
      this.logger.error(`Failed to send direct message to ${serviceName}:`, error.message);
    }
  }
}