import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export const ACCEPTED_BOUNDARY_PERIODS = [
  'qin',
  'han',
  'sanguo',
  'jin',
  'sui',
  'tang',
  'song',
  'yuan',
  'ming',
  'qing',
] as const;

export type BoundaryPeriod = (typeof ACCEPTED_BOUNDARY_PERIODS)[number];

export class BoundaryPeriodQueryDto {
  @ApiProperty({
    description: 'Boundary period key',
    enum: ACCEPTED_BOUNDARY_PERIODS,
    example: 'qin',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsNotEmpty({ message: '疆域时期不能为空' })
  @IsIn(ACCEPTED_BOUNDARY_PERIODS, { message: '疆域时期无效' })
  period: BoundaryPeriod;
}

export class BoundaryYearQueryDto {
  @ApiProperty({
    description: 'Historical year used to resolve a boundary snapshot',
    example: -221,
  })
  @Type(() => Number)
  @IsInt({ message: '年份必须是整数' })
  @Min(-3000, { message: '年份不能早于公元前3000年' })
  year: number;
}
