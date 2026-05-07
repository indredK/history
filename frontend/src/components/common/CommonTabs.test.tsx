import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommonTabs } from './CommonTabs';

describe('CommonTabs', () => {
  const tabs = [
    { value: 'sanguo', label: '三国' },
    { value: 'tang', label: '唐朝' },
    { value: 'song', label: '宋朝' },
  ];

  it('should render all tab labels', () => {
    render(
      <CommonTabs
        tabs={tabs}
        value="sanguo"
        onChange={() => {}}
      />
    );
    expect(screen.getByText('三国')).toBeInTheDocument();
    expect(screen.getByText('唐朝')).toBeInTheDocument();
    expect(screen.getByText('宋朝')).toBeInTheDocument();
  });

  it('should call onChange when tab is clicked', () => {
    const handleChange = vi.fn();
    render(
      <CommonTabs
        tabs={tabs}
        value="sanguo"
        onChange={handleChange}
      />
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
      />
    );
    const tabsElement = document.querySelector('[aria-label="历史朝代选择"]');
    expect(tabsElement).toBeInTheDocument();
  });
});
