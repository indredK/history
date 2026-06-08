import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  NotEquals,
} from 'class-validator';

export class CreatePhilosophicalSchoolDto {
  @ApiProperty({ description: 'School name', example: '儒家' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'English school name',
    example: 'Confucianism',
  })
  @IsOptional()
  @IsString()
  name_en?: string | null;

  @ApiPropertyOptional({ description: 'School founder', example: '孔子' })
  @IsOptional()
  @IsString()
  founder?: string | null;

  @ApiPropertyOptional({
    description: 'Founder English name',
    example: 'Confucius',
  })
  @IsOptional()
  @IsString()
  founderEn?: string | null;

  @ApiPropertyOptional({ description: 'Founding year', example: -551 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'foundingYear 不能为 0，历史纪年没有公元 0 年' })
  foundingYear?: number | null;

  @ApiPropertyOptional({ description: 'Founding period', example: '春秋时期' })
  @IsOptional()
  @IsString()
  foundingPeriod?: string | null;

  @ApiPropertyOptional({ description: 'Core beliefs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coreBeliefs?: string[];

  @ApiPropertyOptional({ description: 'Key texts', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyTexts?: string[];

  @ApiPropertyOptional({
    description: 'Representative figures',
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  representativeFigures?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: 'Classic works', type: [Object] })
  @IsOptional()
  @IsArray()
  classicWorks?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: 'School description' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Historical influence' })
  @IsOptional()
  @IsString()
  influence?: string | null;

  @ApiPropertyOptional({ description: 'Theme color' })
  @IsOptional()
  @IsString()
  color?: string | null;

  @ApiPropertyOptional({ description: 'Source names or URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sources?: string[];
}
