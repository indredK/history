import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({
    screenWidth: 1024,
    isMobile: false,
    isTablet: false,
  }),
}));

import {
  ResponsiveLayout,
  ResponsiveGrid,
  ResponsiveStack,
} from './ResponsiveLayout';

describe('ResponsiveLayout', () => {
  it('should render children', () => {
    render(
      <ResponsiveLayout>
        <div>布局内容</div>
      </ResponsiveLayout>,
    );
    expect(screen.getByText('布局内容')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <ResponsiveLayout>
        <div>内容1</div>
        <div>内容2</div>
      </ResponsiveLayout>,
    );
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });

  it.each(['row', 'column', 'responsive'] as const)(
    'direction=%s 渲染不抛错',
    (direction) => {
      expect(() =>
        render(
          <ResponsiveLayout direction={direction}>
            <div>x</div>
          </ResponsiveLayout>,
        ),
      ).not.toThrow();
    },
  );

  it('glassEffect=true 不抛错', () => {
    expect(() =>
      render(
        <ResponsiveLayout glassEffect>
          <div>x</div>
        </ResponsiveLayout>,
      ),
    ).not.toThrow();
  });
});

describe('ResponsiveGrid', () => {
  it('渲染 children 并应用 grid 布局', () => {
    const { container } = render(
      <ResponsiveGrid desktopColumns={3}>
        <div>a</div>
        <div>b</div>
        <div>c</div>
      </ResponsiveGrid>,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();
    // root 是一个 Box,只校验它存在
    expect(container.firstChild).not.toBeNull();
  });
});

describe('ResponsiveStack', () => {
  it('渲染 children', () => {
    render(
      <ResponsiveStack>
        <div>s1</div>
        <div>s2</div>
      </ResponsiveStack>,
    );
    expect(screen.getByText('s1')).toBeInTheDocument();
    expect(screen.getByText('s2')).toBeInTheDocument();
  });
});
