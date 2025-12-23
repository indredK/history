import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFigureDto } from './base-figure.dto';

export class SongFigureDto extends BaseFigureDto {
  @ApiProperty({ description: 'Dynasty ID', example: 'uuid-string' })
  dynastyId: string;

  @ApiPropertyOptional({ 
    description: 'Song period', 
    example: 'northern_song',
    enum: ['northern_song', 'southern_song']
  })
  period?: string | null;

  @ApiPropertyOptional({ description: 'Works', type: [String] })
  works?: string[] | null;
}