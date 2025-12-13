import { useTimelineStore, useEventsStore } from '../../store';
import { getEventsByRange } from '../../services/dataClient';
import '../../components/Timeline.css';
import { useEffect, useState } from 'react';
import { Button, InputNumber, Popover, Typography, Space } from 'antd';
import { SettingOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

export function Timeline() {
  const { startYear, endYear, setYears } = useTimelineStore();
  const { setEvents, setLoading } = useEventsStore();
  const [showControls, setShowControls] = useState(false);

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

  const content = (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text strong>开始年份 (Start)</Text>
        <InputNumber
          min={1000}
          max={2025}
          value={startYear}
          onChange={(value) => value && handleDateChange(value, endYear)}
          style={{ width: '100%' }}
        />
      </Space>
      <Space direction="vertical" style={{ width: '100%' }}>
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
    <div className="timeline-floating-container">
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
          size="middle"
          className="timeline-floating-button"
        >
          {startYear} - {endYear}
        </Button>
      </Popover>
    </div>
  );
}
