import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { FixedTabsPage } from './FixedTabsPage';

describe('FixedTabsPage', () => {
  const tabs = [
    {
      value: 'tab1',
      label: '标签1',
      content: <div>页面内容1</div>,
    },
    {
      value: 'tab2',
      label: '标签2',
      content: <div>页面内容2</div>,
    },
  ];

  it('should render all tab labels', () => {
    render(<FixedTabsPage tabs={tabs} />);
    expect(screen.getByText('标签1')).toBeInTheDocument();
    expect(screen.getByText('标签2')).toBeInTheDocument();
  });

  it('should render first tab content by default', () => {
    render(<FixedTabsPage tabs={tabs} />);
    expect(screen.getByText('页面内容1')).toBeInTheDocument();
  });

  it('should switch content when tab is clicked', () => {
    render(<FixedTabsPage tabs={tabs} />);

    fireEvent.click(screen.getByText('标签2'));
    expect(screen.getByText('页面内容2')).toBeInTheDocument();
  });

  it('should call onTabChange callback', () => {
    const handleChange = vi.fn();
    render(<FixedTabsPage tabs={tabs} onTabChange={handleChange} />);

    fireEvent.click(screen.getByText('标签2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('defaultTab 优先于第一个 tab', () => {
    render(<FixedTabsPage tabs={tabs} defaultTab="tab2" />);
    expect(screen.getByText('页面内容2')).toBeInTheDocument();
    expect(screen.queryByText('页面内容1')).not.toBeInTheDocument();
  });

  it('tabs 变化导致当前 activeTab 失效时,自动落回第一个 tab', () => {
    const { rerender } = render(
      <FixedTabsPage tabs={tabs} defaultTab="tab2" />,
    );
    expect(screen.getByText('页面内容2')).toBeInTheDocument();

    // 把 tab2 移除,期望自动 fall back 到第一个 tab
    rerender(<FixedTabsPage tabs={[tabs[0]!]} defaultTab="tab2" />);
    expect(screen.getByText('页面内容1')).toBeInTheDocument();
  });

  it('className 透传到根容器', () => {
    const { container } = render(
      <FixedTabsPage tabs={tabs} className="fixed-tabs" />,
    );
    expect(container.querySelector('.fixed-tabs')).not.toBeNull();
  });
});
