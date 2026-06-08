import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  NotEquals,
} from 'class-validator';

export class CreateScholarDto {
  @ApiProperty({ description: 'Scholar name', example: '孔子' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'English scholar name',
    example: 'Confucius',
  })
  @IsOptional()
  @IsString()
  name_en?: string | null;

  @ApiPropertyOptional({
    description: 'Dynasty label for frontend display',
    example: '春秋',
  })
  @IsOptional()
  @IsString()
  dynasty?: string | null;

  @ApiPropertyOptional({ description: 'Dynasty period', example: '春秋' })
  @IsOptional()
  @IsString()
  dynastyPeriod?: string | null;

  @ApiPropertyOptional({ description: 'Birth year', example: -551 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'birthYear 不能为 0，历史纪年没有公元 0 年' })
  birthYear?: number | null;

  @ApiPropertyOptional({ description: 'Death year', example: -479 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'deathYear 不能为 0，历史纪年没有公元 0 年' })
  deathYear?: number | null;

  @ApiPropertyOptional({
    description: 'Philosophical school ID',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  philosophicalSchoolId?: string | null;

  @ApiPropertyOptional({
    description: 'Philosophical school name',
    example: '儒家',
  })
  @IsOptional()
  @IsString()
  schoolOfThought?: string | null;

  @ApiPropertyOptional({
    description: 'Major or representative works',
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  majorWorks?: unknown[];

  @ApiPropertyOptional({ description: 'Contributions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contributions?: string[];

  @ApiPropertyOptional({ description: 'Visible achievements', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @ApiPropertyOptional({ description: 'Biography' })
  @IsOptional()
  @IsString()
  biography?: string | null;

  @ApiPropertyOptional({ description: 'Portrait image URL' })
  @IsOptional()
  @IsString()
  portraitUrl?: string | null;

  @ApiPropertyOptional({ description: 'Source names or URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sources?: string[];
}
