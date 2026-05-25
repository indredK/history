/**
 * NotFoundPage 单元测试 (§2.7)
 *
 * 路径无效时显示 404 + 当前路径回显 + 两种出口:
 *   - "返回上一页":若 history.length > 1 则 navigate(-1),否则 navigate('/timeline', { replace })
 *   - "回到时间轴":直接 navigate('/timeline', { replace })
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

describe("NotFoundPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("渲染 404 大字 + 走丢标题 + 路径回显", () => {
    renderAt("/some/missing/path");
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("页面走丢了")).toBeInTheDocument();
    expect(screen.getByText("/some/missing/path")).toBeInTheDocument();
  });

  it("点击 '回到时间轴' 调 navigate('/timeline', { replace: true })", () => {
    renderAt("/missing");
    fireEvent.click(screen.getByRole("button", { name: "回到时间轴" }));
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/timeline", { replace: true });
  });

  it("history.length > 1 时 '返回上一页' 调 navigate(-1)", () => {
    const originalLength = window.history.length;
    // happy-dom 下 length 是只读 getter,用 Object.defineProperty 覆盖
    Object.defineProperty(window.history, "length", {
      configurable: true,
      get: () => 5,
    });
    try {
      renderAt("/missing");
      fireEvent.click(screen.getByRole("button", { name: "返回上一页" }));
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith(-1);
    } finally {
      Object.defineProperty(window.history, "length", {
        configurable: true,
        get: () => originalLength,
      });
    }
  });

  it("history.length <= 1 时 '返回上一页' 兜底跳 '/timeline'", () => {
    const originalLength = window.history.length;
    Object.defineProperty(window.history, "length", {
      configurable: true,
      get: () => 1,
    });
    try {
      renderAt("/missing");
      fireEvent.click(screen.getByRole("button", { name: "返回上一页" }));
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith("/timeline", { replace: true });
    } finally {
      Object.defineProperty(window.history, "length", {
        configurable: true,
        get: () => originalLength,
      });
    }
  });
});
