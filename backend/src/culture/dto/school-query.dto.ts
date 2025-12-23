import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class SchoolQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by school name (partial match)',
    example: '儒',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by founder name',
    example: '孔子',
  })
  @IsOptional()
  founder?: string;

  @ApiPropertyOptional({
    description: 'Filter by founding year (schools founded from this year)',
    example: -600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  foundingYear?: number;
}