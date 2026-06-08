import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import type { ReligionEdgeGetPayload } from '../generated/prisma/models';
import { ReligionGraphQueryDto } from './dto/religion-query.dto';
import { ReligionGraphDto } from './dto/religion-graph.dto';
import { ReligionNodeDto } from './dto/religion-node.dto';
import { ReligionEdgeDto } from './dto/religion-edge.dto';

@Injectable()
export class ReligionService {
  constructor(private readonly prisma: PrismaService) {}

  async getGraph(query: ReligionGraphQueryDto): Promise<ReligionGraphDto> {
    const {
      tradition,
      nodeType,
      relationship,
      period,
      maxNodes = 100,
      maxEdges = 200,
      includeNodeDetails = true,
    } = query;

    // Build where clauses for nodes and edges
    const nodeWhere: Prisma.ReligionNodeWhereInput = {};
    const edgeWhere: Prisma.ReligionEdgeWhereInput = {};

    if (tradition) {
      nodeWhere.tradition = tradition;
    }

    if (nodeType) {
      nodeWhere.nodeType = nodeType;
    }

    if (period) {
      nodeWhere.period = { contains: period };
      edgeWhere.period = { contains: period };
    }

    if (relationship) {
      edgeWhere.relationship = relationship;
    }

    // Get nodes first
    const nodes = await this.prisma.religionNode.findMany({
      where: nodeWhere,
      take: maxNodes,
      orderBy: [{ tradition: 'asc' }, { nodeType: 'asc' }, { name: 'asc' }],
    });

    // Get node IDs for filtering edges
    const nodeIds = nodes.map((node) => node.id);

    // Build edge where clause to only include edges between retrieved nodes
    const edgeWhereWithNodes = {
      ...edgeWhere,
      AND: [
        { sourceNodeId: { in: nodeIds } },
        { targetNodeId: { in: nodeIds } },
      ],
    };

    // Get edges
    const edgesQuery = includeNodeDetails
      ? this.prisma.religionEdge.findMany({
          where: edgeWhereWithNodes,
          take: maxEdges,
          orderBy: [{ relationship: 'asc' }, { strength: 'desc' }],
          include: {
            sourceNode: true,
            targetNode: true,
          },
        })
      : this.prisma.religionEdge.findMany({
          where: edgeWhereWithNodes,
          take: maxEdges,
          orderBy: [{ relationship: 'asc' }, { strength: 'desc' }],
        });

    const edges = await edgesQuery;

    /**
     * Edge 在 includeNodeDetails=true 分支会带 sourceNode/targetNode,
     * 用 generated payload 类型把 include 形态固化下来,后面的 truthy 守卫
     * (`edge.sourceNode && edge.targetNode`)处理 false 分支没有 include 的情况。
     */
    type EdgeWithNodes = ReligionEdgeGetPayload<{
      include: { sourceNode: true; targetNode: true };
    }>;

    // Transform nodes to DTO
    const nodeDtos: ReligionNodeDto[] = nodes.map((node) => ({
      id: node.id,
      name: node.name,
      nodeType: node.nodeType,
      tradition: node.tradition,
      description: node.description,
      period: node.period,
      location: node.location,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    }));

    // Transform edges to DTO
    const edgeDtos: ReligionEdgeDto[] = (edges as EdgeWithNodes[]).map(
      (edge) => {
        const baseEdge = {
          id: edge.id,
          sourceNodeId: edge.sourceNodeId,
          targetNodeId: edge.targetNodeId,
          relationship: edge.relationship,
          strength: edge.strength,
          period: edge.period,
          description: edge.description,
          createdAt: edge.createdAt,
          updatedAt: edge.updatedAt,
        };

        // Add node details if included
        if (includeNodeDetails && edge.sourceNode && edge.targetNode) {
          return {
            ...baseEdge,
            sourceNode: {
              id: edge.sourceNode.id,
              name: edge.sourceNode.name,
              nodeType: edge.sourceNode.nodeType,
              tradition: edge.sourceNode.tradition,
              description: edge.sourceNode.description,
              period: edge.sourceNode.period,
              location: edge.sourceNode.location,
              createdAt: edge.sourceNode.createdAt,
              updatedAt: edge.sourceNode.updatedAt,
            },
            targetNode: {
              id: edge.targetNode.id,
              name: edge.targetNode.name,
              nodeType: edge.targetNode.nodeType,
              tradition: edge.targetNode.tradition,
              description: edge.targetNode.description,
              period: edge.targetNode.period,
              location: edge.targetNode.location,
              createdAt: edge.targetNode.createdAt,
              updatedAt: edge.targetNode.updatedAt,
            },
          };
        }

        return baseEdge;
      },
    );

    return {
      nodes: nodeDtos,
      edges: edgeDtos,
      totalNodes: nodeDtos.length,
      totalEdges: edgeDtos.length,
      tradition,
      nodeType,
    };
  }
}
