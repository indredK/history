import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FigureService } from './figure.service';
import { FigureQueryDto, SanguoFigureQueryDto } from './dto/figure-query.dto';
import { TangFigureDto } from './dto/tang-figure.dto';
import { SongFigureDto } from './dto/song-figure.dto';
import { YuanFigureDto } from './dto/yuan-figure.dto';
import { MingFigureDto } from './dto/ming-figure.dto';
import { QingRulerDto } from './dto/qing-ruler.dto';
import { SanguoFigureDto } from './dto/sanguo-figure.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Historical Figures')
@Controller('figures')
export class FigureController {
  constructor(private readonly figureService: FigureService) {}

  @Get('tang')
  @ApiOperation({ 
    summary: 'Get Tang Dynasty figures',
    description: 'Retrieve a paginated list of Tang Dynasty historical figures with optional filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Tang figures',
    type: PaginatedResponseDto<TangFigureDto>,
  })
  async getTangFigures(@Query() query: FigureQueryDto): Promise<PaginatedResponseDto<TangFigureDto>> {
    return this.figureService.getTangFigures(query);
  }

  @Get('song')
  @ApiOperation({ 
    summary: 'Get Song Dynasty figures',
    description: 'Retrieve a paginated list of Song Dynasty historical figures with optional filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Song figures',
    type: PaginatedResponseDto<SongFigureDto>,
  })
  async getSongFigures(@Query() query: FigureQueryDto): Promise<PaginatedResponseDto<SongFigureDto>> {
    return this.figureService.getSongFigures(query);
  }

  @Get('yuan')
  @ApiOperation({ 
    summary: 'Get Yuan Dynasty figures',
    description: 'Retrieve a paginated list of Yuan Dynasty historical figures with optional filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Yuan figures',
    type: PaginatedResponseDto<YuanFigureDto>,
  })
  async getYuanFigures(@Query() query: FigureQueryDto): Promise<PaginatedResponseDto<YuanFigureDto>> {
    return this.figureService.getYuanFigures(query);
  }

  @Get('ming')
  @ApiOperation({ 
    summary: 'Get Ming Dynasty figures',
    description: 'Retrieve a paginated list of Ming Dynasty historical figures with optional filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Ming figures',
    type: PaginatedResponseDto<MingFigureDto>,
  })
  async getMingFigures(@Query() query: FigureQueryDto): Promise<PaginatedResponseDto<MingFigureDto>> {
    return this.figureService.getMingFigures(query);
  }

  @Get('qing')
  @ApiOperation({ 
    summary: 'Get Qing Dynasty rulers',
    description: 'Retrieve a paginated list of Qing Dynasty rulers with optional filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Qing rulers',
    type: PaginatedResponseDto<QingRulerDto>,
  })
  async getQingRulers(@Query() query: FigureQueryDto): Promise<PaginatedResponseDto<QingRulerDto>> {
    return this.figureService.getQingRulers(query);
  }

  @Get('sanguo')
  @ApiOperation({ 
    summary: 'Get Three Kingdoms figures',
    description: 'Retrieve a paginated list of Three Kingdoms period figures with optional filtering by kingdom and role'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved Three Kingdoms figures',
    type: PaginatedResponseDto<SanguoFigureDto>,
  })
  async getSanguoFigures(@Query() query: SanguoFigureQueryDto): Promise<PaginatedResponseDto<SanguoFigureDto>> {
    return this.figureService.getSanguoFigures(query);
  }
}