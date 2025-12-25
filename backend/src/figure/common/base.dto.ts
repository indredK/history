import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HistoricalEventDto {
  @ApiProperty({ description: '事件名称', example: '赤壁之战' })
  name: string;

  @ApiProperty({ description: '发生年份', example: 208 })
  year: number;

  @ApiProperty({ description: '担任角色', example: '军师' })
  role: string;

  @ApiProperty({ description: '事件描述', example: '联合孙权在大力打败曹操' })
  description: string;
}

export class HistoricalEvaluationDto {
  @ApiProperty({ description: '评价来源', example: '三国志' })
  source: string;

  @ApiProperty({
    description: '评价内容',
    example: '识治之良才，管、萧之亚匹也',
  })
  content: string;

  @ApiPropertyOptional({ description: '评价作者', example: '陈寿' })
  author?: string;
}

export class PolicyMeasureDto {
  @ApiProperty({ description: '政策名称', example: '摊丁入亩' })
  name: string;

  @ApiPropertyOptional({ description: '实施年份', example: 1723 })
  year?: number;

  @ApiProperty({
    description: '政策描述',
    example: '将丁银摊入地亩，征收统一的地丁银',
  })
  description: string;

  @ApiProperty({ description: '影响', example: '废除了人头税，促进了人口增长' })
  impact: string;
}

export class BaseFigureDto {
  @ApiProperty({ description: 'Figure ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Figure name', example: '李白' })
  name: string;

  @ApiPropertyOptional({ description: '字号/别名', example: '太白' })
  courtesy?: string;

  @ApiProperty({ description: 'Role/occupation', example: 'poet' })
  role: string;

  @ApiPropertyOptional({ description: 'Birth year', example: 701 })
  birthYear?: number | null;

  @ApiPropertyOptional({ description: 'Death year', example: 762 })
  deathYear?: number | null;

  @ApiPropertyOptional({ description: '任职经历', type: [String] })
  positions?: string[] | null;

  @ApiPropertyOptional({ description: '所属派系', example: '蜀汉' })
  faction?: string | null;

  @ApiPropertyOptional({ description: '政治主张' })
  politicalViews?: string | null;

  @ApiPropertyOptional({ description: 'Achievements', type: [String] })
  achievements?: string[] | null;

  @ApiPropertyOptional({ description: 'Biography' })
  biography?: string | null;

  @ApiPropertyOptional({ description: '相关事件', type: [HistoricalEventDto] })
  events?: HistoricalEventDto[] | null;

  @ApiPropertyOptional({
    description: '历史评价',
    type: [HistoricalEvaluationDto],
  })
  evaluations?: HistoricalEvaluationDto[] | null;

  @ApiPropertyOptional({ description: '头像链接' })
  portraitUrl?: string | null;

  @ApiPropertyOptional({ description: '参考资料', type: [String] })
  sources?: string[] | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
