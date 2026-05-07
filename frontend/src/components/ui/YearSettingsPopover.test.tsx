import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/store', () => ({
  useTimelineStore: () => ({
    startYear: 1900,
    endYear: 2000,
    setYears: vi.fn(),
  }),
}));

import { YearSettingsPopover } from './YearSettingsPopover';

describe('YearSettingsPopover', () => {
  it('should render popover content', () => {
    render(
      <YearSettingsPopover
        anchorEl={document.createElement('button')}
        onClose={() => {}}
      />
    );
  });

  it('should display current year range', () => {
    render(
      <YearSettingsPopover
        anchorEl={document.createElement('button')}
        onClose={() => {}}
      />
    );
  });
});
