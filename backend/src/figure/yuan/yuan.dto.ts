import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFigureDto } from '../common/base.dto';

export class YuanFigureDto extends BaseFigureDto {
  @ApiProperty({ description: 'Dynasty ID', example: 'uuid-string' })
  dynastyId: string;

  @ApiPropertyOptional({
    description: 'Ethnicity',
    example: 'mongol',
    enum: ['mongol', 'han', 'semu', 'other'],
  })
  ethnicity?: string | null;

  @ApiPropertyOptional({ description: 'Works', type: [String] })
  works?: string[] | null;
}
