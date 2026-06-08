import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const ACCEPTED_MYTHOLOGY_CATEGORIES = [
  '创世神话',
  '英雄神话',
  '自然神话',
  '爱情神话',
  '神仙传说',
  '民间传说',
  'creation_myth',
  'creation',
  'deity',
  'legend',
  'folklore',
  'other',
];

export class CreateMythologyDto {
  @ApiPropertyOptional({
    description: 'Optional stable ID. If omitted, Prisma will create one.',
    example: 'myth-pangu-creation',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Chinese title',
    example: '盘古开天',
  })
  @IsString()
  @IsNotEmpty({ message: '神话标题不能为空' })
  title: string;

  @ApiPropertyOptional({
    description: 'Alias for title, accepted for database-shaped clients',
    example: '盘古开天',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Mythology category',
    example: '创世神话',
  })
  @IsString()
  @IsNotEmpty({ message: '神话分类不能为空' })
  @IsIn(ACCEPTED_MYTHOLOGY_CATEGORIES, { message: '神话分类无效' })
  category: string;

  @ApiPropertyOptional({
    description: 'English title',
    example: 'Pangu Creates the World',
  })
  @IsOptional()
  @IsString()
  englishTitle?: string;

  @ApiPropertyOptional({
    description: 'Geographic, textual, or cultural origin',
    example: '《三五历纪》《述异记》',
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({
    description: 'Alias for origin used by the frontend',
    example: '《三五历纪》《述异记》',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Historical or legendary period',
    example: '上古',
  })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiProperty({ description: 'Story description' })
  @IsString()
  @IsNotEmpty({ message: '神话描述不能为空' })
  description: string;

  @ApiPropertyOptional({ description: 'Related characters', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  characters?: string[];

  @ApiPropertyOptional({
    description: 'Story beats or detail sections',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stories?: string[];

  @ApiPropertyOptional({
    description: 'Symbolic meanings and cultural motifs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symbolism?: string[];

  @ApiPropertyOptional({
    description: 'Image URL',
    example: '/images/mythologies/pangu.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
