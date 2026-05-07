import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ screenWidth: 1024, isMobile: false }),
}));

vi.mock('@/hooks/useGlassStyle', () => ({
  useComponentGlassStyle: () => ({
    glassStyle: {
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255,255,255,0.8)',
    },
  }),
}));

vi.mock('@/config/responsive', () => ({
  getCardStyles: () => ({}),
}));

import { ResponsiveCard } from './ResponsiveCard';

describe('ResponsiveCard', () => {
  it('should render children', () => {
    render(
      <ResponsiveCard glassEffect={false}>
        <div>卡片内容</div>
      </ResponsiveCard>
    );
    expect(screen.getByText('卡片内容')).toBeInTheDocument();
  });
});
