/**
 * religionStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state(graphData=null / 各集合空 / loading=false / viewMode='force')
 * - 基础 setters:setViewMode / setGraphData / setSelectedNode /
 *   setHighlightedNodes / setHighlightedEdges / setSelectedSects /
 *   setLoading / setError
 * - setHoveredNode:
 *   * null → 同时清空 hoveredNode / highlightedNodes / highlightedEdges
 *   * graphData=null → 只设 hoveredNode 不算邻居
 *   * 命中节点 → 把和该节点相连的所有边及两端节点点亮(含节点自己)
 * - setSearchQuery:
 *   * 空字符串 / 仅空白 → 清空 highlightedNodes
 *   * graphData=null → 仍写入 searchQuery,清空 highlightedNodes
 *   * 命中关键字 → highlightedNodes 含所有 name/title 匹配的节点
 * - getFilteredNodes:
 *   * graphData=null → []
 *   * 不筛 → 原数组
 *   * selectedSects 命中:sect 节点按 name===sect 或 id 包含 sect.lower
 *     豁免;其他节点按 sect 字段筛
 *   * searchQuery 在 name/title/description 三字段模糊匹配
 *   * sect + search 同时生效:先 sect 再 search
 * - getFilteredEdges:只保留两端节点都在筛选结果中的边
 * - getRelatedNodesAndEdges:
 *   * graphData=null → { nodes: [], edges: [] }
 *   * 命中节点 → 邻居节点(剔除自身)+ 所有相连边
 * - resetFilters:四个筛选/高亮字段同时清空
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useReligionStore } from "./religionStore";
import type {
  ReligionGraphData,
  ReligionNode,
  ReligionEdge,
} from "@/services/religion/types";

/** 构造一个 4 节点 4 边的最小图,涵盖 deity / sect / search 等多维。 */
function makeFixture(): ReligionGraphData {
  const nodes: ReligionNode[] = [
    {
      id: "n-chanjiao",
      name: "阐教",
      type: "sect",
      description: "Chanjiao sect",
    },
    {
      id: "n-jiejiao",
      name: "截教",
      type: "sect",
      description: "Jiejiao sect",
    },
    {
      id: "n-yuanshi",
      name: "元始天尊",
      type: "deity",
      sect: "阐教",
      title: "阐教教主",
      description: "阐教掌门",
    },
    {
      id: "n-tongtian",
      name: "通天教主",
      type: "deity",
      sect: "截教",
      title: "截教教主",
      description: "截教掌门",
    },
  ];

  const edges: ReligionEdge[] = [
    {
      id: "e-1",
      source: "n-yuanshi",
      target: "n-chanjiao",
      relationship: "从属",
    },
    {
      id: "e-2",
      source: "n-tongtian",
      target: "n-jiejiao",
      relationship: "从属",
    },
    {
      id: "e-3",
      source: "n-yuanshi",
      target: "n-tongtian",
      relationship: "敌对",
    },
    {
      id: "e-4",
      source: "n-chanjiao",
      target: "n-jiejiao",
      relationship: "敌对",
    },
  ];

  return {
    nodes,
    edges,
    metadata: { version: "1", lastUpdated: "2026-05-01", sources: [] },
  };
}

beforeEach(() => {
  // store 是单例,每个用例之前重置到干净状态
  useReligionStore.setState({
    graphData: null,
    selectedNode: null,
    hoveredNode: null,
    highlightedNodes: new Set<string>(),
    highlightedEdges: new Set<string>(),
    selectedSects: [],
    searchQuery: "",
    loading: false,
    error: null,
    viewMode: "force",
  });
});

describe("初始状态", () => {
  it("store 默认值符合定义", () => {
    const s = useReligionStore.getState();
    expect(s.graphData).toBeNull();
    expect(s.selectedNode).toBeNull();
    expect(s.hoveredNode).toBeNull();
    expect(s.highlightedNodes).toEqual(new Set());
    expect(s.highlightedEdges).toEqual(new Set());
    expect(s.selectedSects).toEqual([]);
    expect(s.searchQuery).toBe("");
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
    expect(s.viewMode).toBe("force");
  });
});

describe("基础 setters", () => {
  it("setViewMode 切换 force / tree", () => {
    useReligionStore.getState().setViewMode("tree");
    expect(useReligionStore.getState().viewMode).toBe("tree");
    useReligionStore.getState().setViewMode("force");
    expect(useReligionStore.getState().viewMode).toBe("force");
  });

  it("setGraphData / setSelectedNode 都是直接覆盖", () => {
    const data = makeFixture();
    useReligionStore.getState().setGraphData(data);
    expect(useReligionStore.getState().graphData).toBe(data);

    useReligionStore.getState().setSelectedNode(data.nodes[0]!);
    expect(useReligionStore.getState().selectedNode).toBe(data.nodes[0]);
    useReligionStore.getState().setSelectedNode(null);
    expect(useReligionStore.getState().selectedNode).toBeNull();
  });

  it("setHighlightedNodes / setHighlightedEdges 直接替换 Set", () => {
    useReligionStore.getState().setHighlightedNodes(new Set(["a", "b"]));
    expect(useReligionStore.getState().highlightedNodes).toEqual(
      new Set(["a", "b"]),
    );

    useReligionStore.getState().setHighlightedEdges(new Set(["e1"]));
    expect(useReligionStore.getState().highlightedEdges).toEqual(
      new Set(["e1"]),
    );
  });

  it("setSelectedSects / setLoading / setError", () => {
    useReligionStore.getState().setSelectedSects(["阐教"]);
    expect(useReligionStore.getState().selectedSects).toEqual(["阐教"]);

    useReligionStore.getState().setLoading(true);
    expect(useReligionStore.getState().loading).toBe(true);

    useReligionStore.getState().setError("boom");
    expect(useReligionStore.getState().error).toBe("boom");
  });
});

describe("setHoveredNode", () => {
  it("null → 同时清空 hoveredNode / highlightedNodes / highlightedEdges", () => {
    // 先写入一些非空状态
    useReligionStore.setState({
      hoveredNode: makeFixture().nodes[0]!,
      highlightedNodes: new Set(["x"]),
      highlightedEdges: new Set(["e"]),
    });

    useReligionStore.getState().setHoveredNode(null);

    const s = useReligionStore.getState();
    expect(s.hoveredNode).toBeNull();
    expect(s.highlightedNodes).toEqual(new Set());
    expect(s.highlightedEdges).toEqual(new Set());
  });

  it("graphData=null 时只写入 hoveredNode,不算邻居", () => {
    const node = makeFixture().nodes[0]!;
    useReligionStore.getState().setHoveredNode(node);

    const s = useReligionStore.getState();
    expect(s.hoveredNode).toBe(node);
    // 没图数据,高亮集合保持上一轮的初值(空)
    expect(s.highlightedNodes).toEqual(new Set());
    expect(s.highlightedEdges).toEqual(new Set());
  });

  it("命中节点 → 把所有相连的边 & 两端节点点亮(含自己)", () => {
    const data = makeFixture();
    useReligionStore.getState().setGraphData(data);

    // 元始天尊 的相连边:e-1 (→ 阐教) 和 e-3 (→ 通天)
    const yuanshi = data.nodes.find((n) => n.id === "n-yuanshi")!;
    useReligionStore.getState().setHoveredNode(yuanshi);

    const s = useReligionStore.getState();
    expect(s.hoveredNode).toBe(yuanshi);
    expect(s.highlightedEdges).toEqual(new Set(["e-1", "e-3"]));
    expect(s.highlightedNodes).toEqual(
      new Set(["n-yuanshi", "n-chanjiao", "n-tongtian"]),
    );
  });

  it("节点没有相连边 → highlightedNodes 至少包含自己", () => {
    const data: ReligionGraphData = {
      nodes: [{ id: "lone", name: "孤独", type: "deity", description: "" }],
      edges: [],
      metadata: { version: "1", lastUpdated: "", sources: [] },
    };
    useReligionStore.getState().setGraphData(data);
    useReligionStore.getState().setHoveredNode(data.nodes[0]!);

    const s = useReligionStore.getState();
    expect(s.highlightedNodes).toEqual(new Set(["lone"]));
    expect(s.highlightedEdges).toEqual(new Set());
  });
});

describe("setSearchQuery", () => {
  it("空字符串 → highlightedNodes 清空,searchQuery 仍写入", () => {
    useReligionStore.getState().setGraphData(makeFixture());
    useReligionStore.setState({ highlightedNodes: new Set(["x"]) });

    useReligionStore.getState().setSearchQuery("");

    const s = useReligionStore.getState();
    expect(s.searchQuery).toBe("");
    expect(s.highlightedNodes).toEqual(new Set());
  });

  it("仅空白字符串 → 视作空,清空 highlightedNodes", () => {
    useReligionStore.getState().setGraphData(makeFixture());
    useReligionStore.setState({ highlightedNodes: new Set(["x"]) });

    useReligionStore.getState().setSearchQuery("   ");

    expect(useReligionStore.getState().highlightedNodes).toEqual(new Set());
  });

  it("graphData=null → 仍清空 highlightedNodes,searchQuery 写入", () => {
    useReligionStore.getState().setSearchQuery("阐教");
    const s = useReligionStore.getState();
    expect(s.searchQuery).toBe("阐教");
    expect(s.highlightedNodes).toEqual(new Set());
  });

  it("命中 name → highlightedNodes 含匹配节点", () => {
    useReligionStore.getState().setGraphData(makeFixture());
    useReligionStore.getState().setSearchQuery("元始");

    expect(useReligionStore.getState().highlightedNodes).toEqual(
      new Set(["n-yuanshi"]),
    );
  });

  it("大小写归一化(query 转 lower)", () => {
    const data: ReligionGraphData = {
      nodes: [{ id: "n1", name: "Buddha", type: "deity", description: "d" }],
      edges: [],
      metadata: { version: "1", lastUpdated: "", sources: [] },
    };
    useReligionStore.getState().setGraphData(data);
    useReligionStore.getState().setSearchQuery("BUDDHA");

    expect(useReligionStore.getState().highlightedNodes).toEqual(
      new Set(["n1"]),
    );
  });

  it("title 匹配命中:即便 name 不含,匹配 title 也算", () => {
    useReligionStore.getState().setGraphData(makeFixture());
    useReligionStore.getState().setSearchQuery("教主"); // 命中 title

    const ids = useReligionStore.getState().highlightedNodes;
    expect(ids.has("n-yuanshi")).toBe(true);
    expect(ids.has("n-tongtian")).toBe(true);
  });
});

describe("getFilteredNodes / getFilteredEdges", () => {
  it("graphData=null → []", () => {
    expect(useReligionStore.getState().getFilteredNodes()).toEqual([]);
    expect(useReligionStore.getState().getFilteredEdges()).toEqual([]);
  });

  it("不筛 → 全部节点 & 全部边", () => {
    const data = makeFixture();
    useReligionStore.getState().setGraphData(data);

    expect(useReligionStore.getState().getFilteredNodes().length).toBe(
      data.nodes.length,
    );
    expect(useReligionStore.getState().getFilteredEdges().length).toBe(
      data.edges.length,
    );
  });

  it("selectedSects 命中 → 留 sect 节点 + sect 字段匹配的非 sect 节点", () => {
    const data = makeFixture();
    useReligionStore.getState().setGraphData(data);
    useReligionStore.getState().setSelectedSects(["阐教"]);

    const ids = useReligionStore
      .getState()
      .getFilteredNodes()
      .map((n) => n.id);

    // n-chanjiao(sect 节点 name 命中)+ n-yuanshi(sect 字段=阐教)
    expect(ids.sort()).toEqual(["n-chanjiao", "n-yuanshi"].sort());
  });

  it("searchQuery 跨 name/title/description 三字段", () => {
    const data: ReligionGraphData = {
      nodes: [
        { id: "a", name: "Alpha", type: "deity", description: "Hello world" },
        {
          id: "b",
          name: "Beta",
          type: "deity",
          title: "world champion",
          description: "x",
        },
        { id: "c", name: "world-node", type: "deity", description: "x" },
        { id: "d", name: "Delta", type: "deity", description: "irrelevant" },
      ],
      edges: [],
      metadata: { version: "1", lastUpdated: "", sources: [] },
    };
    useReligionStore.getState().setGraphData(data);
    // 通过 setSearchQuery 触发 query 写入;真正用于 filter 的是 getFilteredNodes
    useReligionStore.getState().setSearchQuery("world");

    const ids = useReligionStore
      .getState()
      .getFilteredNodes()
      .map((n) => n.id)
      .sort();
    expect(ids).toEqual(["a", "b", "c"].sort());
  });

  it("sect + search 同时生效:先 sect 再 search", () => {
    const data = makeFixture();
    useReligionStore.getState().setGraphData(data);
    useReligionStore.getState().setSelectedSects(["阐教"]);
    useReligionStore.getState().setSearchQuery("元始");

    const ids = useReligionStore
      .getState()
      .getFilteredNodes()
      .map((n) => n.id);
    expect(ids).toEqual(["n-yuanshi"]);
  });

  it("getFilteredEdges 只留两端都在 filteredNodes 中的边", () => {
    const data = makeFixture();
    useReligionStore.getState().setGraphData(data);
    useReligionStore.getState().setSelectedSects(["阐教"]);

    // 过滤后节点:n-chanjiao, n-yuanshi
    // 候选边:e-1 (yuanshi→chanjiao) ✓, e-3 (yuanshi→tongtian) ✗,
    //        e-4 (chanjiao→jiejiao) ✗
    const ids = useReligionStore
      .getState()
      .getFilteredEdges()
      .map((e) => e.id);
    expect(ids).toEqual(["e-1"]);
  });
});

describe("getRelatedNodesAndEdges", () => {
  it("graphData=null → 空对", () => {
    const r = useReligionStore.getState().getRelatedNodesAndEdges("any");
    expect(r).toEqual({ nodes: [], edges: [] });
  });

  it("命中节点 → 邻居节点(剔除自身)+ 所有相连边", () => {
    const data = makeFixture();
    useReligionStore.getState().setGraphData(data);

    const { nodes, edges } = useReligionStore
      .getState()
      .getRelatedNodesAndEdges("n-yuanshi");

    expect(edges.map((e) => e.id).sort()).toEqual(["e-1", "e-3"].sort());
    expect(nodes.map((n) => n.id).sort()).toEqual(
      ["n-chanjiao", "n-tongtian"].sort(),
    );
    // 不含自己
    expect(nodes.some((n) => n.id === "n-yuanshi")).toBe(false);
  });

  it("孤立节点 → nodes/edges 都是 []", () => {
    const data: ReligionGraphData = {
      nodes: [{ id: "lone", name: "孤独", type: "deity", description: "" }],
      edges: [],
      metadata: { version: "1", lastUpdated: "", sources: [] },
    };
    useReligionStore.getState().setGraphData(data);
    const r = useReligionStore.getState().getRelatedNodesAndEdges("lone");
    expect(r.nodes).toEqual([]);
    expect(r.edges).toEqual([]);
  });
});

describe("resetFilters", () => {
  it("清空 selectedSects / searchQuery / highlightedNodes / highlightedEdges", () => {
    useReligionStore.setState({
      selectedSects: ["阐教"],
      searchQuery: "x",
      highlightedNodes: new Set(["a"]),
      highlightedEdges: new Set(["e"]),
      // 不应被清空的字段:
      hoveredNode: makeFixture().nodes[0]!,
      selectedNode: makeFixture().nodes[1]!,
      loading: true,
    });

    useReligionStore.getState().resetFilters();
    const s = useReligionStore.getState();
    expect(s.selectedSects).toEqual([]);
    expect(s.searchQuery).toBe("");
    expect(s.highlightedNodes).toEqual(new Set());
    expect(s.highlightedEdges).toEqual(new Set());
    // 不应清掉的:
    expect(s.hoveredNode).not.toBeNull();
    expect(s.selectedNode).not.toBeNull();
    expect(s.loading).toBe(true);
  });
});
