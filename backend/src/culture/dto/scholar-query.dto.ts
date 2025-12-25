import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ScholarQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by dynasty period',
    example: '唐朝',
  })
  @IsOptional()
  dynastyPeriod?: string;

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
  schoolName?: string;

  @ApiPropertyOptional({
    description: 'Search by scholar name (partial match)',
    example: '孔',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by birth year (scholars born from this year)',
    example: -600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  birthYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by death year (scholars died before this year)',
    example: -400,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  deathYear?: number;
}
