import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ screenWidth: 1024, isMobile: false }),
  useOrientation: () => ({ type: 'portrait' }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('@/store', () => ({
  useThemeStore: () => ({ theme: 'light' }),
  useStyleStore: () => ({ style: 'default' }),
}));

vi.mock('@/config', () => ({
  navigationItems: [],
}));

import { PortraitSidebar } from './PortraitSidebar';

describe('PortraitSidebar', () => {
  it('should render without crashing', () => {
    render(<PortraitSidebar activeTab="home" />);
  });
});
