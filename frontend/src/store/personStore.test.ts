/**
 * personStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:persons=[] / selectedPersonId=null / searchQuery=''
 * - setters:setPersons / setSelectedPersonId(含 null 清空)/ setSearchQuery
 */
import { describe, it, expect, beforeEach } from "vitest";
import type { CommonPerson } from "@/services/person/common/types";
import { usePersonStore } from "./personStore";

function makePerson(overrides: Partial<CommonPerson> = {}): CommonPerson {
  return {
    id: overrides.id ?? "p-1",
    name: overrides.name ?? "孔子",
    ...overrides,
  };
}

describe("personStore", () => {
  beforeEach(() => {
    usePersonStore.setState({
      persons: [],
      selectedPersonId: null,
      searchQuery: "",
    });
  });

  describe("初始 state", () => {
    it("默认值齐全", () => {
      const s = usePersonStore.getState();
      expect(s.persons).toEqual([]);
      expect(s.selectedPersonId).toBeNull();
      expect(s.searchQuery).toBe("");
    });
  });

  describe("setters", () => {
    it("setPersons 写入数组(同一引用)", () => {
      const list = [makePerson({ id: "1" }), makePerson({ id: "2" })];
      usePersonStore.getState().setPersons(list);
      expect(usePersonStore.getState().persons).toBe(list);
    });

    it("setSelectedPersonId 写入 / null 清空", () => {
      usePersonStore.getState().setSelectedPersonId("p-42");
      expect(usePersonStore.getState().selectedPersonId).toBe("p-42");

      usePersonStore.getState().setSelectedPersonId(null);
      expect(usePersonStore.getState().selectedPersonId).toBeNull();
    });

    it("setSearchQuery 写入字符串(含空串)", () => {
      usePersonStore.getState().setSearchQuery("孔");
      expect(usePersonStore.getState().searchQuery).toBe("孔");

      usePersonStore.getState().setSearchQuery("");
      expect(usePersonStore.getState().searchQuery).toBe("");
    });
  });
});
