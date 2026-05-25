import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({
    screenWidth: 1024,
    isMobile: false,
    isSmallMobile: false,
  }),
}));

import { MobileTableContainer } from './MobileTableContainer';

describe('MobileTableContainer', () => {
  it('should render children', () => {
    render(
      <MobileTableContainer>
        <table>
          <tbody>
            <tr>
              <td>数据</td>
            </tr>
          </tbody>
        </table>
      </MobileTableContainer>,
    );
    expect(screen.getByText('数据')).toBeInTheDocument();
  });

  it('桌面端(isMobile=false)不渲染"左右滑动查看更多"提示', () => {
    render(
      <MobileTableContainer>
        <div>x</div>
      </MobileTableContainer>,
    );
    expect(screen.queryByText('左右滑动查看更多')).not.toBeInTheDocument();
  });

  it('透传 className 到根容器', () => {
    const { container } = render(
      <MobileTableContainer className="my-table">
        <div>x</div>
      </MobileTableContainer>,
    );
    expect(container.querySelector('.my-table')).not.toBeNull();
  });
});
