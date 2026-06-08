import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, NotEquals } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class SchoolQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by school name (partial match)',
    example: '儒',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by founder name',
    example: '孔子',
  })
  @IsOptional()
  @IsString()
  founder?: string;

  @ApiPropertyOptional({
    description:
      'Keyword search across name, founder, period, description, and influence',
    example: '兼爱',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by founding year (schools founded from this year)',
    example: -600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'foundingYear 不能为 0，历史纪年没有公元 0 年' })
  foundingYear?: number;
}
