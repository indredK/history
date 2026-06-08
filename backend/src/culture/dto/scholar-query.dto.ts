import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsUUID,
  IsString,
  NotEquals,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ScholarQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by dynasty period',
    example: '唐朝',
  })
  @IsOptional()
  @IsString()
  dynastyPeriod?: string;

  @ApiPropertyOptional({
    description: 'Filter by frontend dynasty label',
    example: '唐代',
  })
  @IsOptional()
  @IsString()
  dynasty?: string;

  @ApiPropertyOptional({
    description: 'Filter by philosophical school ID',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  philosophicalSchoolId?: string;

  @ApiPropertyOptional({
    description: 'Filter by philosophical school name',
    example: '儒家',
  })
  @IsOptional()
  @IsString()
  schoolName?: string;

  @ApiPropertyOptional({
    description: 'Filter by denormalized school of thought',
    example: '儒家',
  })
  @IsOptional()
  @IsString()
  schoolOfThought?: string;

  @ApiPropertyOptional({
    description: 'Search by scholar name (partial match)',
    example: '孔',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Keyword search across name, dynasty, school, and biography',
    example: '古文运动',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by birth year (scholars born from this year)',
    example: -600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'birthYear 不能为 0，历史纪年没有公元 0 年' })
  birthYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by death year (scholars died before this year)',
    example: -400,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'deathYear 不能为 0，历史纪年没有公元 0 年' })
  deathYear?: number;
}
