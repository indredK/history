import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    render(<PersonCard name="秦始皇" primaryTag={defaultProps.primaryTag} onClick={() => {}} />);
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
        secondaryTags={[{ label: '秦朝', color: { bg: '#f00', text: '#fff' } }]}
      />
    );
    expect(screen.getByText('秦朝')).toBeInTheDocument();
  });

  it('should render info lines', () => {
    render(
      <PersonCard
        {...defaultProps}
        infoLines={[{ label: '在位', value: '前247-前210年' }]}
      />
    );
    expect(screen.getByText(/在位/)).toBeInTheDocument();
    expect(screen.getByText(/前247-前210年/)).toBeInTheDocument();
  });
});
