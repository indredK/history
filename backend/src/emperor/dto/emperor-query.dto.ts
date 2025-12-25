import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class EmperorQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by dynasty ID',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  dynastyId?: string;

  @ApiPropertyOptional({
    description:
      'Filter by reign start year (emperors who started reigning from this year)',
    example: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  reignStart?: number;

  @ApiPropertyOptional({
    description:
      'Filter by reign end year (emperors who ended reigning before this year)',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  reignEnd?: number;

  @ApiPropertyOptional({
    description: 'Search by emperor name (partial match)',
    example: '李',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by dynasty name',
    example: '唐朝',
  })
  @IsOptional()
  dynastyName?: string;
}
