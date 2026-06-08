import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  NotEquals,
  ValidateNested,
} from 'class-validator';

export class PersonSourceRefInputDto {
  @ApiProperty({ description: 'Source title', example: 'CBDB' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Source URL',
    example: 'https://cbdb.fas.harvard.edu/',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string | null;

  @ApiPropertyOptional({ description: 'Source author or organization' })
  @IsOptional()
  @IsString()
  author?: string | null;
}

export class PersonEventInputDto {
  @ApiProperty({ description: 'Event name', example: '安史之乱' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Event year', example: 755 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'year 不能为 0，历史纪年没有公元 0 年' })
  year?: number | null;

  @ApiPropertyOptional({ description: 'Person role in the event' })
  @IsOptional()
  @IsString()
  role?: string | null;

  @ApiPropertyOptional({ description: 'Event description' })
  @IsOptional()
  @IsString()
  description?: string | null;
}

export class PersonEvaluationInputDto {
  @ApiProperty({ description: 'Evaluation source', example: '史记' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Evaluation content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Evaluation author' })
  @IsOptional()
  @IsString()
  author?: string | null;
}

export class CreatePersonDto {
  @ApiProperty({ description: 'Person name', example: '李白' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'English or romanized name' })
  @IsOptional()
  @IsString()
  nameEn?: string | null;

  @ApiPropertyOptional({ description: 'Courtesy name', example: '太白' })
  @IsOptional()
  @IsString()
  courtesy?: string | null;

  @ApiPropertyOptional({ description: 'Main dynasty or period', example: '唐' })
  @IsOptional()
  @IsString()
  dynasty?: string | null;

  @ApiPropertyOptional({ description: 'Fine-grained period label' })
  @IsOptional()
  @IsString()
  period?: string | null;

  @ApiPropertyOptional({ description: 'Gender label', example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string | null;

  @ApiPropertyOptional({ description: 'Birth year', example: 701 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'birthYear 不能为 0，历史纪年没有公元 0 年' })
  birthYear?: number | null;

  @ApiPropertyOptional({ description: 'Birth month', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  birthMonth?: number | null;

  @ApiPropertyOptional({ description: 'Death year', example: 762 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-3000)
  @NotEquals(0, { message: 'deathYear 不能为 0，历史纪年没有公元 0 年' })
  deathYear?: number | null;

  @ApiPropertyOptional({ description: 'Death month', example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  deathMonth?: number | null;

  @ApiPropertyOptional({ description: 'Birthplace or native place' })
  @IsOptional()
  @IsString()
  birthplace?: string | null;

  @ApiPropertyOptional({ description: 'Biography' })
  @IsOptional()
  @IsString()
  biography?: string | null;

  @ApiPropertyOptional({ description: 'Role keys', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({
    description: 'Aliases and alternate names',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @ApiPropertyOptional({ description: 'Major achievements', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @ApiPropertyOptional({ description: 'Representative works', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  works?: string[];

  @ApiPropertyOptional({
    description: 'Related historical events',
    type: [PersonEventInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonEventInputDto)
  events?: PersonEventInputDto[];

  @ApiPropertyOptional({
    description: 'Historical evaluations',
    type: [PersonEvaluationInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonEvaluationInputDto)
  evaluations?: PersonEvaluationInputDto[];

  @ApiPropertyOptional({ description: 'Portrait URL' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  portraitUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Data sources',
    type: [PersonSourceRefInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonSourceRefInputDto)
  sources?: PersonSourceRefInputDto[];

  @ApiPropertyOptional({
    description: 'Data confidence score, from 0 to 1',
    example: 0.92,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number | null;
}

export class UpdatePersonDto extends PartialType(CreatePersonDto) {}
