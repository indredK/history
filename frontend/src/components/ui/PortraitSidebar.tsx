/**
 * 竖屏模式专用侧边栏组件
 * 在竖屏模式下显示为底部导航栏
 * 
 * 应用苹果毛玻璃风格（Glassmorphism）
 * Requirements: 6.3, 6.4, 6.5
 */

import { Box, Paper, Drawer, IconButton, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { navigationItems } from '@/config';
import { FunctionPanel } from '@/layouts/Sidebar/FunctionPanel';
import { Settings as SettingsIcon, Close } from '@mui/icons-material';
import { useResponsive, useOrientation } from '@/hooks/useResponsive';
import { getSidebarStyles } from '@/config/responsive';
import { getGlassConfig } from '@/config/glassConfig';
import { useThemeStore, useStyleStore } from '@/store';
import { useState } from 'react';

interface PortraitSidebarProps {
  activeTab: string;
  glassEffect?: boolean;
}

export function PortraitSidebar({ activeTab: _activeTab, glassEffect = true }: PortraitSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, screenWidth } = useResponsive();
  const orientation = useOrientation();
  const { theme } = useThemeStore();
  const { style } = useStyleStore();
  const [functionDrawerOpen, setFunctionDrawerOpen] = useState(false);
  
  // 只在移动端竖屏模式下显示
  const isPortrait = orientation.type.includes('portrait') || window.innerHeight > window.innerWidth;
  const shouldShow = isMobile && isPortrait;

  // 获取响应式样式
  const sidebarStyles = getSidebarStyles(screenWidth);
  
  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);
  const navConfig = glassConfig.components.navigation;
  
  // 检查是否为经典样式模式
  const isClassicStyle = style === 'classic';
  
  // 根据主题获取背景色
  const isDark = theme === 'dark';
  const bgBase = isDark ? '28, 24, 20' : '255, 251, 243';
  const bgSecondary = isDark ? '43, 37, 31' : '244, 236, 223';
  const textColor = isDark ? 'rgba(245, 236, 216, 0.72)' : 'rgba(76, 60, 44, 0.78)';
  const borderColor = isDark ? 'rgba(226, 198, 140, 0.18)' : 'rgba(118, 90, 51, 0.14)';
  const activeGradient = 'linear-gradient(135deg, rgba(var(--glass-tint-rgb), 0.94) 0%, rgba(166, 122, 68, 0.9) 100%)';
  const hoverGradient = 'linear-gradient(135deg, rgba(var(--glass-tint-rgb), 0.12) 0%, rgba(107, 135, 151, 0.1) 100%)';

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

  // 毛玻璃容器样式 - 根据样式模式选择
  const glassContainerStyles = isClassicStyle ? {
    // 经典样式 - 无模糊效果
    background: isDark ? 'var(--classic-nav-bg)' : 'var(--classic-nav-bg)',
    border: `1px solid ${isDark ? 'var(--classic-border-color)' : 'var(--classic-border-color)'}`,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
  } : glassEffect ? {
    backdropFilter: `blur(${navConfig.blur})`,
    WebkitBackdropFilter: `blur(${navConfig.blur})`,
    background: `linear-gradient(135deg, rgba(${bgBase}, ${navConfig.bgOpacity}) 0%, rgba(${bgSecondary}, ${navConfig.bgOpacity}) 100%)`,
    border: `${glassConfig.border.width} solid ${borderColor}`,
    boxShadow: `0 -4px 20px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1}), ${navConfig.activeGlow}`,
  } : {
    background: `linear-gradient(135deg, rgba(${bgBase}, 0.95) 0%, rgba(${bgSecondary}, 0.95) 100%)`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${borderColor}`,
    boxShadow: `0 -4px 20px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1}), 0 0 40px rgba(var(--glass-tint-rgb), 0.12)`,
  };

  return (
    <>
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
          
          // 毛玻璃导航项样式 - 根据样式模式选择
          const glassItemStyles = isClassicStyle ? {
            // 经典样式 - 无模糊效果
            background: isActive 
              ? activeGradient
              : 'transparent',
            boxShadow: isActive 
              ? '0 2px 8px rgba(var(--glass-tint-rgb), 0.28)'
              : 'none',
            transition: 'all 200ms ease',
            '&:hover': {
              background: isActive 
                ? activeGradient
                : isDark ? 'var(--classic-nav-item-hover)' : 'var(--classic-nav-item-hover)',
              transform: 'translateY(-2px)',
              color: isActive ? 'var(--color-text-inverse)' : textColor,
            },
            '&:active': {
              transform: 'translateY(-1px) scale(0.95)',
            },
          } : glassEffect ? {
            background: isActive 
              ? activeGradient
              : 'transparent',
            boxShadow: isActive 
              ? navConfig.activeGlow
              : 'none',
            transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
            '&:hover': {
              background: isActive 
                ? activeGradient
                : `rgba(${isDark ? '245, 236, 216' : '255, 251, 243'}, ${navConfig.itemHoverOpacity - navConfig.bgOpacity})`,
              backdropFilter: isActive ? 'none' : `blur(${glassConfig.blur.light})`,
              transform: 'translateY(-2px)',
              color: 'var(--color-text-inverse)',
            },
            '&:active': {
              transform: 'translateY(-1px) scale(0.95)',
              boxShadow: glassConfig.shadow.sm,
            },
          } : {
            background: isActive 
              ? activeGradient
              : 'transparent',
            boxShadow: isActive 
              ? '0 4px 15px rgba(var(--glass-tint-rgb), 0.34)'
              : 'none',
            '&:hover': {
              background: isActive 
                ? activeGradient
                : hoverGradient,
              transform: 'translateY(-2px)',
              color: 'var(--color-text-inverse)',
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
                color: isActive ? 'var(--color-text-inverse)' : textColor,
                transform: isActive ? 'translateY(-2px)' : 'none',
                ...glassItemStyles,
                '&:focus': {
                  outline: '2px solid var(--color-primary)',
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
        {/* 功能面板开关按钮 */}
        <Box
          onClick={() => setFunctionDrawerOpen(true)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: sidebarStyles.itemSize,
            height: sidebarStyles.itemSize,
            padding: '4px 1px',
            borderRadius: glassConfig.border.radius.md,
            cursor: 'pointer',
            color: textColor,
            flexShrink: 0,
            transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`,
            '&:hover': {
              background: `rgba(${isDark ? '245, 236, 216' : '255, 251, 243'}, 0.1)`,
            },
          }}
          role="button"
          tabIndex={0}
          aria-label="展开功能面板"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setFunctionDrawerOpen(true);
            }
          }}
        >
          <Box sx={{ fontSize: sidebarStyles.iconSize, marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SettingsIcon fontSize="inherit" />
          </Box>
          <Box sx={{ fontSize: sidebarStyles.fontSize, fontWeight: 500, textAlign: 'center', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            功能
          </Box>
        </Box>
      </Box>
    </Paper>
    {/* 功能面板抽屉 */}
    <Drawer
      anchor="bottom"
      open={functionDrawerOpen}
      onClose={() => setFunctionDrawerOpen(false)}
      slotProps={{
        paper: {
          sx: {
            maxHeight: '70vh',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            background: 'var(--panel-bg)',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid var(--color-border-medium)' }}>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {navigationItems.find(item => item.key === _activeTab)?.label || '功能面板'}
        </Typography>
        <IconButton size="small" onClick={() => setFunctionDrawerOpen(false)}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ px: 2, py: 1, overflowY: 'auto' }}>
        <FunctionPanel activeTab={_activeTab} collapsed />
      </Box>
    </Drawer>
    </>
  );
}
