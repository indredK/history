import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScrollContainer } from './ScrollContainer';

describe('ScrollContainer', () => {
  it('should render children', () => {
    render(
      <ScrollContainer>
        <div>滚动内容</div>
      </ScrollContainer>,
    );
    expect(screen.getByText('滚动内容')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <ScrollContainer>
        <div>内容1</div>
        <div>内容2</div>
        <div>内容3</div>
      </ScrollContainer>,
    );
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('内容2')).toBeInTheDocument();
    expect(screen.getByText('内容3')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ScrollContainer className="custom-scroll">
        <div>内容</div>
      </ScrollContainer>,
    );
    const container = screen.getByText('内容').parentElement;
    expect(container).toHaveClass('custom-scroll');
  });

  it('默认有 scroll-container class', () => {
    const { container } = render(
      <ScrollContainer>
        <div>x</div>
      </ScrollContainer>,
    );
    expect(container.querySelector('.scroll-container')).not.toBeNull();
  });

  it('滚动到底部时调用 onScrollEnd', () => {
    const onScrollEnd = vi.fn();
    render(
      <ScrollContainer onScrollEnd={onScrollEnd}>
        <div style={{ height: 5000 }}>很长的内容</div>
      </ScrollContainer>,
    );
    const root = document.querySelector('.scroll-container')!;
    // 模拟到达底部:scrollTop + clientHeight >= scrollHeight - 50
    Object.defineProperty(root, 'scrollTop', { configurable: true, value: 100 });
    Object.defineProperty(root, 'clientHeight', { configurable: true, value: 500 });
    Object.defineProperty(root, 'scrollHeight', { configurable: true, value: 600 });

    fireEvent.scroll(root);
    expect(onScrollEnd).toHaveBeenCalled();
  });

  it('未到底部时不调用 onScrollEnd', () => {
    const onScrollEnd = vi.fn();
    render(
      <ScrollContainer onScrollEnd={onScrollEnd}>
        <div style={{ height: 5000 }}>很长的内容</div>
      </ScrollContainer>,
    );
    const root = document.querySelector('.scroll-container')!;
    Object.defineProperty(root, 'scrollTop', { configurable: true, value: 100 });
    Object.defineProperty(root, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(root, 'scrollHeight', { configurable: true, value: 1000 });

    fireEvent.scroll(root);
    expect(onScrollEnd).not.toHaveBeenCalled();
  });
});
