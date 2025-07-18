import { PartialType } from '@nestjs/mapped-types';
import { CreateUserContractDto } from './create-user-contract.dto';

export class UpdateUserContractDto extends PartialType(CreateUserContractDto) {}