import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import * as echarts from 'echarts';
import { StateView } from '@/components/ui';
import type { BoundaryGeoJSON } from '@/services/map/types';

// 朝代配置
interface DynastyConfig {
  id: string;
  name: string;
  file: string;
  period: string;
  color: string;
}

const DYNASTIES: DynastyConfig[] = [
  { id: 'qin', name: '秦朝', file: 'boundaries_qin.geojson', period: '前221年-前206年', color: '#d32f2f' },
  { id: 'han', name: '汉朝', file: 'boundaries_han.geojson', period: '前206年-220年', color: '#c62828' },
  { id: 'three_kingdoms', name: '三国', file: 'boundaries_three_kingdoms.geojson', period: '220年-280年', color: '#e65100' },
  { id: 'jin', name: '晋朝', file: 'boundaries_jin.geojson', period: '266年-420年', color: '#f57c00' },
  { id: 'sui', name: '隋朝', file: 'boundaries_sui.geojson', period: '581年-618年', color: '#fbc02d' },
  { id: 'tang', name: '唐朝', file: 'boundaries_tang.geojson', period: '618年-907年', color: '#ffa000' },
  { id: 'song', name: '宋朝', file: 'boundaries_song.geojson', period: '960年-1279年', color: '#689f38' },
  { id: 'yuan', name: '元朝', file: 'boundaries_yuan.geojson', period: '1271年-1368年', color: '#388e3c' },
  { id: 'ming', name: '明朝', file: 'boundaries_ming.geojson', period: '1368年-1644年', color: '#1976d2' },
  { id: 'qing', name: '清朝', file: 'boundaries_qing.geojson', period: '1644年-1912年', color: '#7b1fa2' },
];

interface DynastyBoundaryMapProps {
  width?: number | string;
  height?: number | string;
  selectedDynastyId?: string | null;
  onDynastyChange?: (dynastyId: string) => void;
}

/**
 * 修复 GeoJSON 中 Polygon 坐标层级错误
 */
function normalizeGeoJSON(geoJSON: BoundaryGeoJSON): BoundaryGeoJSON {
  return {
    ...geoJSON,
    features: geoJSON.features.map((f) => {
      if (f.geometry?.type !== 'Polygon') return f;
      const coords = f.geometry.coordinates;
      if (Array.isArray(coords[0]?.[0]?.[0])) {
        return {
          ...f,
          geometry: {
            type: 'MultiPolygon' as const,
            coordinates: coords as unknown as number[][][][],
          },
        };
      }
      return f;
    }),
  };
}

export function DynastyBoundaryMap({
  width = '100%',
  height = '100%',
  selectedDynastyId: selectedDynastyIdProp,
  onDynastyChange,
}: DynastyBoundaryMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boundaryData, setBoundaryData] = useState<Record<string, BoundaryGeoJSON>>({});
  const [selectedDynastyId, setSelectedDynastyId] = useState<string>(selectedDynastyIdProp || 'qin');

  // 同步外部传入的 selectedDynastyId
  useEffect(() => {
    if (selectedDynastyIdProp && selectedDynastyIdProp !== selectedDynastyId) {
      setSelectedDynastyId(selectedDynastyIdProp);
    }
  }, [selectedDynastyIdProp]);

  // 加载所有朝代疆域数据
  useEffect(() => {
    let mounted = true;

    async function loadAllBoundaries() {
      try {
        setLoading(true);
        setError(null);

        const data: Record<string, BoundaryGeoJSON> = {};

        for (const dynasty of DYNASTIES) {
          try {
            const response = await fetch(`/data/map/boundaries/${dynasty.file}`);
            if (!response.ok) {
              console.warn(`Failed to load ${dynasty.file}`);
              continue;
            }
            const geojson = await response.json();
            data[dynasty.id] = geojson;
          } catch (err) {
            console.warn(`Error loading ${dynasty.file}:`, err);
          }
        }

        if (!mounted) return;

        setBoundaryData(data);
        setLoading(false);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : '加载疆域数据失败');
          setLoading(false);
        }
      }
    }

    loadAllBoundaries();

    return () => {
      mounted = false;
    };
  }, []);

  // 初始化 ECharts
  useEffect(() => {
    if (!chartRef.current || Object.keys(boundaryData).length === 0) return;

    // 合并所有朝代的 GeoJSON 特征
    const allFeatures = Object.values(boundaryData).flatMap((geojson) =>
      normalizeGeoJSON(geojson).features
    );

    const combinedGeoJSON = {
      type: 'FeatureCollection' as const,
      features: allFeatures,
    };

    // 注册地图
    echarts.registerMap('dynasties', combinedGeoJSON as never);

    // 初始化图表
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 响应式调整
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [boundaryData]);

  // 更新图表配置
  useEffect(() => {
    if (!chartInstance.current || Object.keys(boundaryData).length === 0) return;

    const currentDynasty = DYNASTIES.find((d) => d.id === selectedDynastyId);
    const currentData = boundaryData[selectedDynastyId];

    if (!currentData || !currentDynasty) return;

    const normalizedData = normalizeGeoJSON(currentData);

    // 为当前选中的朝代创建 regions 样式
    const regions = normalizedData.features.map((f) => ({
      name: f.properties.name,
      itemStyle: {
        areaColor: `${currentDynasty.color}80`, // 50% 透明度
        borderColor: currentDynasty.color,
        borderWidth: 1.5,
      },
      emphasis: {
        itemStyle: {
          areaColor: `${currentDynasty.color}B3`, // 70% 透明度
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.3)',
        },
      },
    }));

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: `${currentDynasty.name}疆域`,
        subtext: currentDynasty.period,
        left: 'center',
        top: 16,
        textStyle: {
          color: 'var(--color-text-primary, #333)',
          fontSize: 20,
          fontWeight: 'bold',
        },
        subtextStyle: {
          color: 'var(--color-text-secondary, #666)',
          fontSize: 14,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { name?: string; data?: { feature?: { properties: { admin_level?: string; year?: number } } } };
          const feature = normalizedData.features.find((f) => f.properties.name === p.name);
          if (feature) {
            return `<div style="padding:8px;">
              <strong>${feature.properties.name}</strong><br/>
              层级: ${feature.properties.admin_level === 'empire' ? '帝国' : '省份'}<br/>
              年份: ${feature.properties.year}年
            </div>`;
          }
          return p.name || '';
        },
      },
      geo: {
        map: 'dynasties',
        roam: true,
        zoom: 1.2,
        scaleLimit: { min: 0.8, max: 5 },
        center: [104, 35],
        label: {
          show: false,
        },
        itemStyle: {
          areaColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        },
        emphasis: {
          label: { show: false },
          itemStyle: {
            areaColor: 'transparent',
          },
        },
        // 只显示当前选中的朝代疆域
        regions: regions,
      },
    };

    chartInstance.current.setOption(option, true);

    // 点击事件
    chartInstance.current.off('click');
    chartInstance.current.on('click', (params: unknown) => {
      const p = params as { name?: string };
      console.log('Clicked:', p.name);
    });
  }, [boundaryData, selectedDynastyId]);

  // 处理朝代切换
  const handleDynastyChange = useCallback((dynastyId: string) => {
    setSelectedDynastyId(dynastyId);
    onDynastyChange?.(dynastyId);
  }, [onDynastyChange]);

  return (
    <div style={{ width, height, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* 朝代选择器 */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 100,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          maxWidth: 'calc(100% - 32px)',
        }}
      >
        {DYNASTIES.map((dynasty) => (
          <button
            key={dynasty.id}
            onClick={() => handleDynastyChange(dynasty.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: selectedDynastyId === dynasty.id ? 'bold' : 'normal',
              backgroundColor:
                selectedDynastyId === dynasty.id ? dynasty.color : 'rgba(255,255,255,0.9)',
              color: selectedDynastyId === dynasty.id ? '#fff' : '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
            }}
          >
            {dynasty.name}
          </button>
        ))}
      </Box>

      {/* 地图容器 */}
      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: '100%',
          visibility: loading || error ? 'hidden' : 'visible',
        }}
      />

      {/* 加载状态 */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-tertiary, #f5f5f5)',
          }}
        >
          <StateView mode="loading" title="正在加载疆域数据..." />
        </Box>
      )}

      {/* 错误状态 */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-tertiary, #ffebee)',
          }}
        >
          <StateView
            mode="error"
            title="加载失败"
            description={error}
            actionLabel="重试"
            onAction={() => window.location.reload()}
          />
        </Box>
      )}
    </div>
  );
}

export { DYNASTIES };
export type { DynastyConfig };
