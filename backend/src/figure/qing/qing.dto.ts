import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFigureDto, HistoricalEventDto, PolicyMeasureDto } from '../common/base.dto';

export class QingRulerDto extends BaseFigureDto {
  @ApiProperty({ description: 'Dynasty ID', example: 'uuid-string' })
  dynastyId: string;

  @ApiProperty({ description: '庙号', example: '清圣祖' })
  templeName: string;

  @ApiProperty({ description: '年号', example: '康熙' })
  eraName: string;

  @ApiPropertyOptional({ description: '在位起始年', example: 1661 })
  reignStart?: number | null;

  @ApiPropertyOptional({ description: '在位结束年', example: 1722 })
  reignEnd?: number | null;

  @ApiPropertyOptional({ description: '政策举措', type: [PolicyMeasureDto] })
  policies?: PolicyMeasureDto[] | null;

  @ApiPropertyOptional({ description: '重大历史事件', type: [HistoricalEventDto] })
  majorEvents?: HistoricalEventDto[] | null;

  @ApiPropertyOptional({ description: '对朝代的贡献' })
  contribution?: string | null;

  @ApiPropertyOptional({ description: '对朝代的责任' })
  responsibility?: string | null;
}
