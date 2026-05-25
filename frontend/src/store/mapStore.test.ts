/**
 * mapStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:viewport / feature / hover / 三个图层可见性与透明度
 * - setLocation:覆盖 lat/lon/zoom 三个字段
 * - setViewport:浅合并 — 部分字段不丢其它字段
 * - setSelectedFeature / setHoveredFeature:写入与清空(null)
 * - setHoveredFeatureId:联动 hoveredFeatureId 与 hoveredLayerType
 * - toggleAdminBoundary / toggleDynastyBoundary / toggleEventMarkers:布尔翻转
 * - setAdminBoundaryOpacity / setDynastyBoundaryOpacity:0-1 范围 clamp
 */
import { describe, it, expect, beforeEach } from "vitest";
import type { Feature } from "geojson";
import { useMapStore } from "./mapStore";

const INITIAL_STATE = useMapStore.getState();

function makeFeature(id: string): Feature {
  return {
    type: "Feature",
    id,
    properties: { name: id },
    geometry: { type: "Point", coordinates: [110, 35] },
  };
}

describe("mapStore", () => {
  beforeEach(() => {
    // 把 store 重新设置成初始值(保留 actions)
    useMapStore.setState({
      latitude: 35,
      longitude: 110,
      zoom: 4,
      bearing: 0,
      pitch: 0,
      selectedFeature: null,
      hoveredFeature: null,
      hoveredFeatureId: null,
      hoveredLayerType: null,
      adminBoundaryVisible: true,
      adminBoundaryOpacity: 0.3,
      dynastyBoundaryVisible: true,
      dynastyBoundaryOpacity: 0.8,
      eventMarkersVisible: true,
    });
  });

  describe("初始 state", () => {
    it("默认 viewport 居中、所有图层可见、selectedFeature=null", () => {
      // 注意:这里读的是模块加载时的初值,而非 beforeEach 重置后的
      expect(INITIAL_STATE.latitude).toBe(35);
      expect(INITIAL_STATE.longitude).toBe(110);
      expect(INITIAL_STATE.zoom).toBe(4);
      expect(INITIAL_STATE.bearing).toBe(0);
      expect(INITIAL_STATE.pitch).toBe(0);
      expect(INITIAL_STATE.selectedFeature).toBeNull();
      expect(INITIAL_STATE.hoveredFeature).toBeNull();
      expect(INITIAL_STATE.hoveredFeatureId).toBeNull();
      expect(INITIAL_STATE.hoveredLayerType).toBeNull();
      expect(INITIAL_STATE.adminBoundaryVisible).toBe(true);
      expect(INITIAL_STATE.adminBoundaryOpacity).toBe(0.3);
      expect(INITIAL_STATE.dynastyBoundaryVisible).toBe(true);
      expect(INITIAL_STATE.dynastyBoundaryOpacity).toBe(0.8);
      expect(INITIAL_STATE.eventMarkersVisible).toBe(true);
    });
  });

  describe("setLocation", () => {
    it("一次性写入 lat/lon/zoom", () => {
      useMapStore.getState().setLocation(40, 116, 8);
      const s = useMapStore.getState();
      expect(s.latitude).toBe(40);
      expect(s.longitude).toBe(116);
      expect(s.zoom).toBe(8);
    });

    it("不会动 bearing/pitch 等其它 viewport 字段", () => {
      useMapStore.setState({ bearing: 30, pitch: 45 });
      useMapStore.getState().setLocation(10, 20, 5);
      const s = useMapStore.getState();
      expect(s.bearing).toBe(30);
      expect(s.pitch).toBe(45);
    });
  });

  describe("setViewport", () => {
    it("浅合并:只写传入字段,其它保留", () => {
      useMapStore.getState().setViewport({ zoom: 10 });
      const s = useMapStore.getState();
      expect(s.zoom).toBe(10);
      expect(s.latitude).toBe(35);
      expect(s.longitude).toBe(110);
    });

    it("多字段一次性更新", () => {
      useMapStore
        .getState()
        .setViewport({ latitude: 30, longitude: 100, zoom: 6, bearing: 90 });
      const s = useMapStore.getState();
      expect(s.latitude).toBe(30);
      expect(s.longitude).toBe(100);
      expect(s.zoom).toBe(6);
      expect(s.bearing).toBe(90);
    });
  });

  describe("setSelectedFeature / setHoveredFeature", () => {
    it("写入 Feature 对象", () => {
      const f = makeFeature("a");
      useMapStore.getState().setSelectedFeature(f);
      useMapStore.getState().setHoveredFeature(f);
      expect(useMapStore.getState().selectedFeature).toBe(f);
      expect(useMapStore.getState().hoveredFeature).toBe(f);
    });

    it("setSelectedFeature(null) 清空", () => {
      useMapStore.setState({ selectedFeature: makeFeature("a") });
      useMapStore.getState().setSelectedFeature(null);
      expect(useMapStore.getState().selectedFeature).toBeNull();
    });

    it("setHoveredFeature(null) 清空", () => {
      useMapStore.setState({ hoveredFeature: makeFeature("b") });
      useMapStore.getState().setHoveredFeature(null);
      expect(useMapStore.getState().hoveredFeature).toBeNull();
    });
  });

  describe("setHoveredFeatureId", () => {
    it("featureId + layerType 同步写入", () => {
      useMapStore.getState().setHoveredFeatureId("region-1", "admin");
      const s = useMapStore.getState();
      expect(s.hoveredFeatureId).toBe("region-1");
      expect(s.hoveredLayerType).toBe("admin");
    });

    it("可以用 (null, null) 清空", () => {
      useMapStore.setState({
        hoveredFeatureId: "x",
        hoveredLayerType: "dynasty",
      });
      useMapStore.getState().setHoveredFeatureId(null, null);
      const s = useMapStore.getState();
      expect(s.hoveredFeatureId).toBeNull();
      expect(s.hoveredLayerType).toBeNull();
    });

    it("layerType=dynasty 也能写入", () => {
      useMapStore.getState().setHoveredFeatureId("tang", "dynasty");
      expect(useMapStore.getState().hoveredLayerType).toBe("dynasty");
    });
  });

  describe("图层显隐 toggle", () => {
    it("toggleAdminBoundary 翻转", () => {
      expect(useMapStore.getState().adminBoundaryVisible).toBe(true);
      useMapStore.getState().toggleAdminBoundary();
      expect(useMapStore.getState().adminBoundaryVisible).toBe(false);
      useMapStore.getState().toggleAdminBoundary();
      expect(useMapStore.getState().adminBoundaryVisible).toBe(true);
    });

    it("toggleDynastyBoundary 翻转", () => {
      expect(useMapStore.getState().dynastyBoundaryVisible).toBe(true);
      useMapStore.getState().toggleDynastyBoundary();
      expect(useMapStore.getState().dynastyBoundaryVisible).toBe(false);
    });

    it("toggleEventMarkers 翻转", () => {
      expect(useMapStore.getState().eventMarkersVisible).toBe(true);
      useMapStore.getState().toggleEventMarkers();
      expect(useMapStore.getState().eventMarkersVisible).toBe(false);
    });
  });

  describe("setAdminBoundaryOpacity / setDynastyBoundaryOpacity (clamp 0-1)", () => {
    it("admin 区间内值直接写入", () => {
      useMapStore.getState().setAdminBoundaryOpacity(0.5);
      expect(useMapStore.getState().adminBoundaryOpacity).toBe(0.5);
    });

    it("admin 超过 1 → clamp 到 1", () => {
      useMapStore.getState().setAdminBoundaryOpacity(2);
      expect(useMapStore.getState().adminBoundaryOpacity).toBe(1);
    });

    it("admin 小于 0 → clamp 到 0", () => {
      useMapStore.getState().setAdminBoundaryOpacity(-0.5);
      expect(useMapStore.getState().adminBoundaryOpacity).toBe(0);
    });

    it("admin 边界值 0 / 1 不变", () => {
      useMapStore.getState().setAdminBoundaryOpacity(0);
      expect(useMapStore.getState().adminBoundaryOpacity).toBe(0);
      useMapStore.getState().setAdminBoundaryOpacity(1);
      expect(useMapStore.getState().adminBoundaryOpacity).toBe(1);
    });

    it("dynasty 同样有 clamp 行为", () => {
      useMapStore.getState().setDynastyBoundaryOpacity(0.65);
      expect(useMapStore.getState().dynastyBoundaryOpacity).toBe(0.65);

      useMapStore.getState().setDynastyBoundaryOpacity(5);
      expect(useMapStore.getState().dynastyBoundaryOpacity).toBe(1);

      useMapStore.getState().setDynastyBoundaryOpacity(-1);
      expect(useMapStore.getState().dynastyBoundaryOpacity).toBe(0);
    });
  });
});
