import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

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
