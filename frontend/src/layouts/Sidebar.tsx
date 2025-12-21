import {
  Box,
  Drawer,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { useNavigate } from 'react-router-dom';
import { navigationItems, getNavigationItemTheme, navigationStyles } from '@/config';
import { NavigationSection } from '@/layouts/Sidebar/NavigationSection';
import { FunctionPanel } from '@/layouts/Sidebar/FunctionPanel';
import { useResponsive } from '@/hooks';
import { getGlassConfig } from '@/config/glassConfig';
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
  
  // 获取毛玻璃配置
  const glassConfig = getGlassConfig(screenWidth);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // 毛玻璃侧边栏样式
  const sidebarGlassStyle = {
    backdropFilter: `blur(${glassConfig.components.navigation.blur})`,
    WebkitBackdropFilter: `blur(${glassConfig.components.navigation.blur})`,
    background: `linear-gradient(135deg, rgba(30, 30, 30, ${glassConfig.components.navigation.bgOpacity}) 0%, rgba(20, 20, 20, ${glassConfig.components.navigation.bgOpacity + 0.1}) 100%)`,
    borderRight: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
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
              borderBottom: `${glassConfig.border.width} solid ${glassConfig.border.color}`
            }}>
              <Tooltip title="展开菜单" placement="right">
                <IconButton 
                  onClick={onToggle}
                  sx={{ 
                    color: 'var(--color-text-primary)',
                    backdropFilter: `blur(${glassConfig.blur.light})`,
                    WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
                    background: `rgba(255, 255, 255, ${glassConfig.bgOpacity.light})`,
                    border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
                    borderRadius: glassConfig.border.radius.lg,
                    boxShadow: glassConfig.shadow.sm,
                    transition: `all ${glassConfig.animation.hoverDuration} ${glassConfig.animation.easing}`,
                    '&:hover': {
                      background: `rgba(255, 255, 255, ${glassConfig.bgOpacity.medium})`,
                      boxShadow: glassConfig.shadow.glow
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
              borderBottom: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
              backdropFilter: `blur(${glassConfig.blur.light})`,
              WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
              background: `rgba(255, 255, 255, ${glassConfig.bgOpacity.light})`,
              border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
              borderRadius: glassConfig.border.radius.lg,
              boxShadow: glassConfig.shadow.sm,
              padding: '8px',
              transition: `all ${glassConfig.animation.duration.normal} ${glassConfig.animation.easing}`
            }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'var(--color-text-primary)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  flex: 1,
                  textAlign: 'center'
                }}
                onClick={onToggle}
              >
                中国历史全景
              </Typography>
              <Tooltip title="收起菜单">
                <IconButton 
                  onClick={onToggle}
                  size="small"
                  sx={{ 
                    color: 'var(--color-text-primary)',
                    ml: 1,
                    transition: `all ${glassConfig.animation.hoverDuration} ${glassConfig.animation.easing}`,
                    '&:hover': {
                      background: `rgba(255, 255, 255, ${glassConfig.bgOpacity.ultraLight})`
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
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        ...navigationStyles.iconButton,
                        backdropFilter: `blur(${glassConfig.blur.light})`,
                        WebkitBackdropFilter: `blur(${glassConfig.blur.light})`,
                        background: isActive 
                          ? theme?.gradient 
                          : `rgba(255, 255, 255, ${glassConfig.bgOpacity.ultraLight})`,
                        color: isActive ? 'white' : 'var(--color-text-primary)',
                        border: `${glassConfig.border.width} solid ${glassConfig.border.color}`,
                        boxShadow: isActive 
                          ? `${glassConfig.shadow.md}, ${glassConfig.components.navigation.activeGlow}` 
                          : glassConfig.shadow.sm,
                        transition: `all ${glassConfig.animation.hoverDuration} ${glassConfig.animation.easing}`,
                        '&:hover': {
                          background: isActive 
                            ? undefined 
                            : `rgba(255, 255, 255, ${glassConfig.components.navigation.itemHoverOpacity})`,
                          boxShadow: glassConfig.shadow.glow,
                          transform: 'translateY(-2px)'
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
                borderColor: glassConfig.border.color
              }} />
            </>
          )}
        </Box>
        
        {/* 功能面板区域 - 贴近下方 */}
        {!collapsed && (
          <Box sx={{ 
            padding: '0 16px 16px 16px',
            marginTop: 'auto', // 将功能面板推到下方
            width: '100%'
          }}>
            <FunctionPanel activeTab={activeTab} />
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
