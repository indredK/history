import { Test, type TestingModule } from '@nestjs/testing';
import { ReligionService } from './religion.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 把 mock 的第 N 次调用第 M 个参数还原为期望类型,
 * 集中处理 jest.Mock.calls 必然产生的 unsafe-member-access。
 */
function getCallArg<T>(mock: jest.Mock, callIdx = 0, argIdx = 0): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mock.mock.calls[callIdx]?.[argIdx] as T;
}

type Maybe<T> = T | null;

interface NodeRow {
  id: string;
  name: string;
  nodeType: string;
  tradition: string;
  description: Maybe<string>;
  period: Maybe<string>;
  location: Maybe<string>;
  createdAt: Date;
  updatedAt: Date;
}

interface EdgeRow {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationship: string;
  strength: Maybe<number>;
  period: Maybe<string>;
  description: Maybe<string>;
  createdAt: Date;
  updatedAt: Date;
  sourceNode?: NodeRow;
  targetNode?: NodeRow;
}

const NOW = new Date('2026-05-26T00:00:00Z');

function makeNode(overrides: Partial<NodeRow> = {}): NodeRow {
  return {
    id: 'n1',
    name: '少林寺',
    nodeType: 'temple',
    tradition: 'buddhism',
    description: null,
    period: null,
    location: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeEdge(overrides: Partial<EdgeRow> = {}): EdgeRow {
  return {
    id: 'e1',
    sourceNodeId: 'n1',
    targetNodeId: 'n2',
    relationship: 'founded_by',
    strength: 0.8,
    period: null,
    description: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

/**
 * ReligionService 单元测试 (§1.6)
 *
 * 覆盖目标:
 * - getGraph 的 where 构建:tradition / nodeType / period / relationship,
 *   注意 period 会同时落到 nodeWhere 和 edgeWhere 上
 * - 默认参数生效:maxNodes=100 / maxEdges=200 / includeNodeDetails=true
 * - nodeIds 从 nodes 结果中提取,作为 edge 的 sourceNodeId/targetNodeId IN 条件
 * - includeNodeDetails 双分支:true 走 include sourceNode/targetNode,false 不 include
 * - DTO 转换:node 字段完整、edge include 模式带 sourceNode/targetNode、
 *   非 include 模式只返回 baseEdge,缺数据时即便 includeNodeDetails=true 也回落 baseEdge
 * - 返回 totalNodes / totalEdges / tradition / nodeType 字段
 */
describe('ReligionService', () => {
  let service: ReligionService;
  let prisma: {
    religionNode: { findMany: jest.Mock };
    religionEdge: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      religionNode: { findMany: jest.fn() },
      religionEdge: { findMany: jest.fn() },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ReligionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get<ReligionService>(ReligionService);
  });

  describe('getGraph - where 构建', () => {
    it('无筛选条件时 nodeWhere/edgeWhere 仅含 nodeIds AND', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({});

      const nodeCall = getCallArg<{ where: Record<string, unknown> }>(
        prisma.religionNode.findMany,
      );
      expect(nodeCall.where).toEqual({});
    });

    it('tradition 落到 nodeWhere,不影响 edgeWhere', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({ tradition: 'buddhism' });

      const nodeCall = getCallArg<{ where: { tradition?: string } }>(
        prisma.religionNode.findMany,
      );
      expect(nodeCall.where.tradition).toBe('buddhism');

      const edgeCall = getCallArg<{
        where: { tradition?: string; AND?: unknown[] };
      }>(prisma.religionEdge.findMany);
      expect(edgeCall.where.tradition).toBeUndefined();
    });

    it('nodeType 落到 nodeWhere,不影响 edgeWhere', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({ nodeType: 'temple' });

      const nodeCall = getCallArg<{ where: { nodeType?: string } }>(
        prisma.religionNode.findMany,
      );
      expect(nodeCall.where.nodeType).toBe('temple');
    });

    it('period 同时落到 nodeWhere 和 edgeWhere(contains 模糊匹配)', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({ period: '唐朝' });

      const nodeCall = getCallArg<{
        where: { period?: { contains?: string } };
      }>(prisma.religionNode.findMany);
      expect(nodeCall.where.period).toEqual({ contains: '唐朝' });

      const edgeCall = getCallArg<{
        where: { period?: { contains?: string }; AND?: unknown[] };
      }>(prisma.religionEdge.findMany);
      expect(edgeCall.where.period).toEqual({ contains: '唐朝' });
    });

    it('relationship 只落到 edgeWhere,不影响 nodeWhere', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({ relationship: 'founded_by' });

      const nodeCall = getCallArg<{
        where: { relationship?: string };
      }>(prisma.religionNode.findMany);
      expect(nodeCall.where.relationship).toBeUndefined();

      const edgeCall = getCallArg<{
        where: { relationship?: string };
      }>(prisma.religionEdge.findMany);
      expect(edgeCall.where.relationship).toBe('founded_by');
    });
  });

  describe('getGraph - 分页与默认值', () => {
    it('默认 maxNodes=100 / maxEdges=200', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({});

      expect(prisma.religionNode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
      expect(prisma.religionEdge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 200 }),
      );
    });

    it('显式 maxNodes / maxEdges 透传', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({ maxNodes: 5, maxEdges: 10 });

      expect(prisma.religionNode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
      expect(prisma.religionEdge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('node 三重 orderBy:tradition / nodeType / name 全部 asc', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({});

      expect(prisma.religionNode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ tradition: 'asc' }, { nodeType: 'asc' }, { name: 'asc' }],
        }),
      );
    });

    it('edge 双 orderBy:relationship asc / strength desc', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({});

      expect(prisma.religionEdge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ relationship: 'asc' }, { strength: 'desc' }],
        }),
      );
    });
  });

  describe('getGraph - nodeIds 串联', () => {
    it('从 nodes 结果中提取 ID,作为 edge AND 条件', async () => {
      prisma.religionNode.findMany.mockResolvedValue([
        makeNode({ id: 'a' }),
        makeNode({ id: 'b' }),
        makeNode({ id: 'c' }),
      ]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({});

      const edgeCall = getCallArg<{
        where: { AND: { sourceNodeId?: unknown; targetNodeId?: unknown }[] };
      }>(prisma.religionEdge.findMany);

      expect(edgeCall.where.AND).toEqual([
        { sourceNodeId: { in: ['a', 'b', 'c'] } },
        { targetNodeId: { in: ['a', 'b', 'c'] } },
      ]);
    });

    it('nodes 为空时,nodeIds 为空数组,edges 仍可查(空集自洽)', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({});

      const edgeCall = getCallArg<{
        where: { AND: { sourceNodeId?: unknown; targetNodeId?: unknown }[] };
      }>(prisma.religionEdge.findMany);
      expect(edgeCall.where.AND).toEqual([
        { sourceNodeId: { in: [] } },
        { targetNodeId: { in: [] } },
      ]);
    });
  });

  describe('getGraph - includeNodeDetails 分支', () => {
    it('默认 includeNodeDetails=true 时 edge 查询带 include sourceNode/targetNode', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({});

      expect(prisma.religionEdge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { sourceNode: true, targetNode: true },
        }),
      );
    });

    it('includeNodeDetails=false 时 edge 查询不带 include', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      await service.getGraph({ includeNodeDetails: false });

      const edgeCall = getCallArg<{ include?: unknown }>(
        prisma.religionEdge.findMany,
      );
      expect(edgeCall.include).toBeUndefined();
    });
  });

  describe('getGraph - DTO 转换与返回', () => {
    it('node 字段映射完整(id/name/nodeType/tradition/description/period/location/timestamps)', async () => {
      const node = makeNode({
        id: 'shaolin',
        name: '少林寺',
        nodeType: 'temple',
        tradition: 'buddhism',
        description: '禅宗祖庭',
        period: '北魏',
        location: '河南嵩山',
      });
      prisma.religionNode.findMany.mockResolvedValue([node]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      const result = await service.getGraph({});

      expect(result.nodes[0]).toEqual({
        id: 'shaolin',
        name: '少林寺',
        nodeType: 'temple',
        tradition: 'buddhism',
        description: '禅宗祖庭',
        period: '北魏',
        location: '河南嵩山',
        createdAt: NOW,
        updatedAt: NOW,
      });
    });

    it('includeNodeDetails=true + edge 含 sourceNode/targetNode → 完整展开', async () => {
      const src = makeNode({ id: 'a', name: 'A' });
      const dst = makeNode({ id: 'b', name: 'B' });
      prisma.religionNode.findMany.mockResolvedValue([src, dst]);
      prisma.religionEdge.findMany.mockResolvedValue([
        makeEdge({
          id: 'e1',
          sourceNodeId: 'a',
          targetNodeId: 'b',
          sourceNode: src,
          targetNode: dst,
        }),
      ]);

      const result = await service.getGraph({});

      const edge = result.edges[0] as unknown as Record<string, unknown>;
      expect(edge.id).toBe('e1');
      expect(edge.sourceNodeId).toBe('a');
      expect(edge.targetNodeId).toBe('b');
      expect(edge.relationship).toBe('founded_by');
      expect(edge.sourceNode).toMatchObject({ id: 'a', name: 'A' });
      expect(edge.targetNode).toMatchObject({ id: 'b', name: 'B' });
    });

    it('includeNodeDetails=false → edge 只含 baseEdge,无 sourceNode/targetNode', async () => {
      prisma.religionNode.findMany.mockResolvedValue([makeNode({ id: 'a' })]);
      prisma.religionEdge.findMany.mockResolvedValue([
        // 模拟 prisma 不 include 时返回的形状
        makeEdge({ id: 'e1', sourceNode: undefined, targetNode: undefined }),
      ]);

      const result = await service.getGraph({ includeNodeDetails: false });

      const edge = result.edges[0] as unknown as Record<string, unknown>;
      expect(edge.id).toBe('e1');
      expect(edge.sourceNode).toBeUndefined();
      expect(edge.targetNode).toBeUndefined();
    });

    it('includeNodeDetails=true 但 edge.sourceNode/targetNode 缺失 → 回落 baseEdge', async () => {
      prisma.religionNode.findMany.mockResolvedValue([makeNode({ id: 'a' })]);
      prisma.religionEdge.findMany.mockResolvedValue([
        // 异常路径:include 了但 prisma 给回来的 sourceNode 是 null/undefined
        makeEdge({ id: 'e-bad', sourceNode: undefined, targetNode: undefined }),
      ]);

      const result = await service.getGraph({ includeNodeDetails: true });

      const edge = result.edges[0] as unknown as Record<string, unknown>;
      expect(edge.id).toBe('e-bad');
      expect(edge.sourceNode).toBeUndefined();
      expect(edge.targetNode).toBeUndefined();
    });

    it('返回 totalNodes / totalEdges 来自 DTO 数组长度', async () => {
      prisma.religionNode.findMany.mockResolvedValue([
        makeNode({ id: 'a' }),
        makeNode({ id: 'b' }),
      ]);
      prisma.religionEdge.findMany.mockResolvedValue([
        makeEdge({ id: 'e1' }),
        makeEdge({ id: 'e2' }),
        makeEdge({ id: 'e3' }),
      ]);

      const result = await service.getGraph({});

      expect(result.totalNodes).toBe(2);
      expect(result.totalEdges).toBe(3);
    });

    it('返回回显入参的 tradition / nodeType,方便前端做面包屑', async () => {
      prisma.religionNode.findMany.mockResolvedValue([]);
      prisma.religionEdge.findMany.mockResolvedValue([]);

      const result = await service.getGraph({
        tradition: 'taoism',
        nodeType: 'sect',
      });

      expect(result.tradition).toBe('taoism');
      expect(result.nodeType).toBe('sect');
    });
  });
});
