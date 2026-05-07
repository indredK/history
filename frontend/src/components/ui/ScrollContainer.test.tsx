import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollContainer } from './ScrollContainer';

describe('ScrollContainer', () => {
  it('should render children', () => {
    render(
      <ScrollContainer>
        <div>滚动内容</div>
      </ScrollContainer>
    );
    expect(screen.getByText('滚动内容')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <ScrollContainer>
        <div>内容1</div>
        <div>内容2</div>
        <div>内容3</div>
      </ScrollContainer>
    );
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
    expect(screen.getByText('内容3')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ScrollContainer className="custom-scroll">
        <div>内容</div>
      </ScrollContainer>
    );
    const container = screen.getByText('内容').parentElement;
    expect(container).toHaveClass('custom-scroll');
  });
});
