/**
 * 竖屏模式专用侧边栏组件
 * 在竖屏模式下显示为底部导航栏
 */

import { Box, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { navigationItems } from '@/config';
import { useResponsive, useOrientation } from '@/hooks/useResponsive';
import { getSidebarStyles } from '@/config/responsive';

interface PortraitSidebarProps {
  activeTab: string;
}

export function PortraitSidebar({ activeTab: _activeTab }: PortraitSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, screenWidth } = useResponsive();
  const orientation = useOrientation();
  
  // 只在移动端竖屏模式下显示
  const isPortrait = orientation.type.includes('portrait') || window.innerHeight > window.innerWidth;
  const shouldShow = isMobile && isPortrait;

  // 获取响应式样式
  const sidebarStyles = getSidebarStyles(screenWidth);

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

  return (
    <Paper
      sx={{
        width: '90%', // 不占满整个宽度，留出边距
        maxWidth: '400px', // 最大宽度限制
        height: getHeight(),
        borderRadius: '20px', // 全圆角
        background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 61, 0, 0.2)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 61, 0, 0.1)',
        position: 'relative', // 改为相对定位
      }}
      className="portrait-sidebar"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between', // 改为space-between确保均匀分布
          alignItems: 'center',
          height: '100%',
          padding: '4px 8px', // 进一步减少左右内边距
          overflow: 'hidden', // 禁止横向滚动
        }}
        className="sidebar-content"
      >
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Box
              key={item.key}
              onClick={() => handleNavigation(item.path)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1, // 使用flex: 1让每个项目平均分配空间
                maxWidth: 'none', // 移除最大宽度限制
                minWidth: 0, // 允许收缩
                height: sidebarStyles.itemSize,
                padding: '4px 1px', // 进一步减少内边距
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                background: isActive 
                  ? 'linear-gradient(135deg, #FF3D00 0%, #FF6F3D 100%)'
                  : 'transparent',
                transform: isActive ? 'translateY(-2px)' : 'none',
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
                  maxWidth: '100%', // 使用100%而不是固定宽度
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