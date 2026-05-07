import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    render(<ContentCard {...defaultProps} description="儒家思想是中国古代最有影响力的学派" />);
    expect(screen.getByText('儒家思想是中国古代最有影响力的学派')).toBeInTheDocument();
  });

  it('should render primary tag when provided', () => {
    render(
      <ContentCard
        {...defaultProps}
        primaryTag={{ label: '哲学', color: { bg: '#f00', text: '#fff' } }}
      />
    );
    expect(screen.getByText('哲学')).toBeInTheDocument();
  });

  it('should render footer text when provided', () => {
    render(<ContentCard {...defaultProps} footerText="代表人物：孔子、孟子" />);
    expect(screen.getByText('代表人物：孔子、孟子')).toBeInTheDocument();
  });
});
