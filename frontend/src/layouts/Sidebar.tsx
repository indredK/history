import {
  Box,
  Drawer,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  Popover,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationItems, getNavigationItemTheme, navigationStyles } from '@/config';
import { NavigationSection } from '@/layouts/Sidebar/NavigationSection';
import { FunctionPanel } from '@/layouts/Sidebar/FunctionPanel';
import { SettingsPanel } from '@/layouts/Sidebar/SettingsPanel';
import { useResponsive } from '@/hooks';
import { getGlassConfig } from '@/config/glassConfig';
import { useThemeStore, useStyleStore } from '@/store';
import './Sidebar/Sidebar.css';

interface SidebarProps {
  activeTab: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ activeTab, collapsed, onToggle }: SidebarProps) {
  const drawerWidth = collapsed ? 60 : 240;
  const navigate = useNavigate();
  const { screenWidth } = useResponsive();
  const { theme } = useThemeStore();
  const { style } = useStyleStore();
  const navButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [compactPanelAnchorEl, setCompactPanelAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [compactPanelTabKey, setCompactPanelTabKey] = useState<string | null>(null);
  
  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);
  
  // 检查是否为经典样式模式
  const isClassicStyle = style === 'classic';
  
  // 根据主题获取背景色
  const isDark = theme === 'dark';
  const borderColor = isDark ? 'rgba(226, 198, 140, 0.16)' : 'rgba(118, 90, 51, 0.14)';

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleCompactPanelClose = () => {
    setCompactPanelAnchorEl(null);
  };

  const handleCollapsedNavigation = (
    item: (typeof navigationItems)[number],
    anchorEl: HTMLButtonElement | null,
  ) => {
    const isCurrentTab = activeTab === item.key;
    const isPanelOpenForTab = compactPanelAnchorEl !== null && compactPanelTabKey === item.key;

    if (!isCurrentTab) {
      handleNavigation(item.path);
    }

    setCompactPanelTabKey(item.key);

    if (isCurrentTab && isPanelOpenForTab) {
      handleCompactPanelClose();
      return;
    }

    if (anchorEl) {
      setCompactPanelAnchorEl(anchorEl);
    }
  };

  useEffect(() => {
    if (!collapsed) {
      setCompactPanelAnchorEl(null);
      setCompactPanelTabKey(null);
      return;
    }

    if (compactPanelTabKey === activeTab) {
      return;
    }

    const activeButton = navButtonRefs.current[activeTab];
    if (activeButton) {
      setCompactPanelTabKey(activeTab);
      setCompactPanelAnchorEl(activeButton);
    }
  }, [activeTab, collapsed, compactPanelTabKey]);

  const compactPanelActiveTab = compactPanelTabKey ?? activeTab;
  const compactPanelLabel = navigationItems.find((item) => item.key === compactPanelActiveTab)?.label ?? '';

  // 毛玻璃侧边栏样式 - 仅在毛玻璃模式下使用
  // 经典模式下使用 CSS 类样式
  const sidebarGlassStyle = isClassicStyle ? {} : {
    backdropFilter: `blur(${glassConfig.components.navigation.blur})`,
    WebkitBackdropFilter: `blur(${glassConfig.components.navigation.blur})`,
    background: 'var(--panel-bg)',
    borderRight: `${glassConfig.border.width} solid ${borderColor}`,
    boxShadow: glassConfig.shadow.md,
    transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`
  };

  return (
    <Drawer
      variant="permanent"
      sx={{ 
        width: drawerWidth, 
        flexShrink: 0, 
        '& .MuiDrawer-paper': { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          ...sidebarGlassStyle,
          top: 0
        } 
      }}
      className="app-sider glass-sidebar"
    >
      <Box sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden' // 防止整个侧边栏滚动
        }}>
        {/* 应用标题 - 固定高度 */}
        <Box sx={{ 
          padding: '16px 16px 0 16px',
          flexShrink: 0 // 不允许收缩
        }}>
          {collapsed ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 3,
              pb: 2,
              borderBottom: `${glassConfig.border.width} solid ${isClassicStyle ? 'var(--classic-border-color)' : glassConfig.border.color}`
            }}>
              <Tooltip title="展开菜单" placement="right">
                <IconButton 
                  onClick={() => {
                    handleCompactPanelClose();
                    setCompactPanelTabKey(null);
                    onToggle();
                  }}
                  sx={{ 
                    color: 'var(--color-text-primary)',
                    ...(isClassicStyle ? {
                      background: isDark ? 'var(--classic-btn-icon-bg)' : 'var(--classic-btn-icon-bg)',
                      border: `1px solid ${isDark ? 'var(--classic-border-color)' : 'var(--classic-border-color)'}`,
                    } : {
                      backdropFilter: `blur(${glassConfig.blur.light})`,
                      WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
                      background: `rgba(var(--glass-surface-rgb), ${glassConfig.bgOpacity.light})`,
                      border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
                    }),
                    borderRadius: glassConfig.border.radius.lg,
                    boxShadow: isClassicStyle ? '0 1px 3px rgba(0, 0, 0, 0.12)' : glassConfig.shadow.sm,
                    transition: `all ${glassConfig.animation.hoverDuration} ${glassConfig.animation.easing}`,
                    '&:hover': {
                      background: isClassicStyle 
                        ? (isDark ? 'var(--classic-nav-item-hover)' : 'var(--classic-nav-item-hover)')
                        : 'rgba(199, 143, 69, 0.1)',
                      boxShadow: isClassicStyle ? '0 2px 6px rgba(0, 0, 0, 0.15)' : glassConfig.shadow.glow,
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(-1px) scale(0.92)',
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              pb: 2,
              borderBottom: `${glassConfig.border.width} solid ${isClassicStyle ? 'var(--classic-border-color)' : glassConfig.border.color}`,
              ...(isClassicStyle ? {
                background: isDark ? 'var(--classic-bg-elevated)' : 'var(--classic-bg-elevated)',
                border: `1px solid ${isDark ? 'var(--classic-border-color)' : 'var(--classic-border-color)'}`,
              } : {
                backdropFilter: `blur(${glassConfig.blur.light})`,
                WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
                background: 'var(--panel-bg-soft)',
                border: 'var(--panel-border)',
              }),
              borderRadius: glassConfig.border.radius.lg,
              boxShadow: isClassicStyle ? '0 1px 3px rgba(0, 0, 0, 0.12)' : 'var(--shadow-sm)',
              padding: '10px 12px',
              transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`
            }}>
              <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onToggle}>
                <Typography
                  component="div"
                  sx={{
                    fontFamily: 'var(--font-family-serif)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  中国历史全视界
                </Typography>
              </Box>
              <Tooltip title="收起菜单">
                <IconButton 
                  onClick={onToggle}
                  size="small"
                  sx={{ 
                    color: 'var(--color-text-primary)',
                    ml: 1,
                    transition: `all ${glassConfig.animation.hoverDuration} ${glassConfig.animation.easing}`,
                    '&:hover': {
                      background: 'rgba(199, 143, 69, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(-1px) scale(0.92)',
                    }
                  }}
                >
                  <MenuOpenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        
        {/* 导航区域 - 固定高度 */}
        <Box sx={{ 
          padding: collapsed ? '0 8px' : '0 16px',
          flexShrink: 0 // 不允许收缩
        }}>
          {collapsed ? (
            <Stack spacing={1} sx={{ alignItems: 'center' }}>
              {navigationItems.map((item) => {
                const theme = getNavigationItemTheme(item.key);
                const isActive = activeTab === item.key;
                
                return (
                  <Tooltip key={item.key} title={item.label} placement="right">
                    <IconButton
                      ref={(node) => {
                        navButtonRefs.current[item.key] = node;
                      }}
                      onClick={(event) => {
                        handleCollapsedNavigation(item, event.currentTarget);
                      }}
                      sx={{
                        ...navigationStyles.iconButton,
                        ...(isClassicStyle ? {
                          background: isActive 
                            ? theme?.gradient 
                            : (isDark ? 'var(--classic-btn-icon-bg)' : 'var(--classic-btn-icon-bg)'),
                          border: `1px solid ${isDark ? 'var(--classic-border-color)' : 'var(--classic-border-color)'}`,
                        } : {
                          backdropFilter: `blur(${glassConfig.blur.light})`,
                          WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
                          background: isActive 
                            ? theme?.gradient 
                            : 'rgba(199, 143, 69, 0.08)',
                          border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
                        }),
                        color: isActive ? 'white' : 'var(--color-text-primary)',
                        boxShadow: isActive 
                          ? (isClassicStyle ? '0 2px 8px rgba(var(--glass-tint-rgb), 0.26)' : `${glassConfig.shadow.md}, ${glassConfig.components.navigation.activeGlow}`)
                          : (isClassicStyle ? '0 1px 3px rgba(0, 0, 0, 0.12)' : glassConfig.shadow.sm),
                        transition: `all ${glassConfig.animation.hoverDuration} ${glassConfig.animation.easing}`,
                        '&:hover': {
                          background: isActive 
                            ? undefined 
                            : (isClassicStyle 
                                ? (isDark ? 'var(--classic-nav-item-hover)' : 'var(--classic-nav-item-hover)')
                                : 'rgba(199, 143, 69, 0.1)'),
                          boxShadow: isClassicStyle ? '0 2px 6px rgba(0, 0, 0, 0.15)' : glassConfig.shadow.glow,
                          transform: 'translateY(-2px)'
                        },
                        '&:active': {
                          transform: 'translateY(-1px) scale(0.92)',
                        }
                      }}
                    >
                      {item.icon}
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Stack>
          ) : (
            <>
              <NavigationSection 
                activeTab={activeTab} 
              />
              <Divider sx={{ 
                my: 3,
                borderColor: isClassicStyle ? 'var(--classic-border-color)' : glassConfig.border.color
              }} />
            </>
          )}
        </Box>
        
        {/* 功能面板区域 */}
        {!collapsed && (
          <Box sx={{ 
            padding: '0 16px 8px 16px',
            flex: 1,
            overflow: 'auto',
            width: '100%'
          }}>
            <FunctionPanel activeTab={activeTab} collapsed={false} />
          </Box>
        )}
        
        {/* 设置面板区域 - 固定在底部 */}
        <Box sx={{ 
          padding: collapsed ? '8px' : '8px 16px 16px 16px',
          marginTop: 'auto',
          width: '100%',
          flexShrink: 0,
        }}>
          <SettingsPanel collapsed={collapsed} />
        </Box>
      </Box>
      {collapsed && compactPanelActiveTab ? (
        <Popover
          open={Boolean(compactPanelAnchorEl)}
          anchorEl={compactPanelAnchorEl}
          onClose={handleCompactPanelClose}
          anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
          disableRestoreFocus
          slotProps={{
            paper: {
              sx: {
                ml: 1.25,
                width: 304,
                maxWidth: 'min(304px, calc(100vw - 92px))',
                maxHeight: 'calc(100vh - 48px)',
                overflow: 'hidden',
                background: 'var(--panel-bg)',
                border: 'var(--panel-border)',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-lg)',
              },
            },
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.1,
              borderBottom: '1px solid var(--color-border-medium)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              {compactPanelLabel}
            </Typography>
          </Box>
          <Box sx={{ maxHeight: 'calc(100vh - 112px)', overflowY: 'auto' }}>
            <FunctionPanel activeTab={compactPanelActiveTab} collapsed />
          </Box>
        </Popover>
      ) : null}
    </Drawer>
  );
}
