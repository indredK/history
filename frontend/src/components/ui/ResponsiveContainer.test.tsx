import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ screenWidth: 1024, isMobile: false, isSmallMobile: false }),
}));

import { ResponsiveContainer } from './ResponsiveContainer';

describe('ResponsiveContainer', () => {
  it('should render children', () => {
    render(
      <ResponsiveContainer>
        <div>容器内容</div>
      </ResponsiveContainer>
    );
    expect(screen.getByText('容器内容')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <ResponsiveContainer>
        <div>内容1</div>
        <div>内容2</div>
      </ResponsiveContainer>
    );
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });
});
