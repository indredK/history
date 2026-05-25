import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabsContainer } from './TabsContainer';

describe('TabsContainer', () => {
  const tabs = [
    {
      value: 'tab1',
      label: '标签1',
      content: <div>内容1</div>,
    },
    {
      value: 'tab2',
      label: '标签2',
      content: <div>内容2</div>,
    },
  ];

  it('should render all tab labels', () => {
    render(<TabsContainer tabs={tabs} />);
    expect(screen.getByText('标签1')).toBeInTheDocument();
    expect(screen.getByText('标签2')).toBeInTheDocument();
  });

  it('should render first tab content by default', () => {
    render(<TabsContainer tabs={tabs} />);
    expect(screen.getByText('内容1')).toBeInTheDocument();
  });

  it('should switch content when tab is clicked', () => {
    render(<TabsContainer tabs={tabs} />);

    fireEvent.click(screen.getByText('标签2'));
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });

  it('should call onTabChange callback', () => {
    const handleChange = vi.fn();
    render(<TabsContainer tabs={tabs} onTabChange={handleChange} />);

    fireEvent.click(screen.getByText('标签2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('should use defaultTab if provided', () => {
    render(<TabsContainer tabs={tabs} defaultTab="tab2" />);
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });

  it('点击 tab1 不会再次触发回调(已经是 active)', () => {
    const handleChange = vi.fn();
    render(<TabsContainer tabs={tabs} onTabChange={handleChange} />);

    // 默认就在 tab1
    fireEvent.click(screen.getByText('标签1'));
    // MUI Tabs 在已选中 tab 上点击不会触发 onChange
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('切换 tab 后旧内容被卸载', () => {
    render(<TabsContainer tabs={tabs} />);
    expect(screen.getByText('内容1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('标签2'));
    expect(screen.queryByText('内容1')).not.toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });

  it('空 tabs 数组不抛错', () => {
    expect(() =>
      render(<TabsContainer tabs={[]} />),
    ).not.toThrow();
  });

  it('className 透传到根容器', () => {
    const { container } = render(
      <TabsContainer tabs={tabs} className="my-tabs" />,
    );
    expect(container.querySelector('.my-tabs')).not.toBeNull();
  });
});
