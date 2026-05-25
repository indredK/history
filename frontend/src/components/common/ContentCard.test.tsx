import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentCard } from './ContentCard';

describe('ContentCard', () => {
  const defaultProps = {
    title: '儒家思想',
    onClick: () => {},
  };

  it('should render title', () => {
    render(<ContentCard {...defaultProps} />);
    expect(screen.getByText('儒家思想')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(<ContentCard {...defaultProps} subtitle="孔子创立" />);
    expect(screen.getByText('孔子创立')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <ContentCard
        {...defaultProps}
        description="儒家思想是中国古代最有影响力的学派"
      />,
    );
    expect(
      screen.getByText('儒家思想是中国古代最有影响力的学派'),
    ).toBeInTheDocument();
  });

  it('should render primary tag when provided', () => {
    render(
      <ContentCard
        {...defaultProps}
        primaryTag={{
          label: '哲学',
          color: { bg: '#f00', text: '#fff' },
        }}
      />,
    );
    expect(screen.getByText('哲学')).toBeInTheDocument();
  });

  it('should render footer text when provided', () => {
    render(
      <ContentCard {...defaultProps} footerText="代表人物:孔子、孟子" />,
    );
    expect(screen.getByText('代表人物:孔子、孟子')).toBeInTheDocument();
  });

  it('点击触发 onClick', () => {
    const onClick = vi.fn();
    render(<ContentCard {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByText('儒家思想'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Enter 键触发 onClick (a11y)', () => {
    const onClick = vi.fn();
    render(<ContentCard {...defaultProps} onClick={onClick} />);
    const card = screen.getByRole('article', { name: '儒家思想' });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('空格键触发 onClick (a11y)', () => {
    const onClick = vi.fn();
    render(<ContentCard {...defaultProps} onClick={onClick} />);
    const card = screen.getByRole('article', { name: '儒家思想' });
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('其它键不触发 onClick', () => {
    const onClick = vi.fn();
    render(<ContentCard {...defaultProps} onClick={onClick} />);
    const card = screen.getByRole('article', { name: '儒家思想' });
    fireEvent.keyDown(card, { key: 'a' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('tagCloud 超过 tagCloudMax 时渲染 "+N"', () => {
    render(
      <ContentCard
        {...defaultProps}
        tagCloud={[
          { label: '仁' },
          { label: '义' },
          { label: '礼' },
          { label: '智' },
          { label: '信' },
          { label: '忠' },
          { label: '孝' },
        ]}
        tagCloudMax={3}
      />,
    );
    expect(screen.getByText('仁')).toBeInTheDocument();
    expect(screen.getByText('义')).toBeInTheDocument();
    expect(screen.getByText('礼')).toBeInTheDocument();
    // 7 - 3 = 4
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  it('icon 提供时渲染头像首字符', () => {
    render(
      <ContentCard
        {...defaultProps}
        icon={{ char: '儒', color: '#f00' }}
      />,
    );
    expect(screen.getByText('儒')).toBeInTheDocument();
  });
});
