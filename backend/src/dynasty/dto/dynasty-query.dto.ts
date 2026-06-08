import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsString, Min, NotEquals } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class DynastyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by start year (dynasties starting from this year)',
    example: 600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'startYear 不能为 0，历史纪年没有公元 0 年' })
  startYear?: number;

  @ApiPropertyOptional({
    description: 'Filter by end year (dynasties ending before this year)',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'endYear 不能为 0，历史纪年没有公元 0 年' })
  endYear?: number;

  @ApiPropertyOptional({
    description: 'Search by dynasty name (partial match)',
    example: '唐',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
