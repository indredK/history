import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EraNameDto } from './era-name.dto';
import { HistoricalEvaluationDto } from './historical-evaluation.dto';

export class EmperorDto {
  @ApiProperty({ description: 'Emperor ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Emperor name', example: '李世民' })
  name: string;

  @ApiProperty({ description: 'Dynasty ID', example: 'uuid-string' })
  dynastyId: string;

  @ApiProperty({ description: 'Reign start year', example: 626 })
  reignStart: number;

  @ApiPropertyOptional({ description: 'Reign end year', example: 649 })
  reignEnd?: number | null;

  @ApiPropertyOptional({ description: 'Temple name', example: '太宗' })
  templeName?: string | null;

  @ApiPropertyOptional({ description: 'Posthumous name', example: '文武大圣大广孝皇帝' })
  posthumousName?: string | null;

  @ApiPropertyOptional({ description: 'Era names', type: [EraNameDto] })
  eraNames?: EraNameDto[] | null;

  @ApiPropertyOptional({ description: 'Birth year', example: 598 })
  birthYear?: number | null;

  @ApiPropertyOptional({ description: 'Death year', example: 649 })
  deathYear?: number | null;

  @ApiPropertyOptional({ description: 'Biography' })
  biography?: string | null;

  @ApiPropertyOptional({ description: 'Achievements', type: [String] })
  achievements?: string[] | null;

  @ApiPropertyOptional({ description: 'Historical evaluation', type: HistoricalEvaluationDto })
  historicalEvaluation?: HistoricalEvaluationDto | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}