import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { JobTypesService } from '../job-types.service';
import { StemmingService } from '../services/stemming.service';
import { InjectModel } from '@nestjs/mongoose';
import { JobType, JobTypeDocument } from '../schemas/job-type.schema';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const stemmingService = app.get(StemmingService);
  const jobTypeModel = app.get<Model<JobTypeDocument>>(
    `${JobType.name}Model`,
  );
  
  try {
    console.log('Actualizando campos stemmed para todos los tipos de trabajo...');
    
    const jobTypes = await jobTypeModel.find().exec();
    
    for (const jobType of jobTypes) {
      const stemmed = stemmingService.stemPhrase(jobType.name);
      
      await jobTypeModel.updateOne(
        { _id: jobType._id },
        { $set: { stemmed } }
      );
      
      console.log(`Actualizado: ${jobType.name} -> ${stemmed}`);
    }
    
    console.log(`¡Actualización completada! Se procesaron ${jobTypes.length} tipos de trabajo.`);
  } catch (error) {
    console.error('Error al actualizar los tipos de trabajo:', error);
  } finally {
    await app.close();
  }
}

bootstrap();