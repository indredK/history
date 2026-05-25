/**
 * FunctionPanel 单元测试 (§2.8)
 *
 * 极薄路由分发组件:按 activeTab 渲染对应的子 FunctionPanel。
 * 5 个 case + 1 个 default(返回 null)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("./", () => ({
  TimelineFunctions: () => <div data-testid="timeline-functions" />,
  DynastiesFunctions: () => <div data-testid="dynasties-functions" />,
  MapFunctions: () => <div data-testid="map-functions" />,
  PeopleFunctions: () => <div data-testid="people-functions" />,
  CultureFunctions: () => <div data-testid="culture-functions" />,
}));

// FunctionPanel.css 是空依赖,vitest 内会被 happy-dom 兜底处理

import { FunctionPanel } from "./FunctionPanel";

describe("FunctionPanel", () => {
  it("activeTab=timeline 渲染 TimelineFunctions", () => {
    render(<FunctionPanel activeTab="timeline" />);
    expect(screen.getByTestId("timeline-functions")).toBeInTheDocument();
  });
  it("activeTab=dynasties 渲染 DynastiesFunctions", () => {
    render(<FunctionPanel activeTab="dynasties" />);
    expect(screen.getByTestId("dynasties-functions")).toBeInTheDocument();
  });
  it("activeTab=map 渲染 MapFunctions", () => {
    render(<FunctionPanel activeTab="map" />);
    expect(screen.getByTestId("map-functions")).toBeInTheDocument();
  });
  it("activeTab=people 渲染 PeopleFunctions", () => {
    render(<FunctionPanel activeTab="people" />);
    expect(screen.getByTestId("people-functions")).toBeInTheDocument();
  });
  it("activeTab=culture 渲染 CultureFunctions", () => {
    render(<FunctionPanel activeTab="culture" />);
    expect(screen.getByTestId("culture-functions")).toBeInTheDocument();
  });
  it("未知 activeTab 走 default 不渲染子面板", () => {
    render(<FunctionPanel activeTab="unknown" />);
    expect(screen.queryByTestId("timeline-functions")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dynasties-functions")).not.toBeInTheDocument();
    expect(screen.queryByTestId("map-functions")).not.toBeInTheDocument();
    expect(screen.queryByTestId("people-functions")).not.toBeInTheDocument();
    expect(screen.queryByTestId("culture-functions")).not.toBeInTheDocument();
  });
});
