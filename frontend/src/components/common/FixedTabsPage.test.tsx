import { render, screen, fireEvent } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { FixedTabsPage } from './FixedTabsPage';

const renderWithRouter = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) =>
  render(ui, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    ...options,
  });

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
    renderWithRouter(<FixedTabsPage tabs={tabs} />);
    expect(screen.getByText('标签1')).toBeInTheDocument();
    expect(screen.getByText('标签2')).toBeInTheDocument();
  });

  it('should render first tab content by default', () => {
    renderWithRouter(<FixedTabsPage tabs={tabs} />);
    expect(screen.getByText('页面内容1')).toBeInTheDocument();
  });

  it('should switch content when tab is clicked', () => {
    renderWithRouter(<FixedTabsPage tabs={tabs} />);

    fireEvent.click(screen.getByText('标签2'));
    expect(screen.getByText('页面内容2')).toBeInTheDocument();
  });

  it('should call onTabChange callback', () => {
    const handleChange = vi.fn();
    renderWithRouter(<FixedTabsPage tabs={tabs} onTabChange={handleChange} />);

    fireEvent.click(screen.getByText('标签2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('defaultTab 优先于第一个 tab', () => {
    renderWithRouter(<FixedTabsPage tabs={tabs} defaultTab="tab2" />);
    expect(screen.getByText('页面内容2')).toBeInTheDocument();
    expect(screen.queryByText('页面内容1')).not.toBeInTheDocument();
  });

  it('tabs 变化导致当前 activeTab 失效时,自动落回第一个 tab', () => {
    const { rerender } = renderWithRouter(
      <FixedTabsPage tabs={tabs} defaultTab="tab2" />,
    );
    expect(screen.getByText('页面内容2')).toBeInTheDocument();

    rerender(<FixedTabsPage tabs={[tabs[0]!]} defaultTab="tab2" />);
    expect(screen.getByText('页面内容1')).toBeInTheDocument();
  });

  it('className 透传到根容器', () => {
    const { container } = renderWithRouter(
      <FixedTabsPage tabs={tabs} className="fixed-tabs" />,
    );
    expect(container.querySelector('.fixed-tabs')).not.toBeNull();
  });
});
