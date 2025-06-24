import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/friendship/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/friendship/update-friendship.dto';

@Controller('friendships')
@UseGuards(JwtAuthGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post()
  sendFriendRequest(@Request() req, @Body() createFriendshipDto: CreateFriendshipDto) {
    console.log(createFriendshipDto);
    return this.friendshipService.sendFriendRequest(req.user.userId, createFriendshipDto);
  }

  @Put(':id')
  respondToFriendRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFriendshipDto: UpdateFriendshipDto,
  ) {
    return this.friendshipService.respondToFriendRequest(req.user.userId, id, updateFriendshipDto);
  }

  @Get(':id')
  getFriendships(@Param('id') id: string) {
    return this.friendshipService.getFriendships(id);
  }

  @Get('pending/received')
  getPendingFriendRequestsReceived(@Request() req) {
    return this.friendshipService.getPendingFriendRequestsReceived(req.user.userId);
  }

  @Get('pending/sent')
  getPendingFriendRequestsSent(@Request() req) {
    return this.friendshipService.getPendingFriendRequestsSent(req.user.userId);
  }

  @Get('status/:userId')
  checkFriendshipStatus(@Request() req, @Param('userId') userId: string) {
    return this.friendshipService.checkFriendshipStatus(req.user.userId, userId);
  }

  @Delete(':id')
  deleteFriendship(@Request() req, @Param('id') id: string) {
    return this.friendshipService.deleteFriendship(req.user.userId, id);
  }
}