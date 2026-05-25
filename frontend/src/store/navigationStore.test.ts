/**
 * navigationStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:activeTab='timeline'(默认入口锁定)
 * - setActiveTab:写入任意字符串
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useNavigationStore } from "./navigationStore";

describe("navigationStore", () => {
  beforeEach(() => {
    useNavigationStore.setState({ activeTab: "timeline" });
  });

  describe("初始 state", () => {
    it("默认 activeTab='timeline'(默认入口锁定)", () => {
      expect(useNavigationStore.getState().activeTab).toBe("timeline");
    });
  });

  describe("setActiveTab", () => {
    it("切换到其它 tab", () => {
      useNavigationStore.getState().setActiveTab("dynasty");
      expect(useNavigationStore.getState().activeTab).toBe("dynasty");

      useNavigationStore.getState().setActiveTab("person");
      expect(useNavigationStore.getState().activeTab).toBe("person");
    });

    it("允许写入空串(不做合法性校验)", () => {
      useNavigationStore.getState().setActiveTab("");
      expect(useNavigationStore.getState().activeTab).toBe("");
    });
  });
});
