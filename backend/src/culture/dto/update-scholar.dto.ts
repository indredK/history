import { PartialType } from '@nestjs/swagger';
import { CreateScholarDto } from './create-scholar.dto';

export class UpdateScholarDto extends PartialType(CreateScholarDto) {}
