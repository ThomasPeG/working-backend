import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module'; // Importamos el módulo de eventos
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    UsersModule,
    EventsModule,
    NotificationsModule // Añadimos el módulo de eventos
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}