import {
  Box,
  Drawer,
  Typography,
  Divider
} from '@mui/material';
import { NavigationSection } from './Sidebar/NavigationSection';
import { FunctionPanel } from './Sidebar/FunctionPanel';
import './Sidebar/Sidebar.css';

interface SidebarProps {
  activeTab: string;
}

export function Sidebar({ activeTab }: SidebarProps) {
  const drawerWidth = 240;

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
          <Typography variant="h6" component="div" sx={{ 
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'var(--color-text-primary)',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: '0.5px',
            mb: 3,
            pb: 2,
            borderBottom: '1px solid var(--color-border-medium)',
            background: 'linear-gradient(135deg, rgba(255,61,0,0.1) 0%, rgba(3,169,244,0.1) 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '8px'
          }}>
            中国历史全景
          </Typography>
        </Box>
        
        {/* 导航区域 - 固定高度 */}
        <Box sx={{ 
          padding: '0 16px',
          flexShrink: 0 // 不允许收缩
        }}>
          <NavigationSection 
            activeTab={activeTab} 
          />
          <Divider sx={{ my: 3 }} />
        </Box>
        
        {/* 功能面板区域 - 贴近下方 */}
        <Box sx={{ 
          padding: '0 16px 16px 16px',
          marginTop: 'auto', // 将功能面板推到下方
          width: '100%'
        }}>
          <FunctionPanel activeTab={activeTab} />
        </Box>
      </Box>
    </Drawer>
  );
}
