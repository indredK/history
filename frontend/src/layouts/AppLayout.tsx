import { Suspense } from 'react';
import { Box } from '@mui/material';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PortraitSidebar } from '@/components/ui/PortraitSidebar';
import { Footer } from './Footer';
import { useDynastyStore } from '@/store';
import { useDynastyImage } from '@/hooks/useDynastyImage';
import { useSidebar, useResponsive, useOrientation } from '@/hooks';
import { routes } from '@/router/routes';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { dynastyUtils } from '@/config';

export function AppLayout() {
  const location = useLocation();
  const { selectedDynasty } = useDynastyStore();
  const { imageUrl: dynastyBackgroundUrl } = useDynastyImage(selectedDynasty?.id ?? null);
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } = useSidebar();
  const { isMobile, isSmallMobile } = useResponsive();
  const orientation = useOrientation();

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
  
  // 检查是否为竖屏模式
  const isPortrait = orientation.type.includes('portrait') || window.innerHeight > window.innerWidth;
  const showPortraitSidebar = isMobile && isPortrait;

  const dynastyColor = selectedDynasty?.color;
  const bgColor = dynastyUtils.getBackgroundColor(dynastyColor);
  const gradientBackground = dynastyUtils.getGradientBackground(dynastyColor);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', // 使用固定高度而不是minHeight
      overflow: 'hidden', // 确保不会出现页面滚动条
      position: 'relative', // 添加相对定位
      touchAction: 'none', // 防止触摸滚动
      overscrollBehavior: 'none', // 防止过度滚动
    }} className="app">
      {/* 主内容区域 */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden',
        position: 'relative', // 添加相对定位
        touchAction: 'pan-x pan-y', // 允许组件内部滚动
        // 竖屏模式下调整布局
        ...(showPortraitSidebar && {
          flexDirection: 'column',
          marginBottom: '120px', // 为底部导航栏区域预留空间
        })
      }}>
        {/* 桌面端和横屏模式的侧边栏 */}
        {!showPortraitSidebar && (
          <Sidebar 
            activeTab={activeTab} 
            collapsed={isMobile ? true : sidebarCollapsed} 
            onToggle={toggleSidebar}
          />
        )}
        
        <Box component="main" sx={{
          flex: 1,
          overflow: 'hidden',
          padding: isMobile ? (isSmallMobile ? '8px' : '12px') : '16px',
          marginTop: 0,
          background: selectedDynasty && dynastyBackgroundUrl ?
            `${gradientBackground},
            url(${dynastyBackgroundUrl}) no-repeat center center fixed,
            var(--color-bg-gradient)`
            : 'var(--color-bg-gradient)',
          backgroundSize: 'cover',
          transition: 'all 0.5s ease-in-out, background-color 0.5s ease-in-out',
          backgroundColor: selectedDynasty ? bgColor : 'transparent',
          touchAction: 'pan-x pan-y', // 允许内部滚动
          // 移动端优化
          ...(isMobile && {
            backgroundAttachment: 'scroll', // 移动端不支持 fixed
          }),
          // 竖屏模式下的特殊样式
          ...(showPortraitSidebar && {
            padding: '12px', // 统一内边距
            marginBottom: '20px', // 与导航栏区域的间隔
            borderRadius: '0 0 16px 16px', // 底部圆角
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // 添加阴影分离效果
          })
        }}>
          <div className="content" style={{ 
            height: '100%', 
            position: 'relative',
            overflow: 'hidden', // 确保内容容器不滚动
            touchAction: 'pan-x pan-y', // 允许内部滚动
          }}>
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
      
      {/* 竖屏模式的底部导航栏区域 */}
      {showPortraitSidebar && (
        <Box sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px', // 固定导航栏区域高度
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7))',
          backdropFilter: 'blur(20px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '20px', // 顶部间隔
          paddingBottom: 'env(safe-area-inset-bottom)', // 安全区域适配
        }}>
          <PortraitSidebar activeTab={activeTab} />
        </Box>
      )}
      
      {/* 桌面端和横屏模式的底部 */}
      {!showPortraitSidebar && !isMobile && <Footer />}
    </Box>
  );
}