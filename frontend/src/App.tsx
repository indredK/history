import { useState, useEffect } from 'react';
import { Timeline } from './features/timeline/Timeline';
import { MapView } from './features/map/MapView';
import { EventList } from './features/events/EventList';
import './App.css';
import './styles/ui.css';

import {
  Box,
  Drawer,
  Button,
  Stack,
  TextField,
  Divider,
  Popover,
  Typography
} from '@mui/material';
import {
  History,
  MapOutlined,
  Settings
} from '@mui/icons-material';
import { useEventsStore, useTimelineStore, useDynastyStore } from './store';

function App() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'map'>('timeline');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tempStartYear, setTempStartYear] = useState<number>(1000);
  const [tempEndYear, setTempEndYear] = useState<number>(2025);
  
  // 获取搜索和时间选择相关的store
  const { searchQuery, setSearchQuery } = useEventsStore();
  const { startYear, endYear, setYears } = useTimelineStore();
  const { selectedDynasty } = useDynastyStore();
  
  // 当startYear或endYear变化时，更新临时值
  useEffect(() => {
    setTempStartYear(startYear);
    setTempEndYear(endYear);
  }, [startYear, endYear]);
  
  
  // 处理年份变化
  const handleDateChange = (start: number, end: number) => {
    setYears(start, end);
  };
  
  // Popover控制
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTempStartYear(startYear);
    setTempEndYear(endYear);
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleApply = () => {
    handleDateChange(tempStartYear, tempEndYear);
    handleClose();
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'year-settings-popover' : undefined;

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="app">

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧边栏 */}
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
              top: 0  // 明确设置从顶部开始
            } 
          }}
          className="app-sider"
        >

          <Box sx={{ padding: '16px' }}>
            {/* 标题 */}
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
            
            {/* 时间轴和地图按钮 */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Button
                variant={activeTab === 'timeline' ? 'contained' : 'outlined'}
                startIcon={<History />}
                onClick={() => setActiveTab('timeline')}
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
                onClick={() => setActiveTab('map')}
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
            
            {/* 搜索框 */}
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
            
            {/* 时间选择按钮 */}
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
            
            {/* 年份设置Popover */}
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  borderRadius: 'var(--radius-xl)',
                  background: 'linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-secondary) 100%)',
                  border: '1px solid var(--color-border-medium)',
                  boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
                  backdropFilter: 'blur(10px)'
                }
              }}
            >
              <Box sx={{ p: 3, minWidth: 250 }}>
                <Typography variant="subtitle1" gutterBottom>
                  年份设置
                </Typography>
                <Stack spacing={3} sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="body2" gutterBottom sx={{ 
                      color: 'var(--color-text-secondary)',
                      fontWeight: 'medium'
                    }}>
                      开始年份
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={tempStartYear}
                      onChange={(e) => setTempStartYear(Number(e.target.value))}
                      inputProps={{ min: 1000, max: 2025 }}
                      size="small"
                      sx={{
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
                  </Box>
                  <Box>
                    <Typography variant="body2" gutterBottom sx={{ 
                      color: 'var(--color-text-secondary)',
                      fontWeight: 'medium'
                    }}>
                      结束年份
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={tempEndYear}
                      onChange={(e) => setTempEndYear(Number(e.target.value))}
                      inputProps={{ min: tempStartYear, max: 2025 }}
                      size="small"
                      sx={{
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
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
                  <Button onClick={handleClose} size="small" sx={{
                    borderRadius: 'var(--radius-md)',
                    '&:hover': {
                      background: 'var(--color-bg-tertiary)',
                      boxShadow: 'var(--shadow-md)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all var(--transition-normal)'
                  }}>
                    取消
                  </Button>
                  <Button onClick={handleApply} size="small" variant="contained" sx={{
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-gradient)',
                    boxShadow: 'var(--shadow-md), var(--shadow-glow)',
                    '&:hover': {
                      background: 'var(--color-primary-gradient)',
                      boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all var(--transition-normal)'
                  }}>
                    应用
                  </Button>
                </Stack>
              </Box>
            </Popover>
          </Box>
        </Drawer>

        {/* 主内容区域 */}
        <Box component="main" sx={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
          marginTop: 0,
          background: selectedDynasty ?
            `linear-gradient(
              to bottom right,
              ${selectedDynasty.color}10,
              ${selectedDynasty.color}05,
              transparent 50%
            ),
            url(${selectedDynasty.backgroundImage}) no-repeat center center fixed,
            var(--color-bg-gradient)`
            : 'var(--color-bg-gradient)',
          backgroundSize: 'cover',
          transition: 'all 0.5s ease-in-out, background-color 0.5s ease-in-out',
          backgroundColor: selectedDynasty ? `${selectedDynasty.color}10` : 'transparent',
        }} >
          <div className="content" style={{ height: '100%', position: 'relative' }}>
            {activeTab === 'map' ? (
              <MapView />
            ) : (
              <>
                <Timeline />
                <EventList />
              </>
            )}
          </div>
        </Box>
      </Box>

      {/* 页脚 */}
      <Box component="footer" sx={{ 
        py: 1, 
        px: 3, 
        mt: 'auto', 
        background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%)',
        borderTop: '1px solid var(--color-border-medium)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        transition: 'all var(--transition-normal)'
      }} className="app-footer">
        <Typography variant="caption" align="center" sx={{ 
          fontSize: '0.7rem',
          color: 'var(--color-text-tertiary)',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          transition: 'all var(--transition-normal)',
          display: 'block'
        }}>
          © 2025 中国历史全景 | Chinese Historical Panorama | MIT License
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
