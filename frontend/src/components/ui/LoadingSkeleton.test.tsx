import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render skeleton component', () => {
    render(<LoadingSkeleton count={3} />);

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render circular progress for page variant', () => {
    render(<LoadingSkeleton variant="page" />);

    const progress = document.querySelector('.MuiCircularProgress-root');
    expect(progress).toBeInTheDocument();
  });

  it('should render with default props', () => {
    render(<LoadingSkeleton />);

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('count 决定卡片数量,每个卡片渲染至少 1 个 skeleton', () => {
    const { container } = render(<LoadingSkeleton count={4} />);
    // 每张卡片里 5 个 Skeleton(circular + text x3 + rectangular),
    // 这里只确认总数与 count 正相关
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it('page variant 不渲染 Skeleton 卡片', () => {
    const { container } = render(<LoadingSkeleton variant="page" />);
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBe(0);
    expect(
      container.querySelectorAll('.MuiCircularProgress-root').length,
    ).toBe(1);
  });

  it('count=0 时不渲染任何 skeleton 卡片', () => {
    const { container } = render(<LoadingSkeleton count={0} />);
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBe(0);
  });
});
