import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import type { MythologyModel } from '../generated/prisma/models/Mythology';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMythologyDto } from './dto/create-mythology.dto';
import { MythologyDto } from './dto/mythology.dto';
import { MythologyQueryDto } from './dto/mythology-query.dto';
import { UpdateMythologyDto } from './dto/update-mythology.dto';

type MythologyRecord = MythologyModel;
type StoryPayload = {
  sections: string[];
  characters: string[];
  englishTitle?: string;
  imageUrl?: string;
};

const CATEGORY_ALIASES: Record<string, string> = {
  creation_myth: '创世神话',
  creation: '创世神话',
  deity: '神仙传说',
  legend: '民间传说',
  folklore: '民间传说',
  other: '民间传说',
};

const VALID_CATEGORIES = [
  '创世神话',
  '英雄神话',
  '自然神话',
  '爱情神话',
  '神仙传说',
  '民间传说',
];

@Injectable()
export class MythologyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: MythologyQueryDto,
  ): Promise<PaginatedResponseDto<MythologyDto>> {
    const {
      page = 1,
      limit = 20,
      category,
      origin,
      period,
      name,
      keyword,
    } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere({ category, origin, period, name, keyword });

    const [mythologies, total] = await Promise.all([
      this.prisma.mythology.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.mythology.count({ where }),
    ]);

    return new PaginatedResponseDto(
      mythologies.map((mythology) => this.toDto(mythology)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<MythologyDto> {
    const mythology = await this.prisma.mythology.findUnique({
      where: { id },
    });

    if (!mythology) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的神话记录`);
    }

    return this.toDto(mythology);
  }

  async create(input: CreateMythologyDto): Promise<MythologyDto> {
    const created = await this.prisma.mythology.create({
      data: this.toCreateInput(input),
    });

    return this.toDto(created);
  }

  async update(id: string, input: UpdateMythologyDto): Promise<MythologyDto> {
    const existing = await this.findRecordOrThrow(id);

    const updated = await this.prisma.mythology.update({
      where: { id },
      data: this.toUpdateInput(input, existing.stories),
    });

    return this.toDto(updated);
  }

  async remove(id: string): Promise<MythologyDto> {
    await this.ensureExists(id);

    const deleted = await this.prisma.mythology.delete({
      where: { id },
    });

    return this.toDto(deleted);
  }

  private buildWhere(filters: {
    category?: string;
    origin?: string;
    period?: string;
    name?: string;
    keyword?: string;
  }): Prisma.MythologyWhereInput {
    const where: Prisma.MythologyWhereInput = {};
    const { category, origin, period, name, keyword } = filters;

    if (category) {
      where.category = this.normalizeCategory(category);
    }

    if (origin) {
      where.origin = { contains: origin };
    }

    if (period) {
      where.period = { contains: period };
    }

    if (name) {
      where.name = { contains: name };
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
        { origin: { contains: keyword } },
        { period: { contains: keyword } },
      ];
    }

    return where;
  }

  private async ensureExists(id: string) {
    const mythology = await this.prisma.mythology.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!mythology) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的神话记录`);
    }
  }

  private async findRecordOrThrow(id: string): Promise<MythologyRecord> {
    const mythology = await this.prisma.mythology.findUnique({
      where: { id },
    });

    if (!mythology) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的神话记录`);
    }

    return mythology;
  }

  private toDto(mythology: MythologyRecord): MythologyDto {
    const storyPayload = this.readStoryPayload(mythology.stories);
    const storyItems =
      storyPayload.sections.length > 0
        ? storyPayload.sections
        : this.normalizeStringArray(mythology.stories);
    const symbolism = this.normalizeStringArray(mythology.symbolism);
    const characters =
      storyPayload.characters.length > 0
        ? storyPayload.characters
        : this.extractCharacters(mythology.stories, storyItems);

    return {
      id: mythology.id,
      title: mythology.name,
      name: mythology.name,
      englishTitle: storyPayload.englishTitle || '',
      category: this.normalizeDisplayCategory(mythology.category),
      origin: mythology.origin || '',
      period: mythology.period || '',
      description: mythology.description || '',
      characters,
      stories: storyItems,
      symbolism,
      source: mythology.origin || '',
      imageUrl: storyPayload.imageUrl || '',
      createdAt: mythology.createdAt,
      updatedAt: mythology.updatedAt,
    };
  }

  private toCreateInput(
    input: CreateMythologyDto,
  ): Prisma.MythologyUncheckedCreateInput {
    const title = this.normalizeRequiredString(input.title, '神话标题不能为空');
    const description = this.normalizeRequiredString(
      input.description,
      '神话描述不能为空',
    );
    const storyPayload = this.buildStoryPayload(input);
    const symbolism = this.normalizeStringArrayInput(input.symbolism);

    return {
      ...(input.id ? { id: input.id } : {}),
      name: this.normalizeOptionalString(input.name) || title,
      category: this.normalizeRequiredCategory(input.category),
      origin: this.normalizeOptionalString(input.origin || input.source),
      period: this.normalizeOptionalString(input.period),
      description,
      stories: this.hasStoryPayload(storyPayload) ? storyPayload : undefined,
      symbolism: symbolism.length > 0 ? symbolism : undefined,
    };
  }

  private toUpdateInput(
    input: UpdateMythologyDto,
    currentStories: unknown,
  ): Prisma.MythologyUncheckedUpdateInput {
    const data: Prisma.MythologyUncheckedUpdateInput = {};

    if (input.title !== undefined || input.name !== undefined) {
      const nextName = input.name || input.title;
      data.name = this.normalizeRequiredString(nextName, '神话标题不能为空');
    }

    if (input.category !== undefined) {
      data.category = this.normalizeRequiredCategory(input.category);
    }

    if (input.origin !== undefined || input.source !== undefined) {
      data.origin = this.normalizeNullableString(input.origin || input.source);
    }

    if (input.period !== undefined) {
      data.period = this.normalizeNullableString(input.period);
    }

    if (input.description !== undefined) {
      data.description = this.normalizeRequiredString(
        input.description,
        '神话描述不能为空',
      );
    }

    if (
      input.stories !== undefined ||
      input.characters !== undefined ||
      input.englishTitle !== undefined ||
      input.imageUrl !== undefined
    ) {
      const storyPayload = this.buildStoryPayload(input, currentStories);
      data.stories = this.hasStoryPayload(storyPayload)
        ? storyPayload
        : Prisma.JsonNull;
    }

    if (input.symbolism !== undefined) {
      const symbolism = this.normalizeStringArrayInput(input.symbolism);
      data.symbolism = symbolism.length > 0 ? symbolism : Prisma.JsonNull;
    }

    return data;
  }

  private safeJsonParse<T = unknown>(value: unknown): T | null {
    if (!value) return null;
    if (typeof value === 'string' && value.trim() !== '') {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    }
    return value as T;
  }

  private normalizeStringArray(value: unknown): string[] {
    const parsed = this.safeJsonParse<unknown>(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const strings: string[] = [];

    for (const item of parsed) {
      if (typeof item === 'string' && item.trim() !== '') {
        strings.push(item.trim());
        continue;
      }

      if (Array.isArray(item)) {
        for (const nested of item) {
          if (typeof nested === 'string' && nested.trim() !== '') {
            strings.push(nested.trim());
          }
        }
      }
    }

    return this.unique(strings);
  }

  private extractCharacters(
    rawStories: unknown,
    storyItems: string[],
  ): string[] {
    const parsed = this.safeJsonParse<unknown>(rawStories);

    if (Array.isArray(parsed)) {
      const nestedStrings = parsed.flatMap((item) => {
        if (!Array.isArray(item)) {
          return [];
        }

        return item.filter(
          (nested): nested is string =>
            typeof nested === 'string' && nested.trim() !== '',
        );
      });

      if (nestedStrings.length > 0) {
        return this.unique(nestedStrings.map((item) => item.trim())).slice(
          0,
          5,
        );
      }
    }

    return storyItems.slice(0, 5);
  }

  private normalizeStringArrayInput(value?: string[] | null): string[] {
    if (!value) {
      return [];
    }

    return this.unique(
      value.map((item) => item.trim()).filter((item) => item.length > 0),
    );
  }

  private normalizeOptionalString(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private normalizeCategory(category: string): string {
    const trimmed = category.trim();
    return CATEGORY_ALIASES[trimmed] || trimmed;
  }

  private normalizeDisplayCategory(category: string): string {
    const normalized = this.normalizeCategory(category);
    return VALID_CATEGORIES.includes(normalized) ? normalized : '民间传说';
  }

  private normalizeRequiredCategory(category: unknown): string {
    if (typeof category !== 'string' || category.trim().length === 0) {
      throw new BadRequestException('神话分类不能为空');
    }

    const normalized = this.normalizeCategory(category);
    if (!VALID_CATEGORIES.includes(normalized)) {
      throw new BadRequestException('神话分类无效');
    }

    return normalized;
  }

  private normalizeRequiredString(value: unknown, message: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(message);
    }

    const trimmed = value.trim();
    if (!trimmed) {
      throw new BadRequestException(message);
    }

    return trimmed;
  }

  private normalizeNullableString(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private buildStoryPayload(
    input: Partial<CreateMythologyDto>,
    currentStories?: unknown,
  ): StoryPayload {
    const current = this.readStoryPayload(currentStories);
    const sections =
      input.stories !== undefined
        ? this.normalizeStringArrayInput(input.stories)
        : current.sections;
    const characters =
      input.characters !== undefined
        ? this.normalizeStringArrayInput(input.characters)
        : current.characters;
    const englishTitle =
      input.englishTitle !== undefined
        ? this.normalizeOptionalString(input.englishTitle)
        : current.englishTitle;
    const imageUrl =
      input.imageUrl !== undefined
        ? this.normalizeOptionalString(input.imageUrl)
        : current.imageUrl;

    return {
      sections,
      characters,
      ...(englishTitle ? { englishTitle } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    };
  }

  private readStoryPayload(value: unknown): StoryPayload {
    const parsed = this.safeJsonParse<unknown>(value);

    if (this.isRecord(parsed)) {
      return {
        sections: this.normalizeStringArray(parsed.sections ?? parsed.stories),
        characters: this.normalizeStringArray(parsed.characters),
        englishTitle: this.readString(parsed.englishTitle),
        imageUrl: this.readString(parsed.imageUrl),
      };
    }

    return {
      sections: this.normalizeStringArray(parsed),
      characters: [],
    };
  }

  private hasStoryPayload(payload: StoryPayload): boolean {
    return (
      payload.sections.length > 0 ||
      payload.characters.length > 0 ||
      Boolean(payload.englishTitle) ||
      Boolean(payload.imageUrl)
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  private readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() !== ''
      ? value.trim()
      : undefined;
  }

  private unique(items: string[]): string[] {
    return Array.from(new Set(items));
  }
}
