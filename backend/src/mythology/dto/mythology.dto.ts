import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MythologyDto {
  @ApiProperty({ description: 'Mythology ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Chinese title', example: '盘古开天' })
  title: string;

  @ApiPropertyOptional({
    description: 'English title',
    example: 'Pangu Creates the World',
  })
  englishTitle?: string | null;

  @ApiProperty({
    description: 'Mythology category',
    example: '创世神话',
    enum: [
      '创世神话',
      '英雄神话',
      '自然神话',
      '爱情神话',
      '神仙传说',
      '民间传说',
    ],
  })
  category: string;

  @ApiProperty({ description: 'Story description' })
  description: string;

  @ApiPropertyOptional({ description: 'Related characters', type: [String] })
  characters?: string[] | null;

  @ApiPropertyOptional({
    description: 'Source/reference',
    example: '《三五历记》',
  })
  source?: string | null;

  @ApiPropertyOptional({
    description: 'Image URL',
    example: '/images/mythologies/pangu.jpg',
  })
  imageUrl?: string | null;
}
