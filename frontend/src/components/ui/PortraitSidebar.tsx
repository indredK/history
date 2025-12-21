/**
 * 竖屏模式专用侧边栏组件
 * 在竖屏模式下显示为底部导航栏
 * 
 * 应用苹果毛玻璃风格（Glassmorphism）
 * Requirements: 6.3, 6.4, 6.5
 */

import { Box, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { navigationItems } from '@/config';
import { useResponsive, useOrientation } from '@/hooks/useResponsive';
import { getSidebarStyles } from '@/config/responsive';
import { getGlassConfig } from '@/config/glassConfig';

interface PortraitSidebarProps {
  activeTab: string;
  glassEffect?: boolean;
}

export function PortraitSidebar({ activeTab: _activeTab, glassEffect = true }: PortraitSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, screenWidth } = useResponsive();
  const orientation = useOrientation();
  
  // 只在移动端竖屏模式下显示
  const isPortrait = orientation.type.includes('portrait') || window.innerHeight > window.innerWidth;
  const shouldShow = isMobile && isPortrait;

  // 获取响应式样式
  const sidebarStyles = getSidebarStyles(screenWidth);
  
  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);
  const navConfig = glassConfig.components.navigation;

  if (!shouldShow) {
    return null;
  }

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // 根据屏幕宽度调整高度
  const getHeight = () => {
    if (screenWidth < 375) return '70px';
    if (screenWidth < 768) return '80px';
    return '90px';
  };

  // 毛玻璃容器样式
  const glassContainerStyles = glassEffect ? {
    backdropFilter: `blur(${navConfig.blur})`,
    WebkitBackdropFilter: `blur(${navConfig.blur})`,
    background: `linear-gradient(135deg, rgba(18, 18, 18, ${navConfig.bgOpacity}) 0%, rgba(30, 30, 30, ${navConfig.bgOpacity}) 100%)`,
    border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
    boxShadow: `0 -4px 20px rgba(0, 0, 0, 0.3), ${navConfig.activeGlow}`,
  } : {
    background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 61, 0, 0.2)',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 61, 0, 0.1)',
  };

  return (
    <Paper
      sx={{
        width: '90%',
        maxWidth: '400px',
        height: getHeight(),
        borderRadius: glassConfig.border.radius.xl,
        position: 'relative',
        ...glassContainerStyles,
      }}
      className="portrait-sidebar"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
          padding: '4px 8px',
          overflow: 'hidden',
        }}
        className="sidebar-content"
      >
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          // 毛玻璃导航项样式
          const glassItemStyles = glassEffect ? {
            background: isActive 
              ? 'linear-gradient(135deg, #FF3D00 0%, #FF6F3D 100%)'
              : 'transparent',
            boxShadow: isActive 
              ? navConfig.activeGlow
              : 'none',
            transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
            '&:hover': {
              background: isActive 
                ? 'linear-gradient(135deg, #FF3D00 0%, #FF6F3D 100%)'
                : `rgba(255, 255, 255, ${navConfig.itemHoverOpacity - navConfig.bgOpacity})`,
              backdropFilter: isActive ? 'none' : `blur(${glassConfig.blur.light})`,
              transform: 'translateY(-2px)',
              color: 'white',
            },
            '&:active': {
              transform: 'translateY(-1px) scale(0.95)',
              boxShadow: glassConfig.shadow.sm,
            },
          } : {
            background: isActive 
              ? 'linear-gradient(135deg, #FF3D00 0%, #FF6F3D 100%)'
              : 'transparent',
            boxShadow: isActive 
              ? '0 4px 15px rgba(255, 61, 0, 0.4)'
              : 'none',
            '&:hover': {
              background: isActive 
                ? 'linear-gradient(135deg, #FF3D00 0%, #FF6F3D 100%)'
                : 'linear-gradient(135deg, rgba(255, 61, 0, 0.1) 0%, rgba(255, 111, 61, 0.1) 100%)',
              transform: 'translateY(-2px)',
              color: 'white',
            },
            '&:active': {
              transform: 'translateY(-1px) scale(0.95)',
            },
          };
          
          return (
            <Box
              key={item.key}
              onClick={() => handleNavigation(item.path)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                maxWidth: 'none',
                minWidth: 0,
                height: sidebarStyles.itemSize,
                padding: '4px 1px',
                borderRadius: glassConfig.border.radius.md,
                cursor: 'pointer',
                textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                transform: isActive ? 'translateY(-2px)' : 'none',
                ...glassItemStyles,
                '&:focus': {
                  outline: '2px solid #FF3D00',
                  outlineOffset: '2px',
                },
              }}
              className="nav-item"
              role="button"
              tabIndex={0}
              aria-label={item.label}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNavigation(item.path);
                }
              }}
            >
              <Box 
                sx={{ 
                  fontSize: sidebarStyles.iconSize,
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }} 
                className="nav-icon"
              >
                {item.icon}
              </Box>
              <Box
                sx={{
                  fontSize: sidebarStyles.fontSize,
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
                className="nav-label"
              >
                {item.label}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}