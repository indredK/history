/**
 * CategoryTabs 单元测试 (§2.8)
 *
 * 组件在桌面 / 移动端走不同 UI:
 *   - 桌面端(useMediaQuery(theme.breakpoints.down('sm'))=false)→ <CommonTabs>
 *   - 移动端(matches=true)→ MUI <Select>
 *
 * 用 window.matchMedia 桩切换两条分支。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryTabs } from "./CategoryTabs";

/**
 * 桩 window.matchMedia,根据传入 query 控制 matches 值
 * - mobile=true → 任何 query 都 matches(假装是手机)
 * - mobile=false → 都不 matches(桌面)
 */
function stubMatchMedia(mobile: boolean) {
  const mock = vi.fn().mockImplementation((query: string) => ({
    matches: mobile,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: mock,
  });
  return mock;
}

describe("CategoryTabs", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  describe("桌面端(CommonTabs)", () => {
    beforeEach(() => {
      stubMatchMedia(false);
    });

    it("渲染 CommonTabs + 两个 tab 文本", () => {
      render(<CategoryTabs activeTab="mythology" onTabChange={() => {}} />);
      // CommonTabs 用 MUI Tabs(role=tablist),aria-label 由 CategoryTabs 传入
      expect(
        screen.getByRole("tablist", { name: "神话页面视图切换" }),
      ).toBeInTheDocument();
      expect(screen.getByText("神话故事")).toBeInTheDocument();
      expect(screen.getByText("宗教关系")).toBeInTheDocument();
    });

    it("点击 '宗教关系' 触发 onTabChange('religion')", () => {
      const onTabChange = vi.fn();
      render(<CategoryTabs activeTab="mythology" onTabChange={onTabChange} />);
      fireEvent.click(screen.getByRole("tab", { name: /宗教关系/ }));
      expect(onTabChange).toHaveBeenCalledWith("religion");
    });

    it("activeTab='mythology' 时该 tab aria-selected=true", () => {
      render(<CategoryTabs activeTab="mythology" onTabChange={() => {}} />);
      const myth = screen.getByRole("tab", { name: /神话故事/ });
      const religion = screen.getByRole("tab", { name: /宗教关系/ });
      expect(myth).toHaveAttribute("aria-selected", "true");
      expect(religion).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("移动端(Select 下拉)", () => {
    beforeEach(() => {
      stubMatchMedia(true);
    });

    it("渲染 MUI Select(combobox)且当前值是 activeTab", () => {
      render(<CategoryTabs activeTab="religion" onTabChange={() => {}} />);
      // MUI Select 在 happy-dom 渲染成 [role=combobox]
      const combo = screen.getByRole("combobox");
      expect(combo).toBeInTheDocument();
      // selected value 渲染在 trigger 内的文本节点(显示 label '宗教关系')
      expect(combo.textContent).toContain("宗教关系");
    });
  });
});
