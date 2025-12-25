import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFigureDto } from '../common/base.dto';

export class SanguoFigureDto extends BaseFigureDto {
  @ApiProperty({
    description: 'Kingdom',
    example: '蜀',
    enum: ['魏', '蜀', '吴', '其他'],
  })
  kingdom: string;

  @ApiPropertyOptional({ description: 'Battles participated', type: [String] })
  battles?: string[] | null;
}
