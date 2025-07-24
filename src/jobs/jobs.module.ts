import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { AffinityController } from './affinity.controller';
import { AffinityService } from './services/affinity.service';
import { Job, JobSchema } from './schemas/job.schema';
import { JobType, JobTypeSchema } from './schemas/job-type.schema';  // NUEVO IMPORT
import { JobComment, JobCommentSchema } from './schemas/job-comment.schema';
import { JobShare, JobShareSchema } from './schemas/job-share.schema';
import { JobLike, JobLikeSchema } from './schemas/job-like.schema';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobType.name, schema: JobTypeSchema },  // NUEVO
      { name: JobComment.name, schema: JobCommentSchema },
      { name: JobShare.name, schema: JobShareSchema },
      { name: JobLike.name, schema: JobLikeSchema },
    ]),
    UsersModule,
    NotificationsModule,
    PrismaModule,
  ],
  controllers: [JobsController, AffinityController],
  providers: [JobsService, AffinityService],
  exports: [JobsService, AffinityService],
})
export class JobsModule {}