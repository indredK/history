import { useEventsStore } from '../../store';
import { getEvents } from '../../services/dataClient';
import { useRequest } from 'ahooks';
import './EventList.css';

import { Dynasty3DWheel } from './components/Dynasty3DWheel';
import { useEventFilter } from './hooks/useEventFilter';
import { HoverScrollContainer } from '../../components/HoverScrollContainer';
import { Box, Paper, Button, Typography } from '@mui/material';
import { StarOutline, Star, Share, Info } from '@mui/icons-material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import type { Event } from '../../services/timeline/types';

export function EventList() {
  const { setEvents, favorites, toggleFavorite } = useEventsStore();

  // 使用ahooks的useRequest获取数据
  useRequest(
    async () => {
      const result = await getEvents();
      return result.data;
    },
    {
      cacheKey: 'events_all',
      manual: false, // enabled: true -> manual: false
      onSuccess: (events) => setEvents(events)
    }
  );

  const filtered = useEventFilter();
  
  const handleShare = (event: Event) => {
    const data = {
      title: event.title,
      text: event.description ?? '',
      url: location.href,
    } as any;
    if (navigator.share) {
      navigator.share(data);
    } else {
      navigator.clipboard.writeText(`${event.title} - ${location.href}`);
    }
  };

  return (
    <Paper className="event-list-container animate__animated animate__fadeIn" sx={{ padding: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(10px)', boxShadow: 'none' }}>

      
      {/* 上下布局容器 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2, overflow: 'hidden' }}>
        {/* 朝代选择区域 */}
        <Paper sx={{ padding: 2, overflow: 'hidden', maxHeight: '30vh', backgroundColor: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(10px)', boxShadow: 'none' }}>
          <Dynasty3DWheel />
        </Paper>
        
        {/* 事件时间轴区域 */}
        <Paper sx={{ flex: 1, padding: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(10px)', boxShadow: 'none' }}>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', padding: 4, color: '#666', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              暂无匹配的历史事件
            </Box>
          ) : (
            <HoverScrollContainer
              containerClassName="timeline-container"
              hoverScrollOptions={{
                easing: 0.08,
                enabled: filtered.length > 0,
                scrollbarAreaHeight: 16
              }}
            >
              <Timeline position="alternate" sx={{ flexDirection: 'row', display: 'flex' }}>
                {filtered.map((event) => (
                  <TimelineItem key={event.id} sx={{ flexShrink: 0, minWidth: '250px' }}>
                    <TimelineSeparator>
                      <TimelineDot sx={{ bgcolor: '#8c1c13' }} />
                      <TimelineConnector sx={{ bgcolor: '#8c1c13', height: '2px' }} />
                    </TimelineSeparator>
                    <TimelineContent sx={{ padding: '0 16px', textAlign: 'center' }}>
                      <Box sx={{ marginBottom: '8px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                          {event.startYear}{event.endYear !== event.startYear && ` - ${event.endYear}`}
                        </Typography>
                      </Box>
                      <Paper elevation={2} sx={{ padding: 2, minWidth: '200px', position: 'relative', zIndex: 0, backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }} className="animate__animated animate__fadeInLeft">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 1, textAlign: 'center' }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" sx={{ marginBottom: 2, textAlign: 'center', minHeight: '40px' }}>
                          {event.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, marginTop: 1 }}>
                          <Button
                            size="small"
                            startIcon={favorites.includes(event.id) ? <Star sx={{ color: '#ffd700' }} /> : <StarOutline />}
                            onClick={() => toggleFavorite(event.id)}
                            sx={{ minWidth: 'auto', padding: '4px' }}
                          />
                          <Button
                            size="small"
                            startIcon={<Share />}
                            onClick={() => handleShare(event)}
                            sx={{ minWidth: 'auto', padding: '4px' }}
                          />
                        </Box>
                        {event.startDate && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', marginTop: 1 }}>
                            <Info fontSize="small" />
                            {event.startDate}
                          </Typography>
                        )}
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </HoverScrollContainer>
          )}
        </Paper>
      </Box>
    </Paper>
  );
}
