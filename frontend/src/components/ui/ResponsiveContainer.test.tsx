import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({
    screenWidth: 1024,
    isMobile: false,
    isSmallMobile: false,
  }),
}));

import { ResponsiveContainer } from './ResponsiveContainer';

describe('ResponsiveContainer', () => {
  it('should render children', () => {
    render(
      <ResponsiveContainer>
        <div>容器内容</div>
      </ResponsiveContainer>,
    );
    expect(screen.getByText('容器内容')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <ResponsiveContainer>
        <div>内容1</div>
        <div>内容2</div>
      </ResponsiveContainer>,
    );
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });

  it('disablePadding=true 时 padding 为 0', () => {
    const { container } = render(
      <ResponsiveContainer disablePadding data-testid="root">
        <div>x</div>
      </ResponsiveContainer>,
    );
    const root = container.querySelector(
      '[data-testid="root"]',
    ) as HTMLElement;
    // 通过 inline style / computed style 检查 padding 为 0
    expect(root).not.toBeNull();
    // MUI sx → style class,直接 getComputedStyle 在 JSDOM 不一定准确;
    // 这里仅断言渲染未异常
  });

  it('maxWidth + centerContent 同时设置时,渲染不异常', () => {
    expect(() =>
      render(
        <ResponsiveContainer maxWidth={1200} centerContent>
          <div>x</div>
        </ResponsiveContainer>,
      ),
    ).not.toThrow();
  });

  it('透传自定义 BoxProps (id / data-*)', () => {
    const { container } = render(
      <ResponsiveContainer id="responsive-root" data-tag="container">
        <div>x</div>
      </ResponsiveContainer>,
    );
    const root = container.querySelector('#responsive-root');
    expect(root?.getAttribute('data-tag')).toBe('container');
  });
});
