import { Controller, Get, Post, Body, Param, UseGuards, Request, Put, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  sendMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.sendMessage(req.user.userId, createMessageDto);
  }

  @Get('conversation/:friendId')
  getMessages(
    @Request() req, 
    @Param('friendId') friendId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    return this.messagesService.getMessages(req.user.userId, friendId, pageNum, limitNum);
  }

  @Get('conversations')
  getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.userId);
  }

  @Put('mark-read/:messageId')
  markAsRead(@Request() req: any, @Param('messageId') messageId: string) {
    const userId = req.user.userId;
    return this.messagesService.markAsRead(userId, messageId);
  }
}