import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { PersonQueryDto } from './dto/person-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PersonDto } from './dto/person.dto';
import { CreatePersonDto, UpdatePersonDto } from './dto/person-mutation.dto';

type JsonField = string | null | unknown;

interface PersonRecord {
  id: string;
  name: string;
  nameEn: string | null;
  courtesy: string | null;
  dynasty: string | null;
  period: string | null;
  gender: string | null;
  birthYear: number | null;
  birthMonth: number | null;
  deathYear: number | null;
  deathMonth: number | null;
  birthplace: string | null;
  biography: string | null;
  roles: JsonField;
  aliases: JsonField;
  achievements: JsonField;
  works: JsonField;
  events: JsonField;
  evaluations: JsonField;
  portraitUrl: string | null;
  sources: JsonField;
  confidence: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface PersonCountRecord {
  total: number | bigint;
}

const SORT_COLUMN_MAP: Record<
  NonNullable<PersonQueryDto['sortBy']>,
  string
> = {
  birthYear: 'birthYear',
  deathYear: 'deathYear',
  name: 'name',
  dynasty: 'dynasty',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt',
};

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PersonQueryDto,
  ): Promise<PaginatedResponseDto<PersonDto>> {
    const {
      page = 1,
      limit = 20,
      birthYear,
      birthYearEnd,
      deathYear,
      deathYearStart,
      name,
      dynasty,
      role,
      gender,
      keyword,
      confidenceMin,
      sortBy = 'birthYear',
      sortOrder = 'asc',
    } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhereSql({
      birthYear,
      birthYearEnd,
      deathYear,
      deathYearStart,
      name,
      dynasty,
      role,
      gender,
      keyword,
      confidenceMin,
    });
    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? SORT_COLUMN_MAP.birthYear;
    const sortDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const orderBy = Prisma.raw(
      `ORDER BY ${sortColumn} ${sortDirection}, name ASC`,
    );

    const [persons, counts] = await Promise.all([
      this.prisma.client.$queryRaw<PersonRecord[]>(Prisma.sql`
        SELECT
          id, name, nameEn, courtesy, dynasty, period, gender,
          birthYear, birthMonth, deathYear, deathMonth, birthplace,
          biography, roles, aliases, achievements, works, events, evaluations,
          portraitUrl, sources, confidence, createdAt, updatedAt
        FROM persons
        ${where}
        ${orderBy}
        LIMIT ${limit} OFFSET ${skip}
      `),
      this.prisma.client.$queryRaw<PersonCountRecord[]>(Prisma.sql`
        SELECT COUNT(*) AS total
        FROM persons
        ${where}
      `),
    ]);

    const total = Number(counts[0]?.total ?? 0);
    return new PaginatedResponseDto(
      persons.map((person) => this.toDto(person)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<PersonDto> {
    const [person] = await this.prisma.client.$queryRaw<PersonRecord[]>(
      Prisma.sql`
        SELECT
          id, name, nameEn, courtesy, dynasty, period, gender,
          birthYear, birthMonth, deathYear, deathMonth, birthplace,
          biography, roles, aliases, achievements, works, events, evaluations,
          portraitUrl, sources, confidence, createdAt, updatedAt
        FROM persons
        WHERE id = ${id}
        LIMIT 1
      `,
    );

    if (!person) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的人物记录`);
    }

    return this.toDto(person);
  }

  async create(dto: CreatePersonDto): Promise<PersonDto> {
    if (!dto.name?.trim()) {
      throw new BadRequestException('人物姓名不能为空');
    }
    this.assertLifespan(dto.birthYear, dto.deathYear);
    this.assertConfidence(dto.confidence);

    const id = randomUUID();
    const now = new Date();

    await this.prisma.client.$executeRaw(Prisma.sql`
      INSERT INTO persons (
        id, name, nameEn, courtesy, dynasty, period, gender,
        birthYear, birthMonth, deathYear, deathMonth, birthplace,
        biography, roles, aliases, achievements, works, events, evaluations,
        portraitUrl, sources, confidence, createdAt, updatedAt
      )
      VALUES (
        ${id}, ${dto.name.trim()}, ${this.nullableString(dto.nameEn)},
        ${this.nullableString(dto.courtesy)}, ${this.nullableString(dto.dynasty)},
        ${this.nullableString(dto.period)}, ${this.nullableString(dto.gender)},
        ${dto.birthYear ?? null}, ${dto.birthMonth ?? null},
        ${dto.deathYear ?? null}, ${dto.deathMonth ?? null},
        ${this.nullableString(dto.birthplace)}, ${this.nullableString(dto.biography)},
        ${this.toDbJson(dto.roles)}, ${this.toDbJson(dto.aliases)},
        ${this.toDbJson(dto.achievements)}, ${this.toDbJson(dto.works)},
        ${this.toDbJson(dto.events)}, ${this.toDbJson(dto.evaluations)},
        ${this.nullableString(dto.portraitUrl)}, ${this.toDbJson(dto.sources)},
        ${dto.confidence ?? null}, ${now}, ${now}
      )
    `);

    return this.findOne(id);
  }

  async update(id: string, dto: UpdatePersonDto): Promise<PersonDto> {
    const current = await this.findOne(id);
    const next = { ...current, ...this.removeUndefined(dto) };

    if (!next.name?.trim()) {
      throw new BadRequestException('人物姓名不能为空');
    }
    this.assertLifespan(next.birthYear, next.deathYear);
    this.assertConfidence(next.confidence);

    await this.prisma.client.$executeRaw(Prisma.sql`
      UPDATE persons
      SET
        name = ${next.name.trim()},
        nameEn = ${this.nullableString(next.nameEn)},
        courtesy = ${this.nullableString(next.courtesy)},
        dynasty = ${this.nullableString(next.dynasty)},
        period = ${this.nullableString(next.period)},
        gender = ${this.nullableString(next.gender)},
        birthYear = ${next.birthYear ?? null},
        birthMonth = ${next.birthMonth ?? null},
        deathYear = ${next.deathYear ?? null},
        deathMonth = ${next.deathMonth ?? null},
        birthplace = ${this.nullableString(next.birthplace)},
        biography = ${this.nullableString(next.biography)},
        roles = ${this.toDbJson(next.roles)},
        aliases = ${this.toDbJson(next.aliases)},
        achievements = ${this.toDbJson(next.achievements)},
        works = ${this.toDbJson(next.works)},
        events = ${this.toDbJson(next.events)},
        evaluations = ${this.toDbJson(next.evaluations)},
        portraitUrl = ${this.nullableString(next.portraitUrl)},
        sources = ${this.toDbJson(next.sources)},
        confidence = ${next.confidence ?? null},
        updatedAt = ${new Date()}
      WHERE id = ${id}
    `);

    return this.findOne(id);
  }

  async remove(id: string): Promise<PersonDto> {
    const person = await this.findOne(id);

    await this.prisma.client.$executeRaw(Prisma.sql`
      DELETE FROM persons
      WHERE id = ${id}
    `);

    return person;
  }

  private buildWhereSql(filters: {
    birthYear?: number;
    birthYearEnd?: number;
    deathYear?: number;
    deathYearStart?: number;
    name?: string;
    dynasty?: string;
    role?: string;
    gender?: string;
    keyword?: string;
    confidenceMin?: number;
  }): Prisma.Sql {
    const conditions: Prisma.Sql[] = [];

    if (filters.birthYear !== undefined) {
      conditions.push(Prisma.sql`birthYear >= ${filters.birthYear}`);
    }

    if (filters.birthYearEnd !== undefined) {
      conditions.push(Prisma.sql`birthYear <= ${filters.birthYearEnd}`);
    }

    if (filters.deathYear !== undefined) {
      conditions.push(
        Prisma.sql`(deathYear <= ${filters.deathYear} OR deathYear IS NULL)`,
      );
    }

    if (filters.deathYearStart !== undefined) {
      conditions.push(
        Prisma.sql`(deathYear >= ${filters.deathYearStart} OR deathYear IS NULL)`,
      );
    }

    if (filters.name?.trim()) {
      const pattern = this.like(filters.name);
      conditions.push(Prisma.sql`(
        name LIKE ${pattern}
        OR nameEn LIKE ${pattern}
        OR courtesy LIKE ${pattern}
        OR aliases LIKE ${pattern}
      )`);
    }

    if (filters.dynasty?.trim() && filters.dynasty !== '全部') {
      conditions.push(Prisma.sql`dynasty = ${filters.dynasty}`);
    }

    if (filters.role?.trim() && filters.role !== '全部') {
      const rolePattern = this.like(filters.role);
      conditions.push(Prisma.sql`roles LIKE ${rolePattern}`);
    }

    if (filters.gender?.trim() && filters.gender !== '全部') {
      conditions.push(Prisma.sql`gender = ${filters.gender}`);
    }

    if (filters.keyword?.trim()) {
      const pattern = this.like(filters.keyword);
      conditions.push(Prisma.sql`(
        name LIKE ${pattern}
        OR nameEn LIKE ${pattern}
        OR courtesy LIKE ${pattern}
        OR dynasty LIKE ${pattern}
        OR period LIKE ${pattern}
        OR birthplace LIKE ${pattern}
        OR biography LIKE ${pattern}
        OR roles LIKE ${pattern}
        OR aliases LIKE ${pattern}
        OR achievements LIKE ${pattern}
        OR works LIKE ${pattern}
      )`);
    }

    if (filters.confidenceMin !== undefined) {
      conditions.push(Prisma.sql`confidence >= ${filters.confidenceMin}`);
    }

    return conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;
  }

  private toDto(record: PersonRecord): PersonDto {
    return {
      ...record,
      roles: this.parseJson<string[]>(record.roles),
      aliases: this.parseJson<string[]>(record.aliases),
      achievements: this.parseJson<string[]>(record.achievements),
      works: this.parseJson<string[]>(record.works),
      events: this.parseJson(record.events),
      evaluations: this.parseJson(record.evaluations),
      sources: this.parseJson(record.sources),
      createdAt: this.toDate(record.createdAt),
      updatedAt: this.toDate(record.updatedAt),
    };
  }

  private parseJson<T>(value: unknown): T | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    }
    return value as T;
  }

  private toDbJson(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    return JSON.stringify(value);
  }

  private nullableString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private assertLifespan(
    birthYear?: number | null,
    deathYear?: number | null,
  ): void {
    if (
      birthYear !== undefined
      && birthYear !== null
      && deathYear !== undefined
      && deathYear !== null
      && deathYear < birthYear
    ) {
      throw new BadRequestException('人物卒年不能早于生年');
    }
  }

  private assertConfidence(confidence?: number | null): void {
    if (
      confidence !== undefined
      && confidence !== null
      && (confidence < 0 || confidence > 1)
    ) {
      throw new BadRequestException('人物可信度必须在 0 到 1 之间');
    }
  }

  private like(value: string): string {
    return `%${value.trim()}%`;
  }

  private toDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
  }

  private removeUndefined<T extends object>(value: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(value).filter(([, entry]) => entry !== undefined),
    ) as Partial<T>;
  }
}
