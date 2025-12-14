import { useState } from 'react';
import {
  Box,
  Drawer,
  Button,
  Stack,
  TextField,
  Divider,
  Typography
} from '@mui/material';
import {
  History,
  MapOutlined,
  Settings
} from '@mui/icons-material';
import { useEventsStore, useTimelineStore } from '../store';
import { YearSettingsPopover } from '../components/ui/YearSettingsPopover';

interface SidebarProps {
  activeTab: 'timeline' | 'map';
  onTabChange: (tab: 'timeline' | 'map') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { searchQuery, setSearchQuery } = useEventsStore();
  const { startYear, endYear } = useTimelineStore();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const drawerWidth = 240;

  return (
    <>
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
        <Box sx={{ padding: '16px' }}>
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
          
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Button
              variant={activeTab === 'timeline' ? 'contained' : 'outlined'}
              startIcon={<History />}
              onClick={() => onTabChange('timeline')}
              fullWidth
              sx={{
                borderRadius: 'var(--radius-lg)',
                background: activeTab === 'timeline' ? 'var(--color-primary-gradient)' : 'transparent',
                boxShadow: activeTab === 'timeline' ? 'var(--shadow-md), var(--shadow-glow)' : 'var(--shadow-sm)',
                '&:hover': {
                  background: activeTab === 'timeline' ? 'var(--color-primary-gradient)' : 'rgba(255, 61, 0, 0.1)',
                  boxShadow: 'var(--shadow-md), var(--shadow-glow)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all var(--transition-normal)'
              }}
            >
              时间轴
            </Button>
            <Button
              variant={activeTab === 'map' ? 'contained' : 'outlined'}
              startIcon={<MapOutlined />}
              onClick={() => onTabChange('map')}
              fullWidth
              sx={{
                borderRadius: 'var(--radius-lg)',
                background: activeTab === 'map' ? 'var(--color-secondary-gradient)' : 'transparent',
                boxShadow: activeTab === 'map' ? 'var(--shadow-md), var(--shadow-glow-blue)' : 'var(--shadow-sm)',
                '&:hover': {
                  background: activeTab === 'map' ? 'var(--color-secondary-gradient)' : 'rgba(3, 169, 244, 0.1)',
                  boxShadow: 'var(--shadow-md), var(--shadow-glow-blue)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all var(--transition-normal)'
              }}
            >
              地图
            </Button>
          </Stack>
          
          <Divider sx={{ mb: 3 }} />
          
          <TextField
            fullWidth
            placeholder="搜索事件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '2px solid var(--color-border-medium)',
                '&:hover': {
                  borderColor: 'var(--color-primary)',
                  boxShadow: '0 0 10px rgba(255, 61, 0, 0.2)'
                },
                '&.Mui-focused': {
                  borderColor: 'var(--color-primary)',
                  boxShadow: '0 0 20px rgba(255, 61, 0, 0.3), var(--shadow-glow)'
                },
                transition: 'all var(--transition-normal)'
              },
              '& .MuiInputBase-input': {
                color: 'var(--color-text-primary)'
              }
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<Settings />}
            onClick={handleOpen}
            fullWidth
            sx={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-secondary-gradient)',
              boxShadow: 'var(--shadow-md), var(--shadow-glow-blue)',
              '&:hover': {
                background: 'var(--color-secondary-gradient)',
                boxShadow: 'var(--shadow-lg), var(--shadow-glow-blue)',
                transform: 'translateY(-2px)'
              },
              transition: 'all var(--transition-normal)'
            }}
          >
            {startYear} - {endYear}
          </Button>
        </Box>
      </Drawer>

      <YearSettingsPopover
        anchorEl={anchorEl}
        onClose={handleClose}
      />
    </>
  );
}
