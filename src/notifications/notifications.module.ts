import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { NotificationsService } from './notifications.service';
// import { NotificationsController } from './notifications.controller';
// import { KafkaClientService } from './services/kafka-client.service';
import { NotificationRabbitmqService } from './services/notification-rabbitmq.service';


import { Notification, NotificationSchema } from './schemas/notification.schema';
import { EventsModule } from '../events/events.module';

// Importar los nuevos servicios especializados
import { GeneralNotificationsService } from './services/general-notifications.service';
import { ConversationNotificationsService } from './services/conversation-notifications.service';
import { JobOfferNotificationsService } from './services/job-offer-notifications.service';
import { FriendRequestNotificationsService } from './services/friend-request-notifications.service';
import { JobInvitationNotificationsService } from './services/job-invitation-notifications.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    EventsModule, // Importamos el módulo de eventos
  ],
  controllers: [],
  // controllers: [NotificationsController],
  providers: [
    GeneralNotificationsService,
    ConversationNotificationsService,
    JobOfferNotificationsService,
    FriendRequestNotificationsService,
    JobInvitationNotificationsService,
    NotificationRabbitmqService
  ],
  exports: [
    GeneralNotificationsService,
    ConversationNotificationsService,
    JobOfferNotificationsService,
    FriendRequestNotificationsService,
    JobInvitationNotificationsService,
    NotificationRabbitmqService  // Agregar esta línea
  ],
})
export class NotificationsModule {}
