import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobTypesController } from './job-types.controller';
import { JobTypesService } from './job-types.service';
import { JobType, JobTypeSchema } from './schemas/job-type.schema';
import { StemmingService } from './services/stemming.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobType.name, schema: JobTypeSchema },
    ]),
  ],
  controllers: [JobTypesController],
  providers: [JobTypesService, StemmingService],
  exports: [JobTypesService],
})
export class JobTypesModule {}