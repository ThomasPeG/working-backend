import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module'; // Importar NotificationsModule

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
      }),
    }),
    EventsModule,
    NotificationsModule, // Añadir NotificationsModule a los imports
  ],
  controllers: [UsersController, EmployeeController, FriendshipController],
  providers: [UsersService, EmployeeService, FriendshipService],
  exports: [UsersService, EmployeeService, FriendshipService]
})
export class UsersModule {}
