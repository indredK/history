import { useState } from 'react';
import { Timeline } from './features/timeline/Timeline';
import { MapView } from './features/map/MapView';
import { EventList } from './features/events/EventList';
import './App.css';
import './styles/ui.css';
import { getDataSource } from './config/env';
import { Layout, Button, Badge, Typography, Space } from 'antd';
import { HistoryOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'map'>('timeline');

  return (
    <Layout className="app">
      <Header className="app-header">
        <Space
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 2,
          }}
        >
          <Badge
            status={getDataSource() === 'mock' ? 'processing' : 'default'}
            text={getDataSource() === 'mock' ? 'Mock 模式' : 'API 模式'}
          />
        </Space>
        <div className="app-header-content">
          <Title level={2} style={{ color: '#fff', margin: 0 }}>中国历史全景</Title>
        </div>
      </Header>

      <Content className="app-main">
        <Space style={{ padding: '16px' }}>
          <Button
            type={activeTab === 'timeline' ? 'primary' : 'default'}
            icon={<HistoryOutlined />}
            onClick={() => setActiveTab('timeline')}
          >
            时间轴
          </Button>
          <Button
            type={activeTab === 'map' ? 'primary' : 'default'}
            icon={<EnvironmentOutlined />}
            onClick={() => setActiveTab('map')}
          >
            地图
          </Button>
        </Space>
        <div className="content" style={{ flex: 1, overflow: 'hidden', padding: '0 16px 16px 16px' }}>
          {activeTab === 'map' ? (
            <MapView />
          ) : (
            <>
              <Timeline />
              <EventList />
            </>
          )}
        </div>
      </Content>

      <Footer className="app-footer">
        <Text>&copy; 2025 中国历史全景 | Chinese Historical Panorama | MIT License</Text>
      </Footer>
    </Layout>
  );
}

export default App;
