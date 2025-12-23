import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FigureQueryDto, SanguoFigureQueryDto } from './dto/figure-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { TangFigureDto } from './dto/tang-figure.dto';
import { SongFigureDto } from './dto/song-figure.dto';
import { YuanFigureDto } from './dto/yuan-figure.dto';
import { MingFigureDto } from './dto/ming-figure.dto';
import { QingRulerDto } from './dto/qing-ruler.dto';
import { SanguoFigureDto } from './dto/sanguo-figure.dto';

@Injectable()
export class FigureService {
  constructor(private readonly prisma: PrismaService) {}

  async getTangFigures(query: FigureQueryDto): Promise<PaginatedResponseDto<TangFigureDto>> {
    const { page = 1, limit = 20, role, period, name, birthYear, deathYear } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (role) where.role = { contains: role };
    if (period) where.period = period;
    if (name) where.name = { contains: name };
    if (birthYear !== undefined) where.birthYear = { gte: birthYear };
    if (deathYear !== undefined) {
      where.OR = [
        { deathYear: { lte: deathYear } },
        { deathYear: null },
      ];
    }

    const [figures, total] = await Promise.all([
      this.prisma.tangFigure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.tangFigure.count({ where }),
    ]);

    const transformedFigures = figures.map(figure => ({
      ...figure,
      achievements: figure.achievements ? JSON.parse(figure.achievements as string) : null,
      works: figure.works ? JSON.parse(figure.works as string) : null,
    }));

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }

  async getSongFigures(query: FigureQueryDto): Promise<PaginatedResponseDto<SongFigureDto>> {
    const { page = 1, limit = 20, role, period, name, birthYear, deathYear } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (role) where.role = { contains: role };
    if (period) where.period = period;
    if (name) where.name = { contains: name };
    if (birthYear !== undefined) where.birthYear = { gte: birthYear };
    if (deathYear !== undefined) {
      where.OR = [
        { deathYear: { lte: deathYear } },
        { deathYear: null },
      ];
    }

    const [figures, total] = await Promise.all([
      this.prisma.songFigure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.songFigure.count({ where }),
    ]);

    const transformedFigures = figures.map(figure => ({
      ...figure,
      achievements: figure.achievements ? JSON.parse(figure.achievements as string) : null,
      works: figure.works ? JSON.parse(figure.works as string) : null,
    }));

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }

  async getYuanFigures(query: FigureQueryDto): Promise<PaginatedResponseDto<YuanFigureDto>> {
    const { page = 1, limit = 20, role, name, birthYear, deathYear } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (role) where.role = { contains: role };
    if (name) where.name = { contains: name };
    if (birthYear !== undefined) where.birthYear = { gte: birthYear };
    if (deathYear !== undefined) {
      where.OR = [
        { deathYear: { lte: deathYear } },
        { deathYear: null },
      ];
    }

    const [figures, total] = await Promise.all([
      this.prisma.yuanFigure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.yuanFigure.count({ where }),
    ]);

    const transformedFigures = figures.map(figure => ({
      ...figure,
      achievements: figure.achievements ? JSON.parse(figure.achievements as string) : null,
      works: figure.works ? JSON.parse(figure.works as string) : null,
    }));

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }

  async getMingFigures(query: FigureQueryDto): Promise<PaginatedResponseDto<MingFigureDto>> {
    const { page = 1, limit = 20, role, period, name, birthYear, deathYear } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (role) where.role = { contains: role };
    if (period) where.period = period;
    if (name) where.name = { contains: name };
    if (birthYear !== undefined) where.birthYear = { gte: birthYear };
    if (deathYear !== undefined) {
      where.OR = [
        { deathYear: { lte: deathYear } },
        { deathYear: null },
      ];
    }

    const [figures, total] = await Promise.all([
      this.prisma.mingFigure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.mingFigure.count({ where }),
    ]);

    const transformedFigures = figures.map(figure => ({
      ...figure,
      achievements: figure.achievements ? JSON.parse(figure.achievements as string) : null,
      works: figure.works ? JSON.parse(figure.works as string) : null,
    }));

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }

  async getQingRulers(query: FigureQueryDto): Promise<PaginatedResponseDto<QingRulerDto>> {
    const { page = 1, limit = 20, role, name, birthYear, deathYear } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (role) where.role = { contains: role };
    if (name) where.name = { contains: name };
    if (birthYear !== undefined) where.birthYear = { gte: birthYear };
    if (deathYear !== undefined) {
      where.OR = [
        { deathYear: { lte: deathYear } },
        { deathYear: null },
      ];
    }

    const [figures, total] = await Promise.all([
      this.prisma.qingRuler.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ reignStart: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.qingRuler.count({ where }),
    ]);

    const transformedFigures = figures.map(figure => ({
      ...figure,
      achievements: figure.achievements ? JSON.parse(figure.achievements as string) : null,
      policies: figure.policies ? JSON.parse(figure.policies as string) : null,
    }));

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }

  async getSanguoFigures(query: SanguoFigureQueryDto): Promise<PaginatedResponseDto<SanguoFigureDto>> {
    const { page = 1, limit = 20, kingdom, role, name } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (kingdom) where.kingdom = kingdom;
    if (role) where.role = role;
    if (name) where.name = { contains: name };

    const [figures, total] = await Promise.all([
      this.prisma.sanguoFigure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.sanguoFigure.count({ where }),
    ]);

    const transformedFigures = figures.map(figure => ({
      ...figure,
      achievements: figure.achievements ? JSON.parse(figure.achievements as string) : null,
      battles: figure.battles ? JSON.parse(figure.battles as string) : null,
    }));

    return new PaginatedResponseDto(transformedFigures, total, page, limit);
  }
}