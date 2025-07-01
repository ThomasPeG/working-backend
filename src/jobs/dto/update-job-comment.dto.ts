import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateJobCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment content is required' })
  content: string;
}