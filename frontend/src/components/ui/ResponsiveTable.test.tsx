import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ screenWidth: 1024, isMobile: false }),
}));

import { ResponsiveTable } from './ResponsiveTable';

describe('ResponsiveTable', () => {
  it('should render children', () => {
    render(
      <ResponsiveTable>
        <table>
          <thead>
            <tr><th>标题</th></tr>
          </thead>
          <tbody>
            <tr><td>内容</td></tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );
    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByText('内容')).toBeInTheDocument();
  });
});
