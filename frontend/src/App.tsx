import { useState, useEffect } from 'react';
import { Timeline } from './features/timeline/Timeline';
import { MapView } from './features/map/MapView';
import { EventList } from './features/events/EventList';
import './App.css';
import './styles/ui.css';
import { getDataSource } from './config/env';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  Button,
  Badge,
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
import { useEventsStore } from './store';
import { useTimelineStore } from './store';

function App() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'map'>('timeline');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tempStartYear, setTempStartYear] = useState<number>(1000);
  const [tempEndYear, setTempEndYear] = useState<number>(2025);
  
  // 获取搜索和时间选择相关的store
  const { searchQuery, setSearchQuery } = useEventsStore();
  const { startYear, endYear, setYears } = useTimelineStore();
  
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
      {/* 顶部导航栏 */}
      <AppBar position="static" sx={{ backgroundColor: 'linear-gradient(135deg, #8c1c13 0%, #bc3908 100%)' }} className="app-header">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            中国历史全景
          </Typography>
          <Badge
            badgeContent={getDataSource() === 'mock' ? 'Mock 模式' : 'API 模式'}
            color={getDataSource() === 'mock' ? 'error' : 'success'}
            sx={{ mr: 2 }}
          >
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: getDataSource() === 'mock' ? '#d32f2f' : '#4caf50' }} />
          </Badge>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧边栏 */}
        <Drawer
          variant="permanent"
          sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
          className="app-sider"
        >
          <Toolbar /> {/* 用于对齐顶部导航栏高度 */}
          <Box sx={{ padding: '16px' }}>
            {/* 时间轴和地图按钮 */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Button
                variant={activeTab === 'timeline' ? 'contained' : 'outlined'}
                startIcon={<History />}
                onClick={() => setActiveTab('timeline')}
                fullWidth
                sx={{ borderRadius: 1 }}
              >
                时间轴
              </Button>
              <Button
                variant={activeTab === 'map' ? 'contained' : 'outlined'}
                startIcon={<MapOutlined />}
                onClick={() => setActiveTab('map')}
                fullWidth
                sx={{ borderRadius: 1 }}
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
              sx={{ mb: 3 }}
            />
            
            {/* 时间选择按钮 */}
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={handleOpen}
              fullWidth
              sx={{ borderRadius: 1 }}
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
            >
              <Box sx={{ p: 2, minWidth: 200 }}>
                <Typography variant="subtitle1" gutterBottom>
                  年份设置
                </Typography>
                <Stack spacing={2} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      开始年份
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={tempStartYear}
                      onChange={(e) => setTempStartYear(Number(e.target.value))}
                      inputProps={{ min: 1000, max: 2025 }}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      结束年份
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={tempEndYear}
                      onChange={(e) => setTempEndYear(Number(e.target.value))}
                      inputProps={{ min: tempStartYear, max: 2025 }}
                      size="small"
                    />
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                  <Button onClick={handleClose} size="small">
                    取消
                  </Button>
                  <Button onClick={handleApply} size="small" variant="contained">
                    应用
                  </Button>
                </Stack>
              </Box>
            </Popover>
          </Box>
        </Drawer>

        {/* 主内容区域 */}
        <Box component="main" sx={{ flex: 1, overflow: 'auto', padding: '16px' }} className="app-main">
          <div className="content" style={{ height: '100%' }}>
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
      <Box component="footer" sx={{ py: 1, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }} className="app-footer">
        <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: '0.7rem' }}>
          © 2025 中国历史全景 | Chinese Historical Panorama | MIT License
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
