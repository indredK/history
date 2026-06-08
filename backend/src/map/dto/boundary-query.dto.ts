import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  NotEquals,
} from 'class-validator';

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
  @Transform(({ value }: { value: unknown }) =>
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
  @NotEquals(0, { message: '年份不能为 0，历史纪年没有公元 0 年' })
  year: number;
}
