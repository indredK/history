import { useRef, useState } from 'react';
import { useRequest } from 'ahooks';
import { StateView } from '@/components/ui';

import { getEvents } from '@/services/dataClient';
import { TimelineChart } from './TimelineChart';
import type { TimelineChartRef } from '../types';
import type { Event } from '@/services/timeline/types';
import '../styles/D3Timeline.scss';

interface D3TimelineProps {
  focusRange?: [number, number] | null;
  focusLabel?: string | null;
  onTimeRangeChange?: (range: [number, number]) => void;
}

export function D3Timeline({ focusRange, focusLabel, onTimeRangeChange }: D3TimelineProps) {
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

  const handleZoomIn = () => chartRef.current?.zoomIn();
  const handleZoomOut = () => chartRef.current?.zoomOut();
  const handleResetZoom = () => chartRef.current?.resetZoom();
  const handlePanLeft = () => chartRef.current?.panLeft();
  const handlePanRight = () => chartRef.current?.panRight();

  if (loading) {
    return (
      <StateView
        mode="loading"
        title="正在加载历史事件数据..."
        description="整理事件索引与时间刻度。"
        minHeight="100%"
      />
    );
  }

  if (events.length === 0) {
    return (
      <StateView
        mode="empty"
        title="暂无匹配的历史事件"
        description="调整朝代或稍后重试。"
        minHeight="100%"
      />
    );
  }

  return (
    <TimelineChart
      ref={chartRef}
      events={events}
      favorites={favorites}
      focusRange={focusRange}
      focusLabel={focusLabel}
      onZoomChange={setZoomLevel}
      zoomLevel={zoomLevel}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onResetZoom={handleResetZoom}
      onPanLeft={handlePanLeft}
      onPanRight={handlePanRight}
      onTimeRangeChange={onTimeRangeChange}
    />
  );
}
