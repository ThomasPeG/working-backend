import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Job ID is required' })
  jobId: string;

  @IsString()
  @IsNotEmpty({ message: 'Comment content is required' })
  content: string;
}