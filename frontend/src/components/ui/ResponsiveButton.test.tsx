import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsiveButton } from './ResponsiveButton';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ screenWidth: 1024, isMobile: false }),
  useTouchDevice: () => false,
}));

describe('ResponsiveButton', () => {
  it('should render children', () => {
    render(<ResponsiveButton>点击这里</ResponsiveButton>);
    expect(screen.getByText('点击这里')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<ResponsiveButton onClick={handleClick}>点击</ResponsiveButton>);
    
    fireEvent.click(screen.getByText('点击'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with variant prop', () => {
    render(<ResponsiveButton variant="contained">contained按钮</ResponsiveButton>);
    expect(screen.getByText('contained按钮')).toBeInTheDocument();
  });

  it('should render disabled state', () => {
    render(<ResponsiveButton disabled>禁用按钮</ResponsiveButton>);
    expect(screen.getByText('禁用按钮')).toBeDisabled();
  });
});
