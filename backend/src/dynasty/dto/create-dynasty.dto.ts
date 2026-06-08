import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  NotEquals,
} from 'class-validator';

export class CreateDynastyDto {
  @ApiProperty({ description: 'Dynasty name', example: '唐朝' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Dynasty start year', example: 618 })
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'startYear 不能为 0，历史纪年没有公元 0 年' })
  startYear: number;

  @ApiPropertyOptional({ description: 'Dynasty end year', example: 907 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'endYear 不能为 0，历史纪年没有公元 0 年' })
  endYear?: number | null;

  @ApiPropertyOptional({ description: 'Dynasty capital', example: '长安' })
  @IsOptional()
  @IsString()
  capital?: string | null;

  @ApiPropertyOptional({ description: 'Dynasty founder', example: '李渊' })
  @IsOptional()
  @IsString()
  founder?: string | null;

  @ApiPropertyOptional({ description: 'Dynasty description' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
