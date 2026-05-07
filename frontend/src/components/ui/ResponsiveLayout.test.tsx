import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ screenWidth: 1024 }),
}));

import { ResponsiveLayout } from './ResponsiveLayout';

describe('ResponsiveLayout', () => {
  it('should render children', () => {
    render(
      <ResponsiveLayout>
        <div>布局内容</div>
      </ResponsiveLayout>
    );
    expect(screen.getByText('布局内容')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <ResponsiveLayout>
        <div>内容1</div>
        <div>内容2</div>
      </ResponsiveLayout>
    );
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });
});
