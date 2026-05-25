import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createRef } from 'react';

vi.mock('../../hooks/useHoverScroll', () => ({
  useHoverScroll: () => ({
    scrollToTop: vi.fn(),
    scrollToBottom: vi.fn(),
  }),
}));

import {
  HoverScrollContainer,
  type HoverScrollContainerRef,
} from './HoverScrollContainer';

describe('HoverScrollContainer', () => {
  it('should render children', () => {
    render(
      <HoverScrollContainer>
        <div>悬停滚动内容</div>
      </HoverScrollContainer>,
    );
    expect(screen.getByText('悬停滚动内容')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <HoverScrollContainer>
        <div>内容1</div>
        <div>内容2</div>
      </HoverScrollContainer>,
    );
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });

  it('应用默认 className "hover-scroll-container"', () => {
    const { container } = render(
      <HoverScrollContainer>
        <span>x</span>
      </HoverScrollContainer>,
    );
    expect(
      container.querySelector('.hover-scroll-container'),
    ).not.toBeNull();
  });

  it('合并自定义 containerClassName', () => {
    const { container } = render(
      <HoverScrollContainer containerClassName="my-extra">
        <span>x</span>
      </HoverScrollContainer>,
    );
    const root = container.querySelector('.hover-scroll-container');
    expect(root?.className).toMatch(/my-extra/);
  });

  it('forwardRef 暴露 containerElement', () => {
    const ref = createRef<HoverScrollContainerRef>();
    render(
      <HoverScrollContainer ref={ref}>
        <span data-testid="x">x</span>
      </HoverScrollContainer>,
    );
    expect(ref.current?.containerElement).toBeInstanceOf(HTMLDivElement);
  });

  it('未知 HTML 属性透传到容器(data-* / aria-*)', () => {
    const { container } = render(
      <HoverScrollContainer data-testid="root" aria-label="滚动区">
        <span>x</span>
      </HoverScrollContainer>,
    );
    const root = container.querySelector('[data-testid="root"]');
    expect(root?.getAttribute('aria-label')).toBe('滚动区');
  });
});
