import { useRef, useState } from 'react';
import { useRequest } from 'ahooks';
import { Box, Typography } from '@mui/material';

import { getEvents } from '@/services/dataClient';
import { TimelineChart } from './TimelineChart';
import type { TimelineChartRef } from '../types';
import type { Event } from '@/services/timeline/types';
import '../styles/D3Timeline.css';

export function D3Timeline() {
  const chartRef = useRef<TimelineChartRef>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [favorites] = useState<string[]>([]);

  // 使用ahooks的useRequest获取数据
  const { loading } = useRequest(
    async () => {
      const result = await getEvents();
      return result.data;
    },
    {
      cacheKey: 'events_all',
      manual: false,
      onSuccess: (data) => setEvents(data)
    }
  );

  // 缩放控制函数
  const handleZoomIn = () => chartRef.current?.zoomIn();
  const handleZoomOut = () => chartRef.current?.zoomOut();
  const handleResetZoom = () => chartRef.current?.resetZoom();
  
  // 滚动控制函数
  const handlePanLeft = () => chartRef.current?.panLeft();
  const handlePanRight = () => chartRef.current?.panRight();

  // 如果正在加载或没有数据，显示相应状态
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          正在加载历史事件数据...
        </Typography>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          暂无匹配的历史事件
        </Typography>
      </Box>
    );
  }

  return (
    <TimelineChart
      ref={chartRef}
      events={events}
      favorites={favorites}
      onZoomChange={setZoomLevel}
      zoomLevel={zoomLevel}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onResetZoom={handleResetZoom}
      onPanLeft={handlePanLeft}
      onPanRight={handlePanRight}
    />
  );
}