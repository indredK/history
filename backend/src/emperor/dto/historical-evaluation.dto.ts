import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HistoricalEvaluationDto {
  @ApiProperty({ description: 'Overall rating (1-10)', example: 9 })
  rating: number;

  @ApiProperty({ description: 'Evaluation summary' })
  summary: string;

  @ApiPropertyOptional({ description: 'Positive aspects', type: [String] })
  positives?: string[];

  @ApiPropertyOptional({ description: 'Negative aspects', type: [String] })
  negatives?: string[];

  @ApiPropertyOptional({ description: 'Historical impact description' })
  impact?: string;

  @ApiPropertyOptional({ description: 'Evaluation source' })
  source?: string;
}
