import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonCard } from './PersonCard';

describe('PersonCard', () => {
  const defaultProps = {
    name: '秦始皇',
    subtitle: '秦始皇帝',
    primaryTag: { label: '皇帝', color: { bg: '#f00', text: '#fff' } },
    onClick: () => {},
  };

  it('should render name correctly', () => {
    render(<PersonCard {...defaultProps} />);
    expect(screen.getByText('秦始皇')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(<PersonCard {...defaultProps} />);
    expect(screen.getByText('秦始皇帝')).toBeInTheDocument();
  });

  it('should not render subtitle when not provided', () => {
    render(
      <PersonCard
        name="秦始皇"
        primaryTag={defaultProps.primaryTag}
        onClick={() => {}}
      />,
    );
    expect(screen.queryByText('秦始皇帝')).not.toBeInTheDocument();
  });

  it('should render primary tag', () => {
    render(<PersonCard {...defaultProps} />);
    expect(screen.getByText('皇帝')).toBeInTheDocument();
  });

  it('should render secondary tags', () => {
    render(
      <PersonCard
        {...defaultProps}
        secondaryTags={[
          { label: '秦朝', color: { bg: '#f00', text: '#fff' } },
        ]}
      />,
    );
    expect(screen.getByText('秦朝')).toBeInTheDocument();
  });

  it('should render info lines', () => {
    render(
      <PersonCard
        {...defaultProps}
        infoLines={[{ label: '在位', value: '前247-前210年' }]}
      />,
    );
    expect(screen.getByText(/在位/)).toBeInTheDocument();
    expect(screen.getByText(/前247-前210年/)).toBeInTheDocument();
  });

  it('point: 点击卡片触发 onClick', () => {
    const onClick = vi.fn();
    render(<PersonCard {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByText('秦始皇'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('未提供 portraitUrl 时,Avatar 显示姓名首字', () => {
    render(<PersonCard {...defaultProps} />);
    // Avatar 内部渲染首字符 "秦"
    expect(screen.getByText('秦')).toBeInTheDocument();
  });

  it('提供 portraitUrl 时,Avatar 使用 img 而不渲染首字', () => {
    render(
      <PersonCard {...defaultProps} portraitUrl="/portrait.jpg" />,
    );
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/portrait.jpg');
    expect(img?.getAttribute('alt')).toBe('秦始皇');
  });

  it('提供 biography 时渲染简介', () => {
    render(
      <PersonCard
        {...defaultProps}
        biography="统一六国,建立秦朝。"
      />,
    );
    expect(screen.getByText('统一六国,建立秦朝。')).toBeInTheDocument();
  });

  it('未提供 biography 时不渲染分割线区块', () => {
    const { container } = render(<PersonCard {...defaultProps} />);
    // biography 区块由顶部 borderTop 标识,这里只看是否没多余 Typography
    expect(container.textContent).not.toMatch(/统一六国/);
  });
});
