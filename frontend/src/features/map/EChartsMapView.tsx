import { useState } from 'react';
import { EChartsMap } from './components/EChartsMap';
import { DynastyTimeline } from './components/DynastyTimeline';
import { ProvinceData } from './services/mapDataService';
import { Dynasty } from '@/services/culture/types';

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
      className="map-container glass-card" 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        border: `1px solid rgba(255, 255, 255, 0.18)`,
        borderLeft: `4px solid ${selectedDynasty?.color || 'rgba(25, 118, 210, 0.8)'}`,
        borderRadius: 'var(--glass-radius-lg, 16px)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))',
        backdropFilter: 'blur(var(--glass-blur-light, 12px))',
        WebkitBackdropFilter: 'blur(var(--glass-blur-light, 12px))',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        boxShadow: 'var(--glass-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.12))'
      }}
    >
      {/* 地图占满整个容器 */}
      <EChartsMap 
        width="100%" 
        height="100%" 
        onProvinceClick={handleProvinceClick}
      />
      
      {/* 时间轴控件覆盖在地图底部 - 毛玻璃效果 */}
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
          
      {/* 省份信息面板 - 毛玻璃效果 */}
      {selectedProvince && selectedProvince.data && (
        <div 
          className="glass-card"
          style={{
            position: 'absolute',
            top: 60,
            right: 20,
            background: 'rgba(255, 255, 255, var(--glass-card-bg-opacity, 0.6))',
            backdropFilter: 'blur(var(--glass-card-blur, 12px))',
            WebkitBackdropFilter: 'blur(var(--glass-card-blur, 12px))',
            padding: '16px',
            borderRadius: 'var(--glass-radius-lg, 16px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: 'var(--glass-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.12))',
            minWidth: '200px',
            zIndex: 100,
            transition: 'all var(--glass-duration-normal, 250ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              {selectedProvince.name}
            </h3>
            <button 
              onClick={() => setSelectedProvince(null)}
              className="glass-button-icon"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--glass-radius-full, 9999px)',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#555',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--glass-duration-hover, 150ms) var(--glass-easing, cubic-bezier(0.4, 0, 0.2, 1))'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '14px', color: '#555' }}>
            <p style={{ 
              margin: '8px 0',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 'var(--glass-radius-sm, 8px)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}>
              <span style={{ color: '#777' }}>数值：</span>
              {selectedProvince.data.value}
            </p>
            <p style={{ 
              margin: '8px 0',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 'var(--glass-radius-sm, 8px)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}>
              <span style={{ color: '#777' }}>行政代码：</span>
              {selectedProvince.data.adcode || '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
