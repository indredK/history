import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';

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
