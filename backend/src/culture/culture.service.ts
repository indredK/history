import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { ScholarQueryDto } from './dto/scholar-query.dto';
import { SchoolQueryDto } from './dto/school-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { ScholarDto } from './dto/scholar.dto';
import { PhilosophicalSchoolDto } from './dto/philosophical-school.dto';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { CreatePhilosophicalSchoolDto } from './dto/create-philosophical-school.dto';
import { UpdatePhilosophicalSchoolDto } from './dto/update-philosophical-school.dto';

type ScholarWithSchool = Record<string, unknown> & {
  philosophicalSchool?: { id: string; name: string } | null;
};

type SchoolRecord = Record<string, unknown>;
type ScholarValidationSnapshot = {
  id: string;
  name: string;
  birthYear: number | null;
  deathYear: number | null;
};

type SchoolValidationSnapshot = {
  id: string;
  name: string;
};

@Injectable()
export class CultureService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllScholars(
    query: ScholarQueryDto,
  ): Promise<PaginatedResponseDto<ScholarDto>> {
    const {
      page = 1,
      limit = 20,
      dynastyPeriod,
      philosophicalSchoolId,
      schoolName,
      schoolOfThought,
      name,
      dynasty,
      birthYear,
      deathYear,
      q,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ScholarWhereInput = {};
    const and: Prisma.ScholarWhereInput[] = [];

    if (dynastyPeriod) {
      where.dynastyPeriod = { contains: dynastyPeriod };
    }

    if (dynasty) {
      and.push({
        OR: [
          { dynasty: { contains: dynasty } },
          { dynastyPeriod: { contains: dynasty } },
        ],
      });
    }

    if (philosophicalSchoolId) {
      where.philosophicalSchoolId = philosophicalSchoolId;
    }

    const schoolSearch = schoolName ?? schoolOfThought;
    if (schoolSearch) {
      and.push({
        OR: [
          { schoolOfThought: { contains: schoolSearch } },
          { philosophicalSchool: { name: { contains: schoolSearch } } },
        ],
      });
    }

    if (name) {
      where.name = { contains: name };
    }

    if (birthYear !== undefined) {
      where.birthYear = { gte: birthYear };
    }

    if (deathYear !== undefined) {
      and.push({
        OR: [{ deathYear: { lte: deathYear } }, { deathYear: null }],
      });
    }

    if (q) {
      and.push({
        OR: [
          { name: { contains: q } },
          { name_en: { contains: q } },
          { biography: { contains: q } },
          { dynasty: { contains: q } },
          { dynastyPeriod: { contains: q } },
          { schoolOfThought: { contains: q } },
          { philosophicalSchool: { name: { contains: q } } },
        ],
      });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    // Execute queries
    const [scholars, total] = await Promise.all([
      this.prisma.scholar.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ birthYear: 'asc' }, { name: 'asc' }],
        include: {
          philosophicalSchool: true,
        },
      }),
      this.prisma.scholar.count({ where }),
    ]);

    const transformedScholars = scholars.map((scholar) =>
      this.transformScholar(scholar),
    );

    return new PaginatedResponseDto(transformedScholars, total, page, limit);
  }

  async findScholarById(id: string): Promise<ScholarDto> {
    const scholar = await this.prisma.scholar.findUnique({
      where: { id },
      include: {
        philosophicalSchool: true,
      },
    });

    if (!scholar) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的学者记录`);
    }

    return this.transformScholar(scholar);
  }

  async createScholar(dto: CreateScholarDto): Promise<ScholarDto> {
    this.assertRequiredName(dto.name, '学者姓名不能为空');
    this.assertLifespan(dto.birthYear, dto.deathYear, '学者卒年不能早于生年');

    const data = await this.buildScholarData(dto);
    const scholar = await this.prisma.scholar.create({
      data: data as never,
      include: {
        philosophicalSchool: true,
      },
    });

    return this.transformScholar(scholar);
  }

  async updateScholar(id: string, dto: UpdateScholarDto): Promise<ScholarDto> {
    const current = await this.ensureScholarExists(id);
    const nextBirthYear = this.hasOwn(dto, 'birthYear')
      ? dto.birthYear
      : current.birthYear;
    const nextDeathYear = this.hasOwn(dto, 'deathYear')
      ? dto.deathYear
      : current.deathYear;

    if (this.hasOwn(dto, 'name')) {
      this.assertRequiredName(dto.name, '学者姓名不能为空');
    }
    this.assertLifespan(nextBirthYear, nextDeathYear, '学者卒年不能早于生年');

    const data = await this.buildScholarData(dto);
    const scholar = await this.prisma.scholar.update({
      where: { id },
      data: data as never,
      include: {
        philosophicalSchool: true,
      },
    });

    return this.transformScholar(scholar);
  }

  async removeScholar(id: string): Promise<ScholarDto> {
    await this.ensureScholarExists(id);

    const scholar = await this.prisma.scholar.delete({
      where: { id },
      include: {
        philosophicalSchool: true,
      },
    });

    return this.transformScholar(scholar);
  }

  async findAllSchools(
    query: SchoolQueryDto,
  ): Promise<PaginatedResponseDto<PhilosophicalSchoolDto>> {
    const { page = 1, limit = 20, name, founder, foundingYear, q } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PhilosophicalSchoolWhereInput = {};
    const and: Prisma.PhilosophicalSchoolWhereInput[] = [];

    if (name) {
      where.name = { contains: name };
    }

    if (founder) {
      where.founder = { contains: founder };
    }

    if (foundingYear !== undefined) {
      where.foundingYear = { gte: foundingYear };
    }

    if (q) {
      and.push({
        OR: [
          { name: { contains: q } },
          { name_en: { contains: q } },
          { founder: { contains: q } },
          { founderEn: { contains: q } },
          { foundingPeriod: { contains: q } },
          { description: { contains: q } },
          { influence: { contains: q } },
        ],
      });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    // Execute queries
    const [schools, total] = await Promise.all([
      this.prisma.philosophicalSchool.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ foundingYear: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.philosophicalSchool.count({ where }),
    ]);

    const transformedSchools = schools.map((school) =>
      this.transformSchool(school),
    );

    return new PaginatedResponseDto(transformedSchools, total, page, limit);
  }

  async findSchoolById(id: string): Promise<PhilosophicalSchoolDto> {
    const school = await this.prisma.philosophicalSchool.findUnique({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的思想流派记录`);
    }

    return this.transformSchool(school);
  }

  async createSchool(
    dto: CreatePhilosophicalSchoolDto,
  ): Promise<PhilosophicalSchoolDto> {
    this.assertRequiredName(dto.name, '思想流派名称不能为空');
    this.assertHistoricalYear(
      dto.foundingYear,
      '思想流派创立年份不能为 0，历史纪年没有公元 0 年',
    );

    const school = await this.prisma.philosophicalSchool.create({
      data: this.buildSchoolData(dto) as never,
    });

    return this.transformSchool(school);
  }

  async updateSchool(
    id: string,
    dto: UpdatePhilosophicalSchoolDto,
  ): Promise<PhilosophicalSchoolDto> {
    await this.ensureSchoolExists(id);
    if (this.hasOwn(dto, 'name')) {
      this.assertRequiredName(dto.name, '思想流派名称不能为空');
    }
    if (this.hasOwn(dto, 'foundingYear')) {
      this.assertHistoricalYear(
        dto.foundingYear,
        '思想流派创立年份不能为 0，历史纪年没有公元 0 年',
      );
    }

    const school = await this.prisma.philosophicalSchool.update({
      where: { id },
      data: this.buildSchoolData(dto) as never,
    });

    return this.transformSchool(school);
  }

  async removeSchool(id: string): Promise<PhilosophicalSchoolDto> {
    await this.ensureSchoolExists(id);

    await this.prisma.scholar.updateMany({
      where: { philosophicalSchoolId: id },
      data: { philosophicalSchoolId: null },
    });

    const school = await this.prisma.philosophicalSchool.delete({
      where: { id },
    });

    return this.transformSchool(school);
  }

  private async ensureScholarExists(
    id: string,
  ): Promise<ScholarValidationSnapshot> {
    const scholar = await this.prisma.scholar.findUnique({
      where: { id },
      select: { id: true, name: true, birthYear: true, deathYear: true },
    });

    if (!scholar) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的学者记录`);
    }

    return scholar;
  }

  private async ensureSchoolExists(
    id: string,
  ): Promise<SchoolValidationSnapshot> {
    const school = await this.prisma.philosophicalSchool.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!school) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的思想流派记录`);
    }

    return school;
  }

  private async buildScholarData(
    dto: Partial<CreateScholarDto>,
  ): Promise<Record<string, unknown>> {
    const data: Record<string, unknown> = {};
    const school = await this.resolveScholarSchool(dto);

    this.assignDefined(data, 'name', dto.name);
    this.assignDefined(data, 'name_en', dto.name_en);
    this.assignDefined(data, 'dynasty', dto.dynasty ?? dto.dynastyPeriod);
    this.assignDefined(data, 'dynastyPeriod', dto.dynastyPeriod ?? dto.dynasty);
    this.assignDefined(data, 'birthYear', dto.birthYear);
    this.assignDefined(data, 'deathYear', dto.deathYear);
    this.assignDefined(data, 'philosophicalSchoolId', school.id);
    this.assignDefined(data, 'schoolOfThought', school.name);
    this.assignDefined(data, 'majorWorks', dto.majorWorks);
    this.assignDefined(data, 'contributions', dto.contributions);
    this.assignDefined(data, 'achievements', dto.achievements);
    this.assignDefined(data, 'biography', dto.biography);
    this.assignDefined(data, 'portraitUrl', dto.portraitUrl);
    this.assignDefined(data, 'sources', dto.sources);

    return data;
  }

  private buildSchoolData(
    dto: Partial<CreatePhilosophicalSchoolDto>,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    this.assignDefined(data, 'name', dto.name);
    this.assignDefined(data, 'name_en', dto.name_en);
    this.assignDefined(data, 'founder', dto.founder);
    this.assignDefined(data, 'founderEn', dto.founderEn);
    this.assignDefined(data, 'foundingYear', dto.foundingYear);
    this.assignDefined(data, 'foundingPeriod', dto.foundingPeriod);
    this.assignDefined(data, 'coreBeliefs', dto.coreBeliefs);
    this.assignDefined(data, 'keyTexts', dto.keyTexts);
    this.assignDefined(
      data,
      'representativeFigures',
      dto.representativeFigures,
    );
    this.assignDefined(data, 'classicWorks', dto.classicWorks);
    this.assignDefined(data, 'description', dto.description);
    this.assignDefined(data, 'influence', dto.influence);
    this.assignDefined(data, 'color', dto.color);
    this.assignDefined(data, 'sources', dto.sources);

    return data;
  }

  private async resolveScholarSchool(
    dto: Partial<CreateScholarDto>,
  ): Promise<{ id?: string | null; name?: string | null }> {
    if (
      this.hasOwn(dto, 'philosophicalSchoolId') &&
      this.isClearedValue(dto.philosophicalSchoolId)
    ) {
      return { id: null, name: null };
    }

    if (
      typeof dto.philosophicalSchoolId === 'string' &&
      dto.philosophicalSchoolId.trim()
    ) {
      const school = await this.prisma.philosophicalSchool.findUnique({
        where: { id: dto.philosophicalSchoolId.trim() },
        select: { id: true, name: true },
      });

      if (!school) {
        throw new NotFoundException(
          `未找到 ID 为 ${dto.philosophicalSchoolId} 的思想流派记录`,
        );
      }

      return {
        id: school.id,
        name: this.normalizeOptionalString(dto.schoolOfThought) ?? school.name,
      };
    }

    if (
      this.hasOwn(dto, 'schoolOfThought') &&
      this.isClearedValue(dto.schoolOfThought)
    ) {
      return { id: null, name: null };
    }

    if (typeof dto.schoolOfThought === 'string' && dto.schoolOfThought.trim()) {
      const schoolName = dto.schoolOfThought.trim();
      const school = await this.prisma.philosophicalSchool.findUnique({
        where: { name: schoolName },
        select: { id: true, name: true },
      });

      return {
        id: school?.id,
        name: school?.name ?? schoolName,
      };
    }

    return {};
  }

  private assertRequiredName(value: unknown, message: string): void {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(message);
    }
  }

  private assertLifespan(
    birthYear: number | null | undefined,
    deathYear: number | null | undefined,
    message: string,
  ): void {
    if (birthYear === 0 || deathYear === 0) {
      throw new BadRequestException('学者年份不能为 0，历史纪年没有公元 0 年');
    }

    if (
      birthYear !== undefined &&
      birthYear !== null &&
      deathYear !== undefined &&
      deathYear !== null &&
      deathYear < birthYear
    ) {
      throw new BadRequestException(message);
    }
  }

  private assertHistoricalYear(
    year: number | null | undefined,
    message: string,
  ): void {
    if (year === 0) {
      throw new BadRequestException(message);
    }
  }

  private assignDefined(
    target: Record<string, unknown>,
    key: string,
    value: unknown,
  ): void {
    if (value !== undefined) {
      target[key] = value === '' ? null : value;
    }
  }

  private hasOwn<T extends object>(target: T, key: PropertyKey): boolean {
    return Object.prototype.hasOwnProperty.call(target, key);
  }

  private isClearedValue(value: unknown): boolean {
    return value === null || (typeof value === 'string' && value.trim() === '');
  }

  private normalizeOptionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim();
    return normalized ? normalized : undefined;
  }

  private transformScholar(scholar: ScholarWithSchool): ScholarDto {
    const { philosophicalSchool: school, ...scholarData } = scholar;
    const majorWorks = this.safeJsonParse<unknown[]>(scholarData.majorWorks);
    const achievements = this.safeJsonParse<string[]>(scholarData.achievements);
    const contributions = this.safeJsonParse<string[]>(
      scholarData.contributions,
    );

    return {
      ...scholarData,
      dynasty: (scholarData.dynasty ?? scholarData.dynastyPeriod) as
        | string
        | null,
      schoolOfThought: (scholarData.schoolOfThought ?? school?.name ?? null) as
        | string
        | null,
      majorWorks,
      representativeWorks: this.toRepresentativeWorks(majorWorks),
      contributions,
      achievements: achievements ?? contributions,
      sources: this.safeJsonParse<string[]>(scholarData.sources),
    } as ScholarDto;
  }

  private transformSchool(school: SchoolRecord): PhilosophicalSchoolDto {
    return {
      ...school,
      coreBeliefs: this.safeJsonParse<string[]>(school.coreBeliefs),
      keyTexts: this.safeJsonParse<string[]>(school.keyTexts),
      representativeFigures: this.safeJsonParse<Record<string, unknown>[]>(
        school.representativeFigures,
      ),
      classicWorks: this.safeJsonParse<Record<string, unknown>[]>(
        school.classicWorks,
      ),
      sources: this.safeJsonParse<string[]>(school.sources),
    } as PhilosophicalSchoolDto;
  }

  private toRepresentativeWorks(works: unknown[] | null): unknown[] | null {
    if (!Array.isArray(works)) {
      return works;
    }

    return works.filter(
      (work) => typeof work === 'object' && work !== null && 'title' in work,
    );
  }

  private safeJsonParse<T = unknown>(value: unknown): T | null {
    if (!value) return null;
    if (typeof value === 'string') {
      if (value.trim() === '') return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    }
    return value as T;
  }
}
