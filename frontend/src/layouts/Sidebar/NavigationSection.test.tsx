/**
 * NavigationSection 单元测试 (§2.8)
 *
 * 渲染 6 个导航按钮(timeline/dynasties/map/people/culture/mythology)
 * 验证:
 *   - 6 个 label 都渲染
 *   - activeTab 决定 variant=contained 或 outlined
 *   - 点击按钮调 navigate(path)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NavigationSection } from "./NavigationSection";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("NavigationSection", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("渲染全部 6 个导航 label", () => {
    render(
      <MemoryRouter>
        <NavigationSection activeTab="timeline" />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /时间轴/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /历代纪元/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /地图/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /人物/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /文化/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /神话/ })).toBeInTheDocument();
  });

  it("点击 '人物' 调 navigate('/people')", () => {
    render(
      <MemoryRouter>
        <NavigationSection activeTab="timeline" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /人物/ }));
    expect(navigateMock).toHaveBeenCalledWith("/people");
  });

  it("点击 '地图' 调 navigate('/map')", () => {
    render(
      <MemoryRouter>
        <NavigationSection activeTab="timeline" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /地图/ }));
    expect(navigateMock).toHaveBeenCalledWith("/map");
  });

  it("activeTab='timeline' 时 timeline 走 contained variant(MuiButton-contained class)", () => {
    render(
      <MemoryRouter>
        <NavigationSection activeTab="timeline" />
      </MemoryRouter>,
    );
    const timelineBtn = screen.getByRole("button", { name: /时间轴/ });
    expect(timelineBtn.className).toMatch(/MuiButton-contained/);
    const peopleBtn = screen.getByRole("button", { name: /人物/ });
    expect(peopleBtn.className).toMatch(/MuiButton-outlined/);
  });

  it("activeTab='people' 时 people 走 contained,其他走 outlined", () => {
    render(
      <MemoryRouter>
        <NavigationSection activeTab="people" />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /人物/ }).className).toMatch(
      /MuiButton-contained/,
    );
    expect(screen.getByRole("button", { name: /时间轴/ }).className).toMatch(
      /MuiButton-outlined/,
    );
  });
});
