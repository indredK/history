import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class MythologyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by mythology category',
    example: '创世神话',
    enum: [
      '创世神话',
      '英雄神话',
      '自然神话',
      '爱情神话',
      '神仙传说',
      '民间传说',
    ],
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by origin (geographic or cultural)',
    example: '中原',
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({
    description: 'Filter by historical period',
    example: '上古',
  })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({
    description: 'Search by mythology name (partial match)',
    example: '盘古',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Search by name, description, origin, or period',
    example: '补天',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
