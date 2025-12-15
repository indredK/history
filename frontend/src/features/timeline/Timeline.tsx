import { useTimelineStore, useEventsStore } from '../../store';
import { getEventsByRange } from '../../services/dataClient';
import { useEffect } from 'react';
import { useRequest } from 'ahooks';

export function Timeline() {
  const { startYear, endYear } = useTimelineStore();
  const { setEvents } = useEventsStore();

  // 使用ahooks的useRequest获取数据
  useRequest(
    async () => {
      const result = await getEventsByRange(startYear, endYear);
      return result.data;
    },
    {
      cacheKey: `events_${startYear}_${endYear}`,
      manual: false, // enabled: true -> manual: false
      onSuccess: (data) => setEvents(data)
    }
  );

  useEffect(() => {
    // 初始加载已由useRequest处理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 时间轴组件现在只负责数据加载，不再显示悬浮按钮
  // 年份选择功能已移动到 EventList 组件的标题区域
  return null;
}
