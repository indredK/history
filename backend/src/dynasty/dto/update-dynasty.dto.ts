import { PartialType } from '@nestjs/swagger';
import { CreateDynastyDto } from './create-dynasty.dto';

export class UpdateDynastyDto extends PartialType(CreateDynastyDto) {}
