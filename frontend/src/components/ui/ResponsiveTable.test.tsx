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

import { ResponsiveTable, ResponsiveTableCell } from './ResponsiveTable';

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

  it('忽略未知 props 不抛错(MUI 透传)', () => {
    expect(() =>
      render(
        <ResponsiveTable data-testid="t" glassEffect={false}>
          <tbody>
            <tr><td>a</td></tr>
          </tbody>
        </ResponsiveTable>
      ),
    ).not.toThrow();
  });
});

describe('ResponsiveTableCell', () => {
  it('默认渲染 children', () => {
    render(
      <table>
        <tbody>
          <tr>
            <ResponsiveTableCell>正常单元格</ResponsiveTableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText('正常单元格')).toBeInTheDocument();
  });

  it('priority=low + isMobile(已 mock)时不会被自动隐藏(因为当前 mock 不是 mobile)', () => {
    render(
      <table>
        <tbody>
          <tr>
            <ResponsiveTableCell priority="low">桌面端 low</ResponsiveTableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText('桌面端 low')).toBeInTheDocument();
  });

  it('hideOnMobile=true 在桌面端仍然渲染', () => {
    render(
      <table>
        <tbody>
          <tr>
            <ResponsiveTableCell hideOnMobile>桌面可见</ResponsiveTableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText('桌面可见')).toBeInTheDocument();
  });
});
