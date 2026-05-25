import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Star } from '@mui/icons-material';
import { CommonTabs } from './CommonTabs';

describe('CommonTabs', () => {
  const tabs = [
    { value: 'sanguo', label: '三国' },
    { value: 'tang', label: '唐朝' },
    { value: 'song', label: '宋朝' },
  ];

  it('should render all tab labels', () => {
    render(
      <CommonTabs tabs={tabs} value="sanguo" onChange={() => {}} />,
    );
    expect(screen.getByText('三国')).toBeInTheDocument();
    expect(screen.getByText('唐朝')).toBeInTheDocument();
    expect(screen.getByText('宋朝')).toBeInTheDocument();
  });

  it('should call onChange when tab is clicked', () => {
    const handleChange = vi.fn();
    render(
      <CommonTabs tabs={tabs} value="sanguo" onChange={handleChange} />,
    );

    fireEvent.click(screen.getByText('唐朝'));
    expect(handleChange).toHaveBeenCalledWith('tang');
  });

  it('should render with custom aria-label', () => {
    render(
      <CommonTabs
        tabs={tabs}
        value="sanguo"
        onChange={() => {}}
        ariaLabel="历史朝代选择"
      />,
    );
    const tabsElement = document.querySelector(
      '[aria-label="历史朝代选择"]',
    );
    expect(tabsElement).toBeInTheDocument();
  });

  it('选中的 tab 带 Mui-selected', () => {
    render(
      <CommonTabs tabs={tabs} value="tang" onChange={() => {}} />,
    );
    const tangTab = screen.getByText('唐朝').closest('.MuiTab-root');
    expect(tangTab?.className).toMatch(/Mui-selected/);
  });

  it('未选中的 tab 不带 Mui-selected', () => {
    render(
      <CommonTabs tabs={tabs} value="tang" onChange={() => {}} />,
    );
    const songTab = screen.getByText('宋朝').closest('.MuiTab-root');
    expect(songTab?.className).not.toMatch(/Mui-selected/);
  });

  it('支持带 icon 的 tab', () => {
    const tabsWithIcon = [
      { value: 'a', label: '甲', icon: <Star data-testid="star" /> },
      { value: 'b', label: '乙' },
    ];
    render(
      <CommonTabs
        tabs={tabsWithIcon}
        value="a"
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId('star')).toBeInTheDocument();
  });

  it('点击已选中 tab 不重复触发 onChange (MUI 行为)', () => {
    const handleChange = vi.fn();
    render(
      <CommonTabs tabs={tabs} value="sanguo" onChange={handleChange} />,
    );
    fireEvent.click(screen.getByText('三国'));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
