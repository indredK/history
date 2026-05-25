/**
 * schoolStore 单元测试 (§2.8)
 *
 * 覆盖目标:
 * - 初始 state:schools=[] / selectedSchool=null / loading=false / error=null
 * - 全部 setters:setSchools / setSelectedSchool / setLoading / setError
 * - 清空语义:setSelectedSchool(null) / setError(null)
 */
import { describe, it, expect, beforeEach } from "vitest";
import type { PhilosophicalSchool } from "@/services/school/types";
import { useSchoolStore } from "./schoolStore";

function makeSchool(
  overrides: Partial<PhilosophicalSchool> = {},
): PhilosophicalSchool {
  return {
    id: overrides.id ?? "sch-1",
    name: overrides.name ?? "儒家",
    ...overrides,
  };
}

describe("schoolStore", () => {
  beforeEach(() => {
    useSchoolStore.setState({
      schools: [],
      selectedSchool: null,
      loading: false,
      error: null,
    });
  });

  describe("初始 state", () => {
    it("默认值齐全", () => {
      const s = useSchoolStore.getState();
      expect(s.schools).toEqual([]);
      expect(s.selectedSchool).toBeNull();
      expect(s.loading).toBe(false);
      expect(s.error).toBeNull();
    });
  });

  describe("setters", () => {
    it("setSchools / setSelectedSchool / setLoading / setError 全链路", () => {
      const list = [makeSchool({ id: "1" }), makeSchool({ id: "2" })];
      const one = list[0]!;
      useSchoolStore.getState().setSchools(list);
      useSchoolStore.getState().setSelectedSchool(one);
      useSchoolStore.getState().setLoading(true);
      useSchoolStore.getState().setError(new Error("oops"));

      const s = useSchoolStore.getState();
      expect(s.schools).toBe(list);
      expect(s.selectedSchool).toBe(one);
      expect(s.loading).toBe(true);
      expect(s.error?.message).toBe("oops");
    });

    it("setSelectedSchool(null) / setError(null) 清空", () => {
      useSchoolStore.setState({
        selectedSchool: makeSchool(),
        error: new Error("x"),
      });
      useSchoolStore.getState().setSelectedSchool(null);
      useSchoolStore.getState().setError(null);
      expect(useSchoolStore.getState().selectedSchool).toBeNull();
      expect(useSchoolStore.getState().error).toBeNull();
    });

    it("setLoading 反复切换", () => {
      useSchoolStore.getState().setLoading(true);
      expect(useSchoolStore.getState().loading).toBe(true);
      useSchoolStore.getState().setLoading(false);
      expect(useSchoolStore.getState().loading).toBe(false);
    });
  });
});
