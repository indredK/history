import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class MythologyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by mythology category',
    example: 'deity',
    enum: ['deity', 'legend', 'folklore', 'creation_myth', 'other'],
  })
  @IsOptional()
  @IsIn(['deity', 'legend', 'folklore', 'creation_myth', 'other'])
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by origin (geographic or cultural)',
    example: '中原',
  })
  @IsOptional()
  origin?: string;

  @ApiPropertyOptional({
    description: 'Filter by historical period',
    example: '上古',
  })
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({
    description: 'Search by mythology name (partial match)',
    example: '盘古',
  })
  @IsOptional()
  name?: string;
}