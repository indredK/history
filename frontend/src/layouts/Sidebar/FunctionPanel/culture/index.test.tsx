/**
 * CultureFunctions 单元测试 (§2.8)
 *
 * 与 PeopleFunctions 结构相同:2 个独立 popover(文化类型/时期筛选)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

let cultureClose: (() => void) | null = null;
let periodClose: (() => void) | null = null;

vi.mock("./CultureTypePopover", () => ({
  CultureTypePopover: ({
    anchorEl,
    onClose,
  }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
  }) => {
    cultureClose = onClose;
    return (
      <div data-testid="culture-pop" data-open={anchorEl ? "true" : "false"} />
    );
  },
}));

vi.mock("./PeriodFilterPopover", () => ({
  PeriodFilterPopover: ({
    anchorEl,
    onClose,
  }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
  }) => {
    periodClose = onClose;
    return (
      <div data-testid="period-pop" data-open={anchorEl ? "true" : "false"} />
    );
  },
}));

import { CultureFunctions } from "./index";

describe("CultureFunctions", () => {
  it("初始两个 popover 都关闭", () => {
    render(<CultureFunctions />);
    expect(screen.getByTestId("culture-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
    expect(screen.getByTestId("period-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("点击 '文化类型' 只打开 culture popover", () => {
    render(<CultureFunctions />);
    fireEvent.click(screen.getByRole("button", { name: /文化类型/ }));
    expect(screen.getByTestId("culture-pop")).toHaveAttribute(
      "data-open",
      "true",
    );
    expect(screen.getByTestId("period-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("点击 '时期筛选' 只打开 period popover", () => {
    render(<CultureFunctions />);
    fireEvent.click(screen.getByRole("button", { name: /时期筛选/ }));
    expect(screen.getByTestId("culture-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
    expect(screen.getByTestId("period-pop")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("调 onClose 关闭对应 popover,另一个独立", () => {
    render(<CultureFunctions />);
    fireEvent.click(screen.getByRole("button", { name: /文化类型/ }));
    fireEvent.click(screen.getByRole("button", { name: /时期筛选/ }));
    act(() => {
      cultureClose?.();
    });
    expect(screen.getByTestId("culture-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
    expect(screen.getByTestId("period-pop")).toHaveAttribute(
      "data-open",
      "true",
    );
    act(() => {
      periodClose?.();
    });
    expect(screen.getByTestId("period-pop")).toHaveAttribute(
      "data-open",
      "false",
    );
  });
});
