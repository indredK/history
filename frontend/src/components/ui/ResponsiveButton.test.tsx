import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsiveButton, ResponsiveIconButton } from './ResponsiveButton';

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
    render(
      <ResponsiveButton variant="contained">contained按钮</ResponsiveButton>,
    );
    expect(screen.getByText('contained按钮')).toBeInTheDocument();
  });

  it('should render disabled state', () => {
    render(<ResponsiveButton disabled>禁用按钮</ResponsiveButton>);
    expect(screen.getByText('禁用按钮')).toBeDisabled();
  });

  it('disabled 时点击不触发回调', () => {
    const handleClick = vi.fn();
    render(
      <ResponsiveButton disabled onClick={handleClick}>
        禁用
      </ResponsiveButton>,
    );
    fireEvent.click(screen.getByText('禁用'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('type=submit 透传到 button', () => {
    render(<ResponsiveButton type="submit">提交</ResponsiveButton>);
    const button = screen.getByText('提交').closest('button')!;
    expect(button.getAttribute('type')).toBe('submit');
  });
});

describe('ResponsiveIconButton', () => {
  it('渲染 children(icon 占位)', () => {
    render(
      <ResponsiveIconButton aria-label="close">
        <span>X</span>
      </ResponsiveIconButton>,
    );
    expect(screen.getByLabelText('close')).toBeInTheDocument();
  });

  it('点击触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <ResponsiveIconButton aria-label="close" onClick={onClick}>
        <span>X</span>
      </ResponsiveIconButton>,
    );
    fireEvent.click(screen.getByLabelText('close'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
