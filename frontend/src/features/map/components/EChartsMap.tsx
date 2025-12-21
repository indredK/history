import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { fetchGeoJson, extractProvinceData, extractCityMarkers, ProvinceData } from '../services/mapDataService';

interface EChartsMapProps {
  width?: number | string;
  height?: number | string;
  onProvinceClick?: (name: string, data: ProvinceData | null) => void;
}

export function EChartsMap({ 
  width = '100%', 
  height = '100%',
  onProvinceClick 
}: EChartsMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const onProvinceClickRef = useRef(onProvinceClick);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 保持回调引用最新
  useEffect(() => {
    onProvinceClickRef.current = onProvinceClick;
  }, [onProvinceClick]);

  // 初始化图表
  useEffect(() => {
    let mounted = true;

    const initChart = async () => {
      // 等待 DOM 挂载
      await new Promise(resolve => setTimeout(resolve, 0));
      
      if (!chartRef.current || !mounted) {
        console.log('chartRef 不可用');
        return;
      }

      try {
        setError(null);
        console.log('开始加载地图数据...');

        // 获取 GeoJSON 数据
        const geoJson = await fetchGeoJson();
        
        if (!mounted || !chartRef.current) return;
        
        // 从 GeoJSON 提取省份和城市数据
        const provinces = extractProvinceData(geoJson);
        const cities = extractCityMarkers(geoJson);
        
        console.log('地图数据加载完成', { 
          features: geoJson?.features?.length,
          provinces: provinces.length 
        });

        // 注册地图
        echarts.registerMap('china', geoJson);

        // 初始化 ECharts 实例
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
        
        chartInstance.current = echarts.init(chartRef.current);

        // 配置项
        const option: echarts.EChartsOption = {
          backgroundColor: 'transparent',
          title: {
            text: '中国地图',
            subtext: '数据来源：模拟数据',
            left: 'center',
            top: 10,
            textStyle: { color: 'var(--color-text-primary, #333)', fontSize: 18 },
            subtextStyle: { color: 'var(--color-text-secondary, #666)', fontSize: 12 }
          },
          tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
              if (params.seriesType === 'map') {
                const data = provinces.find((p: ProvinceData) => p.name === params.name);
                if (data) {
                  return `<div style="padding:8px;"><strong>${params.name}</strong><br/>数值: ${data.value}<br/>行政代码: ${data.adcode || '-'}</div>`;
                }
                return params.name;
              }
              return `${params.name}: ${params.value}`;
            }
          },
          visualMap: {
            min: 0,
            max: 15000,
            left: 20,
            bottom: 20,
            text: ['高', '低'],
            calculable: true,
            inRange: { color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'] },
            textStyle: { color: 'var(--color-text-primary, #333)' }
          },
          geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            scaleLimit: {
              min: 0.8,
              max: 5
            },
            center: [104, 35],
            label: { show: true, fontSize: 10, color: 'var(--color-text-primary, #333)' },
            itemStyle: { areaColor: 'var(--color-bg-surface, #e3f2fd)', borderColor: 'var(--color-primary, #FF3D00)', borderWidth: 1 },
            emphasis: {
              label: { show: true, fontSize: 12, color: 'var(--color-text-primary, #000)' },
              itemStyle: { areaColor: 'var(--color-bg-elevated, #bbdefb)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' }
            },
            select: {
              label: { show: true, color: 'var(--color-text-inverse, #fff)' },
              itemStyle: { areaColor: 'var(--color-primary, #FF3D00)' }
            }
          },
          series: [
            {
              name: '省份数据',
              type: 'map',
              map: 'china',
              geoIndex: 0,
              data: provinces.map((p: ProvinceData) => ({ name: p.name, value: p.value }))
            },
            {
              name: '省会城市',
              type: 'scatter',
              coordinateSystem: 'geo',
              symbol: 'pin',
              symbolSize: (val: number[]) => Math.max((val[2] ?? 0) / 5, 15),
              label: { show: true, position: 'right', formatter: '{b}', fontSize: 10 },
              itemStyle: { color: 'var(--color-error, #f44336)' },
              data: cities.map((c) => ({
                name: c.name,
                value: [...(c.coord || [0, 0]), c.value]
              }))
            }
          ]
        };

        chartInstance.current.setOption(option);

        // 点击事件
        chartInstance.current.on('click', (params: any) => {
          if (params.componentType === 'geo' || params.seriesType === 'map') {
            const data = provinces.find((p: ProvinceData) => p.name === params.name) || null;
            onProvinceClickRef.current?.(params.name, data);
          }
        });

        setLoading(false);
        console.log('地图渲染完成');
      } catch (err) {
        console.error('初始化地图失败:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : '加载地图失败');
          setLoading(false);
        }
      }
    };

    initChart();

    return () => {
      mounted = false;
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // 响应式调整
  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  return (
    <div style={{ width, height, minHeight: 400, position: 'relative' }}>
      {/* 图表容器始终存在 */}
      <div 
        ref={chartRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          visibility: loading || error ? 'hidden' : 'visible'
        }}
      />
      
      {/* 加载状态覆盖层 */}
      {loading && (
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--color-bg-tertiary, #f5f5f5)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: '4px solid var(--color-border-light, #f3f3f3)',
              borderTop: '4px solid var(--color-primary, #FF3D00)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }} />
            <div style={{ color: 'var(--color-text-primary)' }}>加载地图中...</div>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      
      {/* 错误状态 */}
      {error && (
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--color-bg-tertiary, #ffebee)',
          color: 'var(--color-error, #d32f2f)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>⚠️</div>
            <div>地图加载失败</div>
            <div style={{ fontSize: 12, marginTop: 5 }}>{error}</div>
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                marginTop: 10, 
                padding: '8px 16px', 
                background: 'var(--color-primary, #FF3D00)', 
                color: 'var(--color-text-inverse, #fff)', 
                border: 'none', 
                borderRadius: 4, 
                cursor: 'pointer' 
              }}
            >
              重试
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
