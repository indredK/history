import { PartialType } from '@nestjs/swagger';
import { CreatePhilosophicalSchoolDto } from './create-philosophical-school.dto';

export class UpdatePhilosophicalSchoolDto extends PartialType(
  CreatePhilosophicalSchoolDto,
) {}
