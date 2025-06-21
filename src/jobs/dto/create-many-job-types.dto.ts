import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateJobTypeDto } from './create-job-type.dto';

export class CreateManyJobTypesDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un tipo de trabajo' })
  @ValidateNested({ each: true })
  @Type(() => CreateJobTypeDto)
  jobTypes: CreateJobTypeDto[];
}