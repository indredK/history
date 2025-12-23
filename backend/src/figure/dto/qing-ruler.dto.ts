import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFigureDto } from './base-figure.dto';

export class QingRulerDto extends BaseFigureDto {
  @ApiProperty({ description: 'Dynasty ID', example: 'uuid-string' })
  dynastyId: string;

  @ApiPropertyOptional({ description: 'Reign start year', example: 1661 })
  reignStart?: number | null;

  @ApiPropertyOptional({ description: 'Reign end year', example: 1722 })
  reignEnd?: number | null;

  @ApiPropertyOptional({ description: 'Policies', type: [String] })
  policies?: string[] | null;
}