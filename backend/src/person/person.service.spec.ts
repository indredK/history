import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PersonService } from './person.service';
import { PrismaService } from '../prisma/prisma.service';
import type { PersonQueryDto } from './dto/person-query.dto';

type MockPersonRecord = {
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
  roles: string | null;
  aliases: string | null;
  achievements: string | null;
  works: string | null;
  events: string | null;
  evaluations: string | null;
  portraitUrl: string | null;
  sources: string | null;
  confidence: number | null;
  createdAt: Date;
  updatedAt: Date;
};

function asQuery(partial: Partial<PersonQueryDto>): PersonQueryDto {
  return partial as PersonQueryDto;
}

function getCallArg<T>(mock: jest.Mock, callIdx = 0, argIdx = 0): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mock.mock.calls[callIdx]?.[argIdx] as T;
}

function sqlText(value: unknown): string {
  if (value && typeof value === 'object' && 'strings' in value) {
    return (value as { strings: string[] }).strings.join('?');
  }
  return String(value);
}

function personRecord(
  overrides: Partial<MockPersonRecord> = {},
): MockPersonRecord {
  return {
    id: 'libai',
    name: '李白',
    nameEn: 'Li Bai',
    courtesy: '太白',
    dynasty: '唐',
    period: null,
    gender: 'male',
    birthYear: 701,
    birthMonth: null,
    deathYear: 762,
    deathMonth: null,
    birthplace: '蜀郡',
    biography: '唐代诗人',
    roles: '["poet"]',
    aliases: '["青莲居士"]',
    achievements: '["诗仙"]',
    works: '["静夜思"]',
    events: '[{"name":"入长安","year":742}]',
    evaluations: '[{"source":"旧唐书","content":"有逸才"}]',
    portraitUrl: null,
    sources: '[{"title":"旧唐书"}]',
    confidence: 0.92,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

describe('PersonService', () => {
  let service: PersonService;
  let prisma: {
    client: {
      $queryRaw: jest.Mock;
      $executeRaw: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      client: {
        $queryRaw: jest.fn(),
        $executeRaw: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [PersonService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get<PersonService>(PersonService);
  });

  describe('findAll', () => {
    it('按当前原生 SQL 查询路径返回分页人物并解析 JSON 字段', async () => {
      prisma.client.$queryRaw
        .mockResolvedValueOnce([personRecord()])
        .mockResolvedValueOnce([{ total: BigInt(1) }]);

      const result = await service.findAll(
        asQuery({
          page: 2,
          limit: 10,
          name: '李',
          sortBy: 'dynasty',
          sortOrder: 'desc',
        }),
      );

      const querySql = sqlText(getCallArg(prisma.client.$queryRaw, 0));
      expect(querySql).toContain('FROM persons');
      expect(querySql).toContain('name LIKE');
      expect(querySql).toContain('ORDER BY dynasty DESC, name ASC');
      expect(querySql).toContain('LIMIT');
      expect(querySql).toContain('OFFSET');
      expect(result.meta).toEqual(
        expect.objectContaining({ page: 2, limit: 10, total: 1 }),
      );
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: 'libai',
          roles: ['poet'],
          aliases: ['青莲居士'],
          events: [{ name: '入长安', year: 742 }],
        }),
      );
    });
  });

  describe('findOne', () => {
    it('找到记录时返回解析后的详情字段', async () => {
      prisma.client.$queryRaw.mockResolvedValueOnce([personRecord()]);

      const result = await service.findOne('libai');

      const querySql = sqlText(getCallArg(prisma.client.$queryRaw));
      expect(querySql).toContain('WHERE id =');
      expect(result).toEqual(
        expect.objectContaining({
          id: 'libai',
          name: '李白',
          achievements: ['诗仙'],
          sources: [{ title: '旧唐书' }],
        }),
      );
    });

    it('未找到时抛 NotFoundException,异常信息含传入 ID', async () => {
      prisma.client.$queryRaw.mockResolvedValueOnce([]);

      await expect(service.findOne('ghost')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('ghost')).rejects.toThrow(/ghost/);
    });
  });

  describe('create/update validation', () => {
    it('创建时拒绝卒年早于生年', async () => {
      await expect(
        service.create({
          name: '李白',
          birthYear: 762,
          deathYear: 701,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.client.$executeRaw).not.toHaveBeenCalled();
    });

    it('更新时拒绝超出范围的可信度', async () => {
      prisma.client.$queryRaw.mockResolvedValueOnce([personRecord()]);

      await expect(
        service.update('libai', { confidence: 1.5 }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.client.$executeRaw).not.toHaveBeenCalled();
    });

    it('更新时保留未传字段并允许清空可选文本', async () => {
      prisma.client.$queryRaw
        .mockResolvedValueOnce([personRecord({ courtesy: '太白' })])
        .mockResolvedValueOnce([personRecord({ courtesy: null })]);
      prisma.client.$executeRaw.mockResolvedValueOnce(1);

      const result = await service.update('libai', { courtesy: '' });

      expect(prisma.client.$executeRaw).toHaveBeenCalledTimes(1);
      expect(result.courtesy).toBeNull();
    });
  });
});
