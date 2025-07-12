import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job, JobSchema } from './schemas/job.schema';
import { JobComment, JobCommentSchema } from './schemas/job-comment.schema';
import { JobShare, JobShareSchema } from './schemas/job-share.schema';
import { JobLike, JobLikeSchema } from './schemas/job-like.schema';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobComment.name, schema: JobCommentSchema },
      { name: JobShare.name, schema: JobShareSchema },
      { name: JobLike.name, schema: JobLikeSchema },
    ]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}