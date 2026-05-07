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
});
