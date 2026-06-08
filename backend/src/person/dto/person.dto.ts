import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonSourceRefDto {
  @ApiProperty({ description: 'Source title', example: 'CBDB' })
  title: string;

  @ApiPropertyOptional({
    description: 'Source URL',
    example: 'https://cbdb.fas.harvard.edu/',
  })
  url?: string;

  @ApiPropertyOptional({ description: 'Source author or organization' })
  author?: string;
}

export class PersonEventDto {
  @ApiProperty({ description: 'Event name', example: '安史之乱' })
  name: string;

  @ApiPropertyOptional({ description: 'Event year', example: 755 })
  year?: number;

  @ApiPropertyOptional({ description: 'Person role in the event' })
  role?: string;

  @ApiPropertyOptional({ description: 'Event description' })
  description?: string;
}

export class PersonEvaluationDto {
  @ApiProperty({ description: 'Evaluation source', example: '史记' })
  source: string;

  @ApiProperty({ description: 'Evaluation content' })
  content: string;

  @ApiPropertyOptional({ description: 'Evaluation author' })
  author?: string;
}

export class PersonDto {
  @ApiProperty({ description: 'Person ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Person name', example: '李白' })
  name: string;

  @ApiPropertyOptional({ description: 'English or romanized name' })
  nameEn?: string | null;

  @ApiPropertyOptional({ description: 'Courtesy name', example: '太白' })
  courtesy?: string | null;

  @ApiPropertyOptional({ description: 'Main dynasty or period', example: '唐' })
  dynasty?: string | null;

  @ApiPropertyOptional({ description: 'Fine-grained period label' })
  period?: string | null;

  @ApiPropertyOptional({ description: 'Gender label', example: 'male' })
  gender?: string | null;

  @ApiPropertyOptional({ description: 'Birth year', example: 701 })
  birthYear?: number | null;

  @ApiPropertyOptional({ description: 'Birth month', example: 2 })
  birthMonth?: number | null;

  @ApiPropertyOptional({ description: 'Death year', example: 762 })
  deathYear?: number | null;

  @ApiPropertyOptional({ description: 'Death month', example: 12 })
  deathMonth?: number | null;

  @ApiPropertyOptional({ description: 'Birthplace or native place' })
  birthplace?: string | null;

  @ApiPropertyOptional({ description: 'Biography' })
  biography?: string | null;

  @ApiPropertyOptional({ description: 'Role keys', type: [String] })
  roles?: string[] | null;

  @ApiPropertyOptional({ description: 'Aliases and alternate names', type: [String] })
  aliases?: string[] | null;

  @ApiPropertyOptional({ description: 'Major achievements', type: [String] })
  achievements?: string[] | null;

  @ApiPropertyOptional({ description: 'Representative works', type: [String] })
  works?: string[] | null;

  @ApiPropertyOptional({ description: 'Related historical events', type: [PersonEventDto] })
  events?: PersonEventDto[] | null;

  @ApiPropertyOptional({ description: 'Historical evaluations', type: [PersonEvaluationDto] })
  evaluations?: PersonEvaluationDto[] | null;

  @ApiPropertyOptional({ description: 'Portrait URL' })
  portraitUrl?: string | null;

  @ApiPropertyOptional({ description: 'Data sources', type: [PersonSourceRefDto] })
  sources?: PersonSourceRefDto[] | string[] | null;

  @ApiPropertyOptional({
    description: 'Data confidence score, from 0 to 1',
    example: 0.92,
  })
  confidence?: number | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
