import { useState, useEffect } from 'react';
import { DeckGL } from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { useMapStore } from '../../store/mapStore';
import { TimelineSlider } from './components/TimelineSlider';
import './MapView.css';

export function MapView() {
  const [currentYear, setCurrentYear] = useState(-221);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const {
    latitude,
    longitude,
    zoom,
    bearing,
    pitch,
    setViewport
  } = useMapStore();

  // 初始化地图
  useEffect(() => {
    console.log('MapView 初始化开始');
    console.log('当前视图状态:', { latitude, longitude, zoom, bearing, pitch });
    
    // 简单的初始化延迟，确保组件完全挂载
    const timer = setTimeout(() => {
      console.log('MapView 初始化完成');
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [latitude, longitude, zoom, bearing, pitch]);

  // 显示加载状态
  if (!isInitialized) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>地图初始化中...</p>
      </div>
    );
  }

  // 视图状态处理
  const handleViewStateChange = ({ viewState }: any) => {
    setViewport({
      latitude: viewState.latitude,
      longitude: viewState.longitude,
      zoom: viewState.zoom,
      bearing: viewState.bearing || 0,
      pitch: viewState.pitch || 0
    });
  };

  // 创建基础地图图层
  const layers = [
    new TileLayer({
      id: 'base-map',
      data: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: (props: any) => {
        const {
          bbox: { west, south, east, north }
        } = props.tile;

        return new BitmapLayer(props, {
          image: props.data,
          bounds: [west, south, east, north]
        });
      }
    })
  ];

  // 渲染地图内容
  const renderMapContent = () => {
    if (hasError) {
      return (
        <div className="map-fallback">
          <div className="map-placeholder">
            <h3>地图视图</h3>
            <p>纬度: {latitude.toFixed(2)}</p>
            <p>经度: {longitude.toFixed(2)}</p>
            <p>缩放级别: {zoom}</p>
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={() => setViewport({ latitude: 39.9042, longitude: 116.4074, zoom: 10 })}
                style={{ margin: '0.5rem', padding: '0.5rem 1rem', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                北京
              </button>
              <button 
                onClick={() => setViewport({ latitude: 34.34, longitude: 108.95, zoom: 10 })}
                style={{ margin: '0.5rem', padding: '0.5rem 1rem', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                长安
              </button>
              <button 
                onClick={() => setViewport({ latitude: 31.2304, longitude: 121.4737, zoom: 10 })}
                style={{ margin: '0.5rem', padding: '0.5rem 1rem', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                上海
              </button>
            </div>
            <button 
              onClick={() => {
                setHasError(false);
                setIsInitialized(false);
                setTimeout(() => setIsInitialized(true), 100);
              }}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              重试加载地图
            </button>
          </div>
        </div>
      );
    }

    try {
      return (
        <DeckGL
          initialViewState={{
            latitude,
            longitude,
            zoom,
            bearing: bearing || 0,
            pitch: pitch || 0
          }}
          controller={{
            dragPan: true,
            dragRotate: true,
            scrollZoom: true,
            touchZoom: true,
            touchRotate: true,
            keyboard: true,
            doubleClickZoom: true
          }}
          layers={layers}
          onViewStateChange={handleViewStateChange}
          onError={(error) => {
            console.error('DeckGL 错误:', error);
            setHasError(true);
          }}
          onLoad={() => {
            console.log('DeckGL 加载完成');
          }}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      );
    } catch (error) {
      console.error('DeckGL 渲染错误:', error);
      setHasError(true);
      return null;
    }
  };
  
  return (
    <div className="map-container">
      <div className="map-content">
        <div className="map-display-area">
          {renderMapContent()}
        </div>
      </div>
      
      <div className="timeline-area">
        <TimelineSlider
          currentYear={currentYear}
          onYearChange={setCurrentYear}
        />
      </div>
    </div>
  );
}