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
});
