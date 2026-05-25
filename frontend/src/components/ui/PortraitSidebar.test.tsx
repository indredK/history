import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockState = vi.hoisted(() => ({
  isMobile: false,
  orientationType: 'landscape',
}));

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ screenWidth: 1024, isMobile: mockState.isMobile }),
  useOrientation: () => ({ type: mockState.orientationType }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('@/store', () => ({
  useThemeStore: () => ({ theme: 'light' }),
  useStyleStore: () => ({ style: 'default' }),
}));

vi.mock('@/config', () => ({
  navigationItems: [
    { key: 'home', path: '/', label: '首页', icon: '🏠' },
    { key: 'about', path: '/about', label: '关于', icon: 'ℹ️' },
  ],
}));

import { PortraitSidebar } from './PortraitSidebar';

describe('PortraitSidebar', () => {
  beforeEach(() => {
    mockState.isMobile = false;
    mockState.orientationType = 'landscape';
    mockNavigate.mockClear();
  });

  it('非 mobile 模式下不渲染(返回 null)', () => {
    mockState.isMobile = false;
    const { container } = render(<PortraitSidebar activeTab="home" />);
    expect(container.firstChild).toBeNull();
  });

  it('mobile + portrait 模式下渲染 sidebar', () => {
    mockState.isMobile = true;
    mockState.orientationType = 'portrait';
    const { container } = render(<PortraitSidebar activeTab="home" />);
    expect(container.querySelector('.portrait-sidebar')).not.toBeNull();
  });

  it('渲染所有 navigation items', () => {
    mockState.isMobile = true;
    mockState.orientationType = 'portrait';
    render(<PortraitSidebar activeTab="home" />);
    expect(screen.getByLabelText('首页')).toBeInTheDocument();
    expect(screen.getByLabelText('关于')).toBeInTheDocument();
  });

  it('点击导航项触发 navigate', () => {
    mockState.isMobile = true;
    mockState.orientationType = 'portrait';
    render(<PortraitSidebar activeTab="home" />);
    fireEvent.click(screen.getByLabelText('关于'));
    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });

  it('按 Enter 触发导航', () => {
    mockState.isMobile = true;
    mockState.orientationType = 'portrait';
    render(<PortraitSidebar activeTab="home" />);
    fireEvent.keyDown(screen.getByLabelText('关于'), { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });

  it('按空格触发导航', () => {
    mockState.isMobile = true;
    mockState.orientationType = 'portrait';
    render(<PortraitSidebar activeTab="home" />);
    fireEvent.keyDown(screen.getByLabelText('首页'), { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('glassEffect=false 时仍能渲染', () => {
    mockState.isMobile = true;
    mockState.orientationType = 'portrait';
    expect(() =>
      render(<PortraitSidebar activeTab="home" glassEffect={false} />),
    ).not.toThrow();
  });
});
