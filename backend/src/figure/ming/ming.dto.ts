import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFigureDto } from '../common/base.dto';

export class MingFigureDto extends BaseFigureDto {
  @ApiProperty({ description: 'Dynasty ID', example: 'uuid-string' })
  dynastyId: string;

  @ApiPropertyOptional({
    description: 'Ming period',
    example: 'early',
    enum: ['early', 'middle', 'late'],
  })
  period?: string | null;

  @ApiPropertyOptional({ description: 'Works', type: [String] })
  works?: string[] | null;
}
