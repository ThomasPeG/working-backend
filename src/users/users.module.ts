import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EmployeeService } from './employee.service';
import { JobService } from './job.service';
import { EmployeeController } from './employee.controller';
import { JobController } from './job.controller';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';

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
  ],
  controllers: [UsersController, EmployeeController, JobController, FriendshipController],
  providers: [UsersService, EmployeeService, JobService, FriendshipService],
  exports: [UsersService, EmployeeService, JobService, FriendshipService]
})
export class UsersModule {}
