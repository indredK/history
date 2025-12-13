import { useEventsStore } from '../../store';
import { useTimelineStore } from '../../store';
import { useEffect, useRef, useState } from 'react';
import { getEvents } from '../../services/dataClient';
import '../../components/EventList.css';
import { SearchBar } from './components/SearchBar';
import { DynastyDisplay } from './components/DynastyDisplay';
import { Dynasty3DWheel } from './components/Dynasty3DWheel';
import { useEventFilter } from './hooks/useEventFilter';
import { useHoverScroll } from './hooks/useHoverScroll';
import { Timeline, Card, Button, Badge, Space, Typography, Spin, Empty, InputNumber, Popover } from 'antd';
import { StarOutlined, StarFilled, ShareAltOutlined, InfoCircleOutlined, SettingOutlined, CloseOutlined } from '@ant-design/icons';
import type { Event } from '../../types/models';

const { Title, Text, Paragraph } = Typography;

export function EventList() {
  const { loading, setEvents, favorites, toggleFavorite } = useEventsStore();
  const { startYear, endYear, setYears } = useTimelineStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);

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

  const handleDateChange = async (start: number, end: number) => {
    setYears(start, end);
    // 这里可以添加重新获取数据的逻辑
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

  const content = (
    <Space style={{ width: '100%' }} vertical>
      <Space style={{ width: '100%' }} vertical>
        <Text strong>开始年份 (Start)</Text>
        <InputNumber
          min={1000}
          max={2025}
          value={startYear}
          onChange={(value) => value && handleDateChange(value, endYear)}
          style={{ width: '100%' }}
        />
      </Space>
      <Space style={{ width: '100%' }} vertical>
        <Text strong>结束年份 (End)</Text>
        <InputNumber
          min={startYear}
          max={2025}
          value={endYear}
          onChange={(value) => value && handleDateChange(startYear, value)}
          style={{ width: '100%' }}
        />
      </Space>
    </Space>
  );

  return (
    <Card className="event-list-container" title={
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Title level={3} style={{ margin: 0 }}>历史事件</Title>
          <Badge count={filtered.length} style={{ backgroundColor: '#8c1c13' }} />
        </Space>
        <Popover
          content={content}
          title="年份设置"
          trigger="click"
          placement="bottomRight"
          open={showControls}
          onOpenChange={setShowControls}
        >
          <Button
            type="primary"
            icon={showControls ? <CloseOutlined /> : <SettingOutlined />}
            size="small"
          >
            {startYear} - {endYear}
          </Button>
        </Popover>
      </Space>
    }>
      <SearchBar />
      
      <Dynasty3DWheel />
      
      <div className="event-list">
        {filtered.length === 0 ? (
          <Empty description="暂无匹配的历史事件" />
        ) : (
          <div ref={timelineRef} className="timeline-container">
            <Timeline orientation="horizontal">
              {filtered.map((event) => (
                  <Timeline.Item
                    key={event.id}
                    style={{ marginBottom: '24px' }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <Space style={{ width: '100%' }} vertical align="start">
                        <Text strong style={{ fontSize: '16px' }}>
                          {event.startYear}{event.endYear !== event.startYear && ` - ${event.endYear}`}
                        </Text>
                      </Space>
                    </div>
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
