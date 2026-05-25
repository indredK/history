import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const setYears = vi.fn();

vi.mock('../../store', () => ({
  useTimelineStore: () => ({
    startYear: 1900,
    endYear: 2000,
    setYears,
  }),
}));

import { YearSettingsPopover } from './YearSettingsPopover';

describe('YearSettingsPopover', () => {
  beforeEach(() => {
    setYears.mockClear();
  });

  it('打开时显示标题"年份设置"', () => {
    render(
      <YearSettingsPopover
        anchorEl={document.createElement('button')}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('年份设置')).toBeInTheDocument();
  });

  it('显示开始年份 / 结束年份字段', () => {
    render(
      <YearSettingsPopover
        anchorEl={document.createElement('button')}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('开始年份')).toBeInTheDocument();
    expect(screen.getByText('结束年份')).toBeInTheDocument();
  });

  it('初始值取自 store(start=1900 / end=2000)', () => {
    render(
      <YearSettingsPopover
        anchorEl={document.createElement('button')}
        onClose={() => {}}
      />,
    );
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    expect(inputs[0]?.value).toBe('1900');
    expect(inputs[1]?.value).toBe('2000');
  });

  it('点击取消调用 onClose,但不调用 setYears', () => {
    const onClose = vi.fn();
    render(
      <YearSettingsPopover
        anchorEl={document.createElement('button')}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText('取消'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(setYears).not.toHaveBeenCalled();
  });

  it('修改年份后点击应用,触发 setYears 并 onClose', () => {
    const onClose = vi.fn();
    render(
      <YearSettingsPopover
        anchorEl={document.createElement('button')}
        onClose={onClose}
      />,
    );
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    fireEvent.change(inputs[0]!, { target: { value: '1800' } });
    fireEvent.change(inputs[1]!, { target: { value: '1900' } });
    fireEvent.click(screen.getByText('应用'));

    expect(setYears).toHaveBeenCalledWith(1800, 1900);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('anchorEl=null 时不打开 Popover(年份设置标题不可见)', () => {
    render(<YearSettingsPopover anchorEl={null} onClose={() => {}} />);
    expect(screen.queryByText('年份设置')).not.toBeInTheDocument();
  });
});
