import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFigureDto } from '../common/base.dto';

export class TangFigureDto extends BaseFigureDto {
  @ApiProperty({ description: 'Dynasty ID', example: 'uuid-string' })
  dynastyId: string;

  @ApiPropertyOptional({
    description: 'Tang period',
    example: 'early',
    enum: ['early', 'middle', 'late'],
  })
  period?: string | null;

  @ApiPropertyOptional({ description: 'Works/poems', type: [String] })
  works?: string[] | null;
}
