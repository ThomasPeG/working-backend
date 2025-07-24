// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
// import { NotificationsService } from './notifications.service';
// import { CreateNotificationDto } from './dto/create-notification.dto';
// import { UpdateNotificationDto } from './dto/update-notification.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { NotificationRabbitmqService } from './services/notification-rabbitmq.service';

// @Controller('notifications')
// @UseGuards(JwtAuthGuard)
// export class NotificationsController {
//   constructor(private readonly notificationsService: NotificationsService,
//     private notificationClientService: NotificationRabbitmqService
//   ) {}

//   @Get()
//   findAll(
//     @Request() req,
//     @Query('limit') limit: string,
//     @Query('page') page: string
//   ) {
//     const limitNum = limit ? parseInt(limit) : 10;
//     const pageNum = page ? parseInt(page) : 1;
//     return this.notificationClientService.getUserNotifications(req.user.userId, limitNum, pageNum);
//   }

//   @Get('unread')
//   findUnread(@Request() req) {
//     return this.notificationClientService.findUnreadForUser(req.user.userId);
//   }

//   @Patch(':id/read')
//   markAsRead(@Request() req, @Param('id') id: string) {
//     return this.notificationClientService.markAsRead(id, req.user.userId);
//   }

//   @Patch('read-all')
//   markAllAsRead(@Request() req) {
//     return this.notificationClientService.markAllAsRead(req.user.userId);
//   }

//   @Delete(':id')
//   remove(@Request() req, @Param('id') id: string) {
//     return this.notificationClientService.remove(id, req.user.userId);
//   }

//   @Delete('clear-all')
//   removeAll(@Request() req) {
//     return this.notificationClientService.removeAllForUser(req.user.userId);
//   }
// }