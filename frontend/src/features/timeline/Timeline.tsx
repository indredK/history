import { useTimelineStore, useEventsStore } from '../../store';
import { getEventsByRange } from '../../services/dataClient';
import { useEffect } from 'react';

export function Timeline() {
  const { startYear, endYear, setYears } = useTimelineStore();
  const { setEvents, setLoading } = useEventsStore();

  const handleDateChange = async (start: number, end: number) => {
    setYears(start, end);
    setLoading(true);
    try {
      const res = await getEventsByRange(start, end);
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleDateChange(startYear, endYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 时间轴组件现在只负责数据加载，不再显示悬浮按钮
  // 年份选择功能已移动到 EventList 组件的标题区域
  return null;
}
