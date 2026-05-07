import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ screenWidth: 1024, isMobile: false }),
}));

import { MobileTableContainer } from './MobileTableContainer';

describe('MobileTableContainer', () => {
  it('should render children', () => {
    render(
      <MobileTableContainer>
        <table>
          <tbody>
            <tr><td>数据</td></tr>
          </tbody>
        </table>
      </MobileTableContainer>
    );
    expect(screen.getByText('数据')).toBeInTheDocument();
  });
});
