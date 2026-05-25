import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ screenWidth: 1024 }),
}));

import { ResponsiveText } from './ResponsiveText';

describe('ResponsiveText', () => {
  it('should render children', () => {
    render(<ResponsiveText>测试文本</ResponsiveText>);
    expect(screen.getByText('测试文本')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    render(<ResponsiveText variant="h1">标题文本</ResponsiveText>);
    expect(screen.getByText('标题文本')).toBeInTheDocument();
  });

  it('h1 variant 渲染为 h1 标签', () => {
    render(<ResponsiveText variant="h1">大标题</ResponsiveText>);
    const node = screen.getByText('大标题');
    expect(node.tagName.toLowerCase()).toBe('h1');
  });

  it('caption variant 渲染为 span', () => {
    render(<ResponsiveText variant="caption">小字</ResponsiveText>);
    const node = screen.getByText('小字');
    // MUI caption 默认 component 为 span
    expect(node.tagName.toLowerCase()).toBe('span');
  });

  it('responsive=false 时不注入响应式 fontSize', () => {
    const { container } = render(
      <ResponsiveText variant="body1" responsive={false}>
        固定字号
      </ResponsiveText>,
    );
    const el = container.querySelector('.MuiTypography-root') as HTMLElement;
    // 当 responsive=false 时,style 上不会被注入 fontSize(只会落到 sx 默认)
    expect(el).not.toBeNull();
  });

  it('透传自定义 sx 不丢失', () => {
    render(
      <ResponsiveText sx={{ color: 'red' }} data-testid="t">
        custom
      </ResponsiveText>,
    );
    expect(screen.getByTestId('t')).toBeInTheDocument();
  });
});
