import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Prisma } from '../generated/prisma/client';
import {
  ACCEPTED_BOUNDARY_PERIODS,
  BoundaryPeriod,
} from './dto/boundary-query.dto';
import { PlaceDto, PlaceQueryDto } from './dto/place.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface BoundaryDataResponse {
  period: string;
  year?: number;
  name: string;
  validFrom: number;
  validTo: number;
  data: unknown;
  timestamp: string;
}

export interface BoundaryMapping {
  period: string;
  file: string;
  validFrom: number;
  validTo: number;
  name: string;
}

export interface BoundaryMappingsResponse {
  mappings: BoundaryMapping[];
  timestamp: string;
}

export interface PreloadResponse {
  commonData: string;
  timestamp: string;
}

export interface ClearCacheResponse {
  message: string;
  timestamp: string;
}

export interface CacheStatsResponse {
  cacheItems: number;
  cacheSize: string;
  timestamp: string;
}

@Injectable()
export class MapService {
  private readonly boundaryCache = new Map<string, unknown>();
  private readonly boundaryMappings: BoundaryMapping[] = [
    { file: 'boundaries_qin.geojson', validFrom: -221, validTo: -206, name: '秦朝', period: 'qin' },
    { file: 'boundaries_han.geojson', validFrom: -206, validTo: 220, name: '汉朝', period: 'han' },
    { file: 'boundaries_three_kingdoms.geojson', validFrom: 220, validTo: 280, name: '三国', period: 'sanguo' },
    { file: 'boundaries_jin.geojson', validFrom: 266, validTo: 420, name: '晋朝', period: 'jin' },
    { file: 'boundaries_sui.geojson', validFrom: 581, validTo: 618, name: '隋朝', period: 'sui' },
    { file: 'boundaries_tang.geojson', validFrom: 618, validTo: 907, name: '唐朝', period: 'tang' },
    { file: 'boundaries_song.geojson', validFrom: 960, validTo: 1279, name: '宋朝', period: 'song' },
    { file: 'boundaries_yuan.geojson', validFrom: 1271, validTo: 1368, name: '元朝', period: 'yuan' },
    { file: 'boundaries_ming.geojson', validFrom: 1368, validTo: 1644, name: '明朝', period: 'ming' },
    { file: 'boundaries_qing.geojson', validFrom: 1644, validTo: 1912, name: '清朝', period: 'qing' },
  ];

  constructor(private readonly prisma: PrismaService) {}

  // 获取所有地点
  async getPlaces(query: PlaceQueryDto = {}): Promise<PlaceDto[]> {
    const where = this.buildPlaceWhere(query);
    const places = await this.prisma.place.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        placeSources: true,
      },
    });

    return places.map((place) => {
      const dto: PlaceDto = {
        id: place.id,
        canonical_name: place.name,
        source_ids: place.placeSources.map((source) => source.sourceId),
      };

      if (place.latitude != null && place.longitude != null) {
        dto.location = {
          type: 'Point',
          coordinates: [place.longitude, place.latitude],
        };
      }

      return dto;
    });
  }

  async loadBoundaryData(period: string): Promise<BoundaryDataResponse> {
    const normalizedPeriod = this.normalizeBoundaryPeriod(period);
    const mapping = this.boundaryMappings.find(
      (item) => item.period === normalizedPeriod,
    );

    if (!mapping) {
      throw new NotFoundException(`未找到 ${normalizedPeriod} 对应的疆域边界配置`);
    }

    return {
      period: mapping.period,
      name: mapping.name,
      validFrom: mapping.validFrom,
      validTo: mapping.validTo,
      data: await this.readBoundaryFile(mapping.file),
      timestamp: new Date().toISOString(),
    };
  }

  async getBoundaryDataByYear(year: number): Promise<BoundaryDataResponse> {
    if (!Number.isFinite(year)) {
      throw new BadRequestException('年份必须是有效数字');
    }

    const mapping = this.boundaryMappings
      .filter((item) => year >= item.validFrom && year <= item.validTo)
      .sort((left, right) => right.validFrom - left.validFrom)[0];

    if (!mapping) {
      throw new NotFoundException(`未找到年份 ${year} 对应的疆域边界数据`);
    }

    return {
      ...(await this.loadBoundaryData(mapping.period)),
      year,
    };
  }

  loadBoundaryMappings(): Promise<BoundaryMappingsResponse> {
    return Promise.resolve({
      mappings: this.boundaryMappings,
      timestamp: new Date().toISOString(),
    });
  }

  async preloadCommonData(): Promise<PreloadResponse> {
    await Promise.all([
      this.getPlaces(),
      this.loadBoundaryData('qin'),
      this.loadBoundaryData('han'),
      this.loadBoundaryData('tang'),
      this.loadBoundaryData('song'),
      this.loadBoundaryData('ming'),
      this.loadBoundaryData('qing'),
    ]);

    return {
      commonData: '已预加载地点和常用疆域数据',
      timestamp: new Date().toISOString(),
    };
  }

  clearCache(key?: string): Promise<ClearCacheResponse> {
    if (key) {
      this.boundaryCache.delete(key);
    } else {
      this.boundaryCache.clear();
    }

    return Promise.resolve({
      message: `缓存已清除${key ? ` (key: ${key})` : ''}`,
      timestamp: new Date().toISOString(),
    });
  }

  getCacheStats(): Promise<CacheStatsResponse> {
    return Promise.resolve({
      cacheItems: this.boundaryCache.size,
      cacheSize: `${this.boundaryCache.size} 个疆域文件`,
      timestamp: new Date().toISOString(),
    });
  }

  private async readBoundaryFile(file: string): Promise<unknown> {
    if (this.boundaryCache.has(file)) {
      return this.boundaryCache.get(file);
    }

    const filePath = this.resolveBoundaryPath(file);
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    this.boundaryCache.set(file, parsed);
    return parsed;
  }

  private resolveBoundaryPath(file: string): string {
    const candidates = [
      join(process.cwd(), 'frontend', 'public', 'data', 'map', 'boundaries', file),
      join(process.cwd(), '..', 'frontend', 'public', 'data', 'map', 'boundaries', file),
    ];
    const matchedPath = candidates.find((candidate) => existsSync(candidate));

    if (!matchedPath) {
      throw new NotFoundException(`未找到疆域边界文件: ${file}`);
    }

    return matchedPath;
  }

  private buildPlaceWhere(query: PlaceQueryDto): Prisma.PlaceWhereInput {
    const and: Prisma.PlaceWhereInput[] = [];
    const keyword = query.keyword?.trim();
    const longitudeRange = this.normalizeCoordinateRange(
      query.lon_range,
      '经度',
    );
    const latitudeRange = this.normalizeCoordinateRange(
      query.lat_range,
      '纬度',
    );

    if (keyword) {
      and.push({ name: { contains: keyword } });
    }

    if (longitudeRange) {
      const [gte, lte] = longitudeRange;
      and.push({ longitude: { gte, lte } });
    }

    if (latitudeRange) {
      const [gte, lte] = latitudeRange;
      and.push({ latitude: { gte, lte } });
    }

    return and.length > 0 ? { AND: and } : {};
  }

  private normalizeCoordinateRange(
    range: number[] | undefined,
    label: string,
  ): [number, number] | null {
    if (range === undefined) {
      return null;
    }

    if (range.length !== 2 || range.some((item) => !Number.isFinite(item))) {
      throw new BadRequestException(`${label}范围必须包含两个数字`);
    }

    const [start, end] = range;
    return start <= end ? [start, end] : [end, start];
  }

  private normalizeBoundaryPeriod(period: string): BoundaryPeriod {
    const normalized = period?.trim().toLowerCase();

    if (!normalized) {
      throw new BadRequestException('疆域时期不能为空');
    }

    if (
      !ACCEPTED_BOUNDARY_PERIODS.includes(normalized as BoundaryPeriod)
    ) {
      throw new NotFoundException(`未找到 ${normalized} 对应的疆域边界配置`);
    }

    return normalized as BoundaryPeriod;
  }
}
