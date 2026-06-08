import { PartialType } from '@nestjs/swagger';
import { CreateMythologyDto } from './create-mythology.dto';

export class UpdateMythologyDto extends PartialType(CreateMythologyDto) {}
