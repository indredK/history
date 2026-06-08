import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import type { DynastyModel } from '../generated/prisma/models/Dynasty';
import { DynastyQueryDto } from './dto/dynasty-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { DynastyDto } from './dto/dynasty.dto';
import { CreateDynastyDto } from './dto/create-dynasty.dto';
import { UpdateDynastyDto } from './dto/update-dynasty.dto';

@Injectable()
export class DynastyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: DynastyQueryDto,
  ): Promise<PaginatedResponseDto<DynastyDto>> {
    const { page = 1, limit = 20, startYear, endYear, name } = query;
    const skip = (page - 1) * limit;
    const normalizedName = name?.trim();

    // Build where clause
    const where: Prisma.DynastyWhereInput = {};

    if (startYear !== undefined) {
      where.startYear = { gte: startYear };
    }

    if (endYear !== undefined) {
      where.OR = [
        { endYear: { lte: endYear } },
        { endYear: null }, // Include ongoing dynasties
      ];
    }

    if (normalizedName) {
      where.name = { contains: normalizedName };
    }

    // Execute queries
    const [dynasties, total] = await Promise.all([
      this.prisma.dynasty.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startYear: 'asc' },
      }),
      this.prisma.dynasty.count({ where }),
    ]);

    return new PaginatedResponseDto(
      dynasties.map((dynasty) => this.toDto(dynasty)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<DynastyDto> {
    const dynasty = await this.findRecordOrThrow(id);
    return this.toDto(dynasty);
  }

  async create(input: CreateDynastyDto): Promise<DynastyDto> {
    const name = this.normalizeRequiredName(input.name);
    await this.ensureNameAvailable(name);
    this.assertValidYearRange(input.startYear, input.endYear);
    const capital = this.normalizeOptionalString(input.capital);
    const founder = this.normalizeOptionalString(input.founder);
    const description = this.normalizeOptionalString(input.description);

    const created = await this.prisma.dynasty.create({
      data: {
        name,
        startYear: input.startYear,
        ...(input.endYear !== undefined ? { endYear: input.endYear } : {}),
        ...(capital !== undefined ? { capital } : {}),
        ...(founder !== undefined ? { founder } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    return this.toDto(created);
  }

  async update(id: string, input: UpdateDynastyDto): Promise<DynastyDto> {
    const existing = await this.findRecordOrThrow(id);
    const nextStartYear = input.startYear ?? existing.startYear;
    const nextEndYear = input.endYear !== undefined ? input.endYear : existing.endYear;

    this.assertValidYearRange(nextStartYear, nextEndYear);

    const data: Prisma.DynastyUncheckedUpdateInput = {};

    if (input.name !== undefined) {
      const name = this.normalizeRequiredName(input.name);

      if (name !== existing.name) {
        await this.ensureNameAvailable(name, id);
      }

      data.name = name;
    }

    if (input.startYear !== undefined) {
      data.startYear = input.startYear;
    }

    if (input.endYear !== undefined) {
      data.endYear = input.endYear;
    }

    if (input.capital !== undefined) {
      data.capital = this.normalizeNullableString(input.capital);
    }

    if (input.founder !== undefined) {
      data.founder = this.normalizeNullableString(input.founder);
    }

    if (input.description !== undefined) {
      data.description = this.normalizeNullableString(input.description);
    }

    if (Object.keys(data).length === 0) {
      return this.toDto(existing);
    }

    const updated = await this.prisma.dynasty.update({
      where: { id },
      data,
    });

    return this.toDto(updated);
  }

  async remove(id: string): Promise<DynastyDto> {
    await this.findRecordOrThrow(id);

    const deleted = await this.prisma.dynasty.delete({
      where: { id },
    });

    return this.toDto(deleted);
  }

  private async findRecordOrThrow(id: string): Promise<DynastyModel> {
    const dynasty = await this.prisma.dynasty.findUnique({
      where: { id },
    });

    if (!dynasty) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的朝代记录`);
    }

    return dynasty;
  }

  private async ensureNameAvailable(
    name: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.prisma.dynasty.findUnique({
      where: { name },
      select: { id: true },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException(`朝代“${name}”已存在`);
    }
  }

  private assertValidYearRange(
    startYear: number,
    endYear?: number | null,
  ): void {
    if (endYear != null && endYear < startYear) {
      throw new BadRequestException('结束年份不能早于开始年份');
    }
  }

  private normalizeRequiredName(value: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new BadRequestException('朝代名称不能为空');
    }

    return normalized;
  }

  private normalizeOptionalString(value?: string | null): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();
    return normalized ? normalized : undefined;
  }

  private normalizeNullableString(value?: string | null): string | null {
    if (value == null) {
      return null;
    }

    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  private toDto(dynasty: DynastyModel): DynastyDto {
    return dynasty;
  }
}
