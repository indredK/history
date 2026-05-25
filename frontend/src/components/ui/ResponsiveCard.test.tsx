import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({
    screenWidth: 1024,
    isMobile: false,
    isSmallMobile: false,
  }),
}));

vi.mock('@/hooks/useGlassStyle', () => ({
  useComponentGlassStyle: () => ({
    style: {
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255,255,255,0.8)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.2s',
    },
    hoverStyle: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    },
  }),
}));

vi.mock('@/config/responsive', () => ({
  getCardStyles: () => ({
    padding: '16px',
    borderRadius: '8px',
    margin: '8px',
  }),
}));

import {
  ResponsiveCard,
  ResponsiveCardContent,
  ResponsiveCardActions,
  ResponsiveCardHeader,
} from './ResponsiveCard';

describe('ResponsiveCard', () => {
  it('should render children', () => {
    render(
      <ResponsiveCard glassEffect={false}>
        <div>卡片内容</div>
      </ResponsiveCard>,
    );
    expect(screen.getByText('卡片内容')).toBeInTheDocument();
  });

  it('鼠标进入/离开切换 hover state(无异常)', () => {
    const { container } = render(
      <ResponsiveCard>
        <div>x</div>
      </ResponsiveCard>,
    );
    const card = container.querySelector('.MuiCard-root')!;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    expect(screen.getByText('x')).toBeInTheDocument();
  });
});

describe('ResponsiveCardContent', () => {
  it('渲染 children', () => {
    render(
      <ResponsiveCardContent>
        <div>content</div>
      </ResponsiveCardContent>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('disablePadding 不抛错', () => {
    expect(() =>
      render(
        <ResponsiveCardContent disablePadding>
          <div>p0</div>
        </ResponsiveCardContent>,
      ),
    ).not.toThrow();
  });
});

describe('ResponsiveCardActions', () => {
  it.each(['compact', 'normal', 'comfortable'] as const)(
    'spacing=%s 渲染正常',
    (spacing) => {
      render(
        <ResponsiveCardActions spacing={spacing}>
          <button>a</button>
        </ResponsiveCardActions>,
      );
      expect(screen.getByText('a')).toBeInTheDocument();
    },
  );
});

describe('ResponsiveCardHeader', () => {
  it('渲染 title 和 subheader', () => {
    render(
      <ResponsiveCardHeader
        title={<span>主标题</span>}
        subheader={<span>副标题</span>}
      />,
    );
    expect(screen.getByText('主标题')).toBeInTheDocument();
    expect(screen.getByText('副标题')).toBeInTheDocument();
  });
});
