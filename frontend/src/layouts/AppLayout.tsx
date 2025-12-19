import { Suspense, useState } from 'react';
import { Box } from '@mui/material';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useDynastyStore } from '@/store';
import { useDynastyImage } from '@/hooks/useDynastyImage';
import { routes } from '@/router/routes';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { dynastyUtils } from '@/config';

export function AppLayout() {
  const location = useLocation();
  const { selectedDynasty } = useDynastyStore();
  const { imageUrl: dynastyBackgroundUrl } = useDynastyImage(selectedDynasty?.id ?? null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 根据路径确定当前活跃的标签
  const getActiveTabFromPath = (pathname: string): string => {
    if (pathname === '/timeline') return 'timeline';
    if (pathname === '/dynasties') return 'dynasties';
    if (pathname === '/map') return 'map';
    if (pathname === '/people') return 'people';
    if (pathname === '/culture') return 'culture';
    if (pathname === '/mythology') return 'mythology';
    if (pathname === '/events') return 'events';
    return 'timeline';
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  const dynastyColor = selectedDynasty?.color;
  const bgColor = dynastyUtils.getBackgroundColor(dynastyColor);
  const gradientBackground = dynastyUtils.getGradientBackground(dynastyColor);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="app">
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeTab={activeTab} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <Box component="main" sx={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
          marginTop: 0,
          background: selectedDynasty && dynastyBackgroundUrl ?
            `${gradientBackground},
            url(${dynastyBackgroundUrl}) no-repeat center center fixed,
            var(--color-bg-gradient)`
            : 'var(--color-bg-gradient)',
          backgroundSize: 'cover',
          transition: 'all 0.5s ease-in-out, background-color 0.5s ease-in-out',
          backgroundColor: selectedDynasty ? bgColor : 'transparent',
        }}>
          <div className="content" style={{ height: '100%', position: 'relative' }}>
            <Suspense fallback={<LoadingSkeleton variant="page" />}>
              <Routes>
                {routes.map((route) => (
                  <Route
                    key={route.key}
                    path={route.path}
                    element={<route.component />}
                  />
                ))}
                {/* 默认重定向到时间轴 */}
                <Route path="*" element={<Navigate to="/timeline" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}