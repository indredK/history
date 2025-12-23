import { Suspense, useEffect } from 'react';
import { Box } from '@mui/material';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PortraitSidebar } from '@/components/ui/PortraitSidebar';
import { Footer } from './Footer';
import { DataSourceIndicator } from '@/components/DataSourceIndicator';
import { useThemeStore, useStyleStore } from '@/store';
import { useSidebar, useResponsive, useOrientation } from '@/hooks';
import { routes } from '@/router/routes';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { getGlassConfig } from '@/config/glassConfig';

export function AppLayout() {
  const location = useLocation();
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } = useSidebar();
  const { isMobile, isSmallMobile, screenWidth } = useResponsive();
  const orientation = useOrientation();
  const { theme, initializeTheme } = useThemeStore();
  const { style, initializeStyle } = useStyleStore();

  // 初始化主题和样式
  useEffect(() => {
    initializeTheme();
    initializeStyle();
  }, [initializeTheme, initializeStyle]);

  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);
  
  // 检查是否为经典样式模式
  const isClassicStyle = style === 'classic';
  
  // 根据主题获取背景色
  const isDark = theme === 'dark';
  const bgBase = isDark ? '30, 30, 30' : '255, 255, 255';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';

  // 根据路径确定当前活跃的标签
  const getActiveTabFromPath = (pathname: string): string => {
    if (pathname === '/timeline') return 'timeline';
    if (pathname === '/dynasties') return 'dynasties';
    if (pathname === '/map') return 'map';
    if (pathname === '/people') return 'people';
    if (pathname === '/culture') return 'culture';
    if (pathname === '/mythology') return 'mythology';
    return 'timeline';
  };

  const activeTab = getActiveTabFromPath(location.pathname);
  
  // 检查是否为竖屏模式
  const isPortrait = orientation.type.includes('portrait') || window.innerHeight > window.innerWidth;
  const showPortraitSidebar = isMobile && isPortrait;

  // 毛玻璃主内容区域样式 - 仅在毛玻璃模式下使用
  const mainContentGlassStyle = isClassicStyle ? {
    backgroundColor: isDark ? 'var(--classic-bg-surface)' : 'var(--classic-bg-surface)',
    border: `1px solid ${isDark ? 'var(--classic-border-color)' : 'var(--classic-border-color)'}`,
    borderRadius: glassConfig.border.radius.lg,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  } : {
    backdropFilter: `blur(${glassConfig.components.card.blur})`,
    WebkitBackdropFilter: `blur(${glassConfig.components.card.blur})`,
    backgroundColor: `rgba(${bgBase}, ${glassConfig.components.card.bgOpacity})`,
    border: `${glassConfig.border.width} solid ${borderColor}`,
    borderRadius: glassConfig.border.radius.lg,
    boxShadow: glassConfig.shadow.md,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`
  };

  // 毛玻璃底部导航栏样式 - 仅在毛玻璃模式下使用
  const bottomNavGlassStyle = isClassicStyle ? {
    backgroundColor: isDark ? 'var(--classic-nav-bg)' : 'var(--classic-nav-bg)',
    borderTop: `1px solid ${isDark ? 'var(--classic-border-color)' : 'var(--classic-border-color)'}`,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
  } : {
    backdropFilter: `blur(${glassConfig.components.navigation.blur})`,
    WebkitBackdropFilter: `blur(${glassConfig.components.navigation.blur})`,
    background: `linear-gradient(to top, rgba(${bgBase}, ${glassConfig.components.navigation.bgOpacity}), rgba(${bgBase}, ${glassConfig.components.navigation.bgOpacity - 0.2}))`,
    borderTop: `${glassConfig.border.width} solid ${borderColor}`,
    boxShadow: glassConfig.shadow.lg,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`
  };

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
      {/* 数据源指示器 - 固定在右上角 */}
      <Box sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1400,
        ...(isMobile && {
          top: 8,
          right: 8,
        })
      }}>
        <DataSourceIndicator />
      </Box>
      
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
          // 移除朝代背景颜色，使用默认背景
          background: 'var(--color-bg-gradient)',
          backgroundSize: 'cover',
          transition: `all ${glassConfig.animation.duration.slow} ${glassConfig.animation.easing}`,
          touchAction: 'pan-x pan-y', // 允许内部滚动
          // 移动端优化
          ...(isMobile && {
            backgroundAttachment: 'scroll', // 移动端不支持 fixed
          }),
          // 竖屏模式下的特殊样式 - 应用毛玻璃效果
          ...(showPortraitSidebar && {
            padding: '12px',
            marginBottom: '20px',
            backdropFilter: mainContentGlassStyle.backdropFilter,
            WebkitBackdropFilter: mainContentGlassStyle.WebkitBackdropFilter,
            backgroundColor: mainContentGlassStyle.backgroundColor,
            border: mainContentGlassStyle.border,
            borderRadius: mainContentGlassStyle.borderRadius,
            boxShadow: mainContentGlassStyle.boxShadow,
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
      
      {/* 竖屏模式的底部导航栏区域 - 应用毛玻璃效果 */}
      {showPortraitSidebar && (
        <Box sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          ...bottomNavGlassStyle,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '20px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          <PortraitSidebar activeTab={activeTab} />
        </Box>
      )}
      
      {/* 桌面端和横屏模式的底部 */}
      {!showPortraitSidebar && !isMobile && <Footer />}
    </Box>
  );
}