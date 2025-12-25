import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SongService } from './song.service';
import { FigureQueryDto } from '../common/query.dto';
import { SongFigureDto } from './song.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Song Dynasty Figures')
@Controller()
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Get('figures/song')
  @ApiOperation({
    summary: 'Get Song Dynasty figures',
    description:
      'Retrieve a paginated list of Song Dynasty historical figures with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Song figures',
    type: PaginatedResponseDto<SongFigureDto>,
  })
  async getSongFigures(
    @Query() query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<SongFigureDto>> {
    return this.songService.getSongFigures(query);
  }

  @Get('song-figures')
  @ApiOperation({
    summary: 'Get Song Dynasty figures (compatible endpoint)',
    description:
      'Retrieve a paginated list of Song Dynasty figures (compatible with frontend API)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Song figures',
    type: PaginatedResponseDto<SongFigureDto>,
  })
  async getSongFiguresCompat(
    @Query() query: FigureQueryDto,
  ): Promise<PaginatedResponseDto<SongFigureDto>> {
    return this.songService.getSongFigures(query);
  }
}
