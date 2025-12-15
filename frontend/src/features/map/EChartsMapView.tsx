import { useState } from 'react';
import { EChartsMap } from './components/EChartsMap';
import { DynastyTimeline } from './components/DynastyTimeline';
import { ProvinceData } from './services/mapDataService';
import { Dynasty } from '../../services/culture/types';

export function EChartsMapView() {
  const [selectedProvince, setSelectedProvince] = useState<{
    name: string;
    data: ProvinceData | null;
  } | null>(null);
  const [selectedDynasty, setSelectedDynasty] = useState<Dynasty | null>(null);

  const handleProvinceClick = (name: string, data: ProvinceData | null) => {
    setSelectedProvince({ name, data });
    console.log('点击省份:', name, data);
  };

  const handleDynastySelect = (dynasty: Dynasty) => {
    setSelectedDynasty(dynasty);
    console.log('选择朝代:', dynasty.name, `(${dynasty.startYear} - ${dynasty.endYear})`);
  };

  return (
    <div 
      className="map-container" 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        border: `3px solid ${selectedDynasty?.color || '#1976d2'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease'
      }}
    >
      {/* 地图占满整个容器 */}
      <EChartsMap 
        width="100%" 
        height="100%" 
        onProvinceClick={handleProvinceClick}
      />
      
      {/* 时间轴控件覆盖在地图底部 */}
      <div style={{ 
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 100 
      }}>
        <DynastyTimeline 
          onDynastySelect={handleDynastySelect}
          selectedDynastyId={selectedDynasty?.id}
        />
      </div>
          
      {/* 省份信息面板 */}
      {selectedProvince && selectedProvince.data && (
        <div style={{
          position: 'absolute',
          top: 60,
          right: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          minWidth: '200px',
          zIndex: 100
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>
              {selectedProvince.name}
            </h3>
            <button 
              onClick={() => setSelectedProvince(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <p style={{ margin: '8px 0' }}>
              <span style={{ color: '#999' }}>数值：</span>
              {selectedProvince.data.value}
            </p>
            <p style={{ margin: '8px 0' }}>
              <span style={{ color: '#999' }}>行政代码：</span>
              {selectedProvince.data.adcode || '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
