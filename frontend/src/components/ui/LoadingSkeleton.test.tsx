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
});
