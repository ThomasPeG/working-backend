// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { ClientKafka, ClientProxyFactory, Transport } from '@nestjs/microservices';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class KafkaClientService implements OnModuleInit {
//   private client: ClientKafka;

//   constructor(private configService: ConfigService) {
//     this.client = ClientProxyFactory.create({
//       transport: Transport.KAFKA,
//       options: {
//         client: {
//           clientId: 'main-service',
//           brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
//         },
//         consumer: {
//           groupId: 'main-service-consumer',
//         },
//       },
//     }) as ClientKafka;
//   }

//   async onModuleInit() {
//     await this.client.connect();
//   }

//   async sendBulkNotifications(notifications: any[]) {
//     return this.client.emit('bulk_notifications', { notifications });
//   }

//   async sendSystemNotification(userIds: string[], message: string, metadata?: any) {
//     return this.client.emit('system_notification', {
//       userIds,
//       message,
//       metadata,
//       timestamp: new Date(),
//     });
//   }
// }