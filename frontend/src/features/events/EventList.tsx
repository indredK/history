import { useEventsStore } from '../../store';
import { useEffect, useRef } from 'react';
import { getEvents } from '../../services/dataClient';
import '../../components/EventList.css';
import { SearchBar } from './components/SearchBar';
import { useEventFilter } from './hooks/useEventFilter';
import { useHoverScroll } from './hooks/useHoverScroll';
import { Timeline, Card, Button, Badge, Space, Typography, Spin, Empty } from 'antd';
import { StarOutlined, StarFilled, ShareAltOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { Event } from '../../types/models';

const { Title, Text, Paragraph } = Typography;

export function EventList() {
  const { loading, setEvents, favorites, toggleFavorite } = useEventsStore();
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getEvents().then((res) => {
      const items = Array.isArray(res.data) ? res.data : res.data.items;
      if (items && items.length > 0) setEvents(items);
    });
  }, []);

  const filtered = useEventFilter();
  
  // 使用自定义Hook处理悬停滚动，只在有数据且加载完成后启用
  useHoverScroll<HTMLDivElement>(timelineRef, {
    easing: 0.1,
    enabled: !loading && filtered.length > 0,
    onScrollChange: (currentScroll, targetScroll) => {
      // 调试信息
      console.log('鼠标悬停滚动:', {
        currentScroll,
        targetScroll,
        progress: (currentScroll / (timelineRef.current?.scrollWidth || 1)) * 100
      });
    }
  });
  
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div>
          <Spin size="large" />
          <div style={{ marginTop: 16, textAlign: 'center' }}>加载历史事件中...</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="event-list-container" title={
      <Space>
        <Title level={3} style={{ margin: 0 }}>历史事件</Title>
        <Badge count={filtered.length} style={{ backgroundColor: '#8c1c13' }} />
      </Space>
    }>
      <SearchBar />
      
      <div className="event-list">
        {filtered.length === 0 ? (
          <Empty description="暂无匹配的历史事件" />
        ) : (
          <div ref={timelineRef} className="timeline-container">
            <Timeline orientation="horizontal">
              {filtered.map((event) => (
                  <Timeline.Item
                    key={event.id}
                    label={
                      <Space direction="vertical" align="start">
                        <Text strong style={{ fontSize: '16px' }}>
                          {event.startYear}{event.endYear !== event.startYear && ` - ${event.endYear}`}
                        </Text>
                      </Space>
                    }
                    style={{ marginBottom: '24px' }}
                  >
                    <Card size="small" title={event.title} extra={
                      <Space>
                        <Button
                          type="text"
                          icon={favorites.includes(event.id) ? <StarFilled style={{ color: '#ffd700' }} /> : <StarOutlined />}
                          onClick={() => toggleFavorite(event.id)}
                          size="small"
                        />
                        <Button
                          type="text"
                          icon={<ShareAltOutlined />}
                          onClick={() => handleShare(event)}
                          size="small"
                        />
                      </Space>
                    }>
                      <Paragraph ellipsis={{ rows: 3 }}>{event.description}</Paragraph>
                      {event.startDate && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <InfoCircleOutlined style={{ marginRight: '4px' }} />{event.startDate}
                        </Text>
                      )}
                    </Card>
                  </Timeline.Item>
                ))}
            </Timeline>
          </div>
        )}
      </div>
      

    </Card>
  );
}
