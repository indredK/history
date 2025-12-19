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
import { navigationItems, getNavigationItemTheme, navigationStyles, gradients } from '@/config';
import { NavigationSection } from '@/layouts/Sidebar/NavigationSection';
import { FunctionPanel } from '@/layouts/Sidebar/FunctionPanel';
import './Sidebar/Sidebar.css';

interface SidebarProps {
  activeTab: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ activeTab, collapsed, onToggle }: SidebarProps) {
  const drawerWidth = collapsed ? 60 : 240;
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
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
          background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-card) 100%)',
          borderRight: '1px solid var(--color-border-medium)',
          boxShadow: 'var(--shadow-md)',
          top: 0
        } 
      }}
      className="app-sider"
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
              borderBottom: '1px solid var(--color-border-medium)'
            }}>
              <Tooltip title="展开菜单" placement="right">
                <IconButton 
                  onClick={onToggle}
                  sx={{ 
                    color: 'var(--color-text-primary)',
                    background: gradients.sidebar,
                    borderRadius: 'var(--radius-lg)',
                    '&:hover': {
                      background: gradients.sidebarHover
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
              borderBottom: '1px solid var(--color-border-medium)',
              background: gradients.sidebar,
              borderRadius: 'var(--radius-lg)',
              padding: '8px'
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
                    ml: 1
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
                        background: isActive ? theme?.gradient : 'transparent',
                        color: isActive ? 'white' : 'var(--color-text-primary)',
                        boxShadow: isActive ? 'var(--shadow-md), var(--shadow-glow)' : 'var(--shadow-sm)',
                        '&:hover': {
                          background: isActive ? undefined : theme?.hoverBackground,
                          ...navigationStyles.iconButtonHover
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
              <Divider sx={{ my: 3 }} />
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
