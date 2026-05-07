import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('../../hooks/useHoverScroll', () => ({
  useHoverScroll: () => ({}),
}));

import { HoverScrollContainer } from './HoverScrollContainer';

describe('HoverScrollContainer', () => {
  it('should render children', () => {
    render(
      <HoverScrollContainer>
        <div>悬停滚动内容</div>
      </HoverScrollContainer>
    );
    expect(screen.getByText('悬停滚动内容')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <HoverScrollContainer>
        <div>内容1</div>
        <div>内容2</div>
      </HoverScrollContainer>
    );
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
  });
});
