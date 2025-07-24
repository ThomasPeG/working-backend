import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { JobTypesModule } from './jobs/job-types.module';
import { JobsModule } from './jobs/jobs.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventsModule } from './events/events.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Prisma Module
    PrismaModule,
    
    // Configuración de MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
    }),
    
    // Módulos de la aplicación
    UsersModule,
    AuthModule,
    PostsModule,
    JobTypesModule,
    JobsModule,
    MessagesModule,
    NotificationsModule,
    EventsModule, // Añadimos el nuevo módulo de eventos
    LocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}