import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import * as echarts from 'echarts';
import type { MapSeriesOption, ScatterSeriesOption } from 'echarts';
import type { Event } from '@/services/timeline/types';
import { mapDataService } from '@/services/map/mapDataService';
import type {
  BoundaryGeoJSON,
  GeoJsonData,
  Place,
  ProvinceData,
} from '@/services/map/types';
import { StateView } from '@/components/ui';

export interface EChartsMapLayerVisibility {
  adminBoundaryVisible?: boolean;    // default true
  adminBoundaryOpacity?: number;     // default 0.3
  dynastyBoundaryVisible?: boolean;  // default true
  dynastyBoundaryOpacity?: number;   // default 0.8
  eventMarkersVisible?: boolean;     // default true
}

interface EChartsMapProps extends EChartsMapLayerVisibility {
  width?: number | string;
  height?: number | string;
  onProvinceClick?: (name: string, data: ProvinceData | null) => void;
  historicalBoundary?: BoundaryGeoJSON | null;
  historicalBoundaryName?: string | null;
  eventPlaces?: Array<Place & { event?: Event }>;
  loadingHistoricalBoundary?: boolean;
  onEventMarkerClick?: (event: Event) => void;
}

interface TooltipPayload {
  seriesType?: string | undefined;
  name?: string | undefined;
  data?:
    | {
        place?: Place | undefined;
        event?: Event | undefined;
        feature?: BoundaryGeoJSON['features'][number] | undefined;
      }
    | undefined;
}

export function EChartsMap({
  width = '100%',
  height = '100%',
  onProvinceClick,
  historicalBoundary = null,
  historicalBoundaryName = null,
  eventPlaces = [],
  loadingHistoricalBoundary = false,
  onEventMarkerClick,
  adminBoundaryVisible = true,
  adminBoundaryOpacity = 0.3,
  dynastyBoundaryVisible = true,
  dynastyBoundaryOpacity = 0.8,
  eventMarkersVisible = true,
}: EChartsMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const onProvinceClickRef = useRef(onProvinceClick);
  const [chinaGeoJson, setChinaGeoJson] = useState<GeoJsonData | null>(null);
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // 保持回调引用最新
  useEffect(() => {
    onProvinceClickRef.current = onProvinceClick;
  }, [onProvinceClick]);

  const historicalMapKey = useMemo(() => {
    if (!historicalBoundary) return null;
    return [
      'historical',
      historicalBoundary.period,
      historicalBoundary.valid_from,
      historicalBoundary.valid_to,
    ]
      .join('_')
      .replace(/[^a-zA-Z0-9_]/g, '_');
  }, [historicalBoundary]);

  const markerData = useMemo(
    () =>
      eventMarkersVisible
        ? eventPlaces
            .filter((place) => place.location?.coordinates)
            .map((place) => ({
              name: place.canonical_name,
              value: [
                place.location!.coordinates[0],
                place.location!.coordinates[1],
                80,
              ],
              place,
              event: place.event,
            }))
        : [],
    [eventMarkersVisible, eventPlaces],
  );

  const initBaseMap = useCallback(async (mounted: () => boolean) => {
    try {
      setLoading(true);
      setError(null);

      const [geoJson, provinceData] = await Promise.all([
        mapDataService.loadChinaGeoJson(),
        mapDataService.loadProvinceData(),
      ]);

      if (!mounted()) return;
      setChinaGeoJson(geoJson);
      setProvinces(provinceData);
      setLoading(false);
    } catch (err) {
      if (mounted()) {
        setError(err instanceof Error ? err.message : '加载地图失败');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    initBaseMap(() => mounted);

    return () => {
      mounted = false;
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [initBaseMap, reloadKey]);

  useEffect(() => {
    if (!chartRef.current || !chinaGeoJson) return;

    echarts.registerMap('china', chinaGeoJson as never);
    if (historicalBoundary && historicalMapKey) {
      echarts.registerMap(historicalMapKey, historicalBoundary as never);
    }

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;
    const showHistoricalBoundary =
      Boolean(historicalBoundary && historicalMapKey) && dynastyBoundaryVisible;
    const showModernBoundary = !showHistoricalBoundary && adminBoundaryVisible;
    const activeMapKey = showHistoricalBoundary ? historicalMapKey! : 'china';
    const activeMapName = showHistoricalBoundary
      ? historicalBoundaryName || '历史疆域'
      : '中国地图';
    const modernAreaOpacity = showModernBoundary
      ? 0.12 + adminBoundaryOpacity * 0.45
      : 0;
    const modernBorderOpacity = showModernBoundary
      ? Math.max(adminBoundaryOpacity, 0.18)
      : 0;
    const historicalAreaOpacity = 0.12 + dynastyBoundaryOpacity * 0.28;
    const historicalBorderOpacity = Math.max(dynastyBoundaryOpacity, 0.28);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: activeMapName,
        subtext: showHistoricalBoundary
          ? `年份切片：${historicalBoundary?.valid_from ?? '-'} - ${historicalBoundary?.valid_to ?? '-'}`
          : showModernBoundary
            ? '现代行政区底图'
            : '现代行政区已隐藏',
        left: 'center',
        top: 10,
        textStyle: { color: 'var(--color-text-primary, #333)', fontSize: 18 },
        subtextStyle: { color: 'var(--color-text-secondary, #666)', fontSize: 12 },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const payload = params as TooltipPayload;
          if (payload.seriesType === 'scatter' && payload.data?.place) {
            const eventLine = payload.data.event?.title
              ? `<br/>事件：${payload.data.event.title}`
              : '';
            return `<div style="padding:8px;"><strong>${payload.data.place.canonical_name}</strong><br/>事件地点${eventLine}</div>`;
          }

          if (showHistoricalBoundary) {
            const feature = historicalBoundary?.features.find(
              (item) => item.properties.name === payload.name,
            );
            if (feature) {
              return `<div style="padding:8px;"><strong>${feature.properties.name}</strong><br/>层级: ${feature.properties.admin_level}<br/>年份: ${feature.properties.year}</div>`;
            }
            return payload.name ?? '';
          }

          const province = provinces.find((item) => item.name === payload.name);
          if (province) {
            return `<div style="padding:8px;"><strong>${province.name}</strong><br/>数值: ${province.value}<br/>行政代码: ${province.adcode || '-'}</div>`;
          }
          return payload.name ?? '';
        },
      },
      ...(showHistoricalBoundary
        ? {}
        : showModernBoundary
          ? {
              visualMap: {
                min: 0,
                max: 15000,
                left: 20,
            bottom: 20,
            text: ['高', '低'],
                calculable: true,
                inRange: { color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'] },
                textStyle: { color: 'var(--color-text-primary, #333)' },
              },
            }
          : {}),
      geo: {
        map: activeMapKey,
        roam: true,
        zoom: showHistoricalBoundary ? 1.08 : 1.2,
        scaleLimit: {
          min: 0.8,
          max: 5,
        },
        center: [104, 35],
        label: {
          show: showHistoricalBoundary || showModernBoundary,
          fontSize: 10,
          color: 'var(--color-text-primary, #333)',
        },
        itemStyle: showHistoricalBoundary
          ? {
              areaColor: `rgba(214, 127, 88, ${historicalAreaOpacity})`,
              borderColor: `rgba(149, 48, 30, ${historicalBorderOpacity})`,
              borderWidth: 0.8 + dynastyBoundaryOpacity * 0.8,
            }
          : {
              areaColor: `rgba(227, 242, 253, ${modernAreaOpacity})`,
              borderColor: `rgba(255, 61, 0, ${modernBorderOpacity})`,
              borderWidth: 1,
            },
        emphasis: {
          label: {
            show: showHistoricalBoundary || showModernBoundary,
            fontSize: 12,
            color: 'var(--color-text-primary, #000)',
          },
          itemStyle: showHistoricalBoundary
            ? {
                areaColor: `rgba(222, 125, 72, ${Math.min(historicalAreaOpacity + 0.12, 0.58)})`,
                shadowBlur: 10,
                shadowColor: 'rgba(0,0,0,0.28)',
              }
            : {
                areaColor: `rgba(187, 222, 251, ${Math.min(modernAreaOpacity + 0.16, 0.7)})`,
                shadowBlur: 10,
                shadowColor: 'rgba(0,0,0,0.3)',
              },
        },
      },
      series: [
        {
          name: showHistoricalBoundary ? '历史疆域' : '省份数据',
          type: 'map',
          map: activeMapKey,
          geoIndex: 0,
          data: showHistoricalBoundary
            ? historicalBoundary?.features.map((feature, index) => ({
                name: feature.properties.name,
                value: index + 1,
                feature,
              })) ?? []
            : showModernBoundary
              ? provinces.map((province) => ({ name: province.name, value: province.value }))
              : [],
          selectedMode: false,
        } satisfies MapSeriesOption,
        ...(markerData.length > 0
          ? [
              {
                name: '事件地点',
                type: 'scatter' as const,
                coordinateSystem: 'geo' as const,
                symbol: 'pin',
                symbolSize: (value: number[]) => Math.max((value[2] ?? 0) / 5, 16),
                label: {
                  show: true,
                  position: 'right',
                  formatter: '{b}',
                  fontSize: 10,
                },
                itemStyle: {
                  color: '#f97316',
                  shadowColor: 'rgba(249, 115, 22, 0.45)',
                  shadowBlur: 8,
                },
                data: markerData,
                z: 20,
              } satisfies ScatterSeriesOption,
            ]
          : []),
      ],
    };

    chart.setOption(option, true);
    chart.off('click');
    chart.on('click', (params: unknown) => {
      const eventParams = params as {
        componentType?: string | undefined;
        seriesType?: string | undefined;
        name?: string | undefined;
        data?: { event?: Event | undefined } | undefined;
      };
      if (eventParams.seriesType === 'scatter') {
        if (eventParams.data?.event) {
          onEventMarkerClick?.(eventParams.data.event);
        }
        return;
      }
      if (eventParams.componentType === 'geo' || eventParams.seriesType === 'map') {
        if (!showHistoricalBoundary && !showModernBoundary) return;
        const data = showHistoricalBoundary
          ? null
          : provinces.find((item) => item.name === eventParams.name) || null;
        onProvinceClickRef.current?.(eventParams.name ?? '', data);
      }
    });
  }, [
    adminBoundaryOpacity,
    adminBoundaryVisible,
    chinaGeoJson,
    dynastyBoundaryOpacity,
    dynastyBoundaryVisible,
    eventMarkersVisible,
    historicalBoundary,
    historicalMapKey,
    historicalBoundaryName,
    markerData,
    onEventMarkerClick,
    provinces,
  ]);

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
        <Box sx={{ position: 'absolute', inset: 0, background: 'var(--color-bg-tertiary, #f5f5f5)' }}>
          <StateView mode="loading" title="加载地图中..." />
        </Box>
      )}

      {!loading && loadingHistoricalBoundary && (
        <Box
          sx={{
            position: 'absolute',
            right: 16,
            bottom: 120,
            px: 1.5,
            py: 0.75,
            borderRadius: '999px',
            background: 'rgba(15, 23, 42, 0.72)',
            color: '#f8fafc',
            fontSize: 12,
          }}
        >
          正在切换疆域...
        </Box>
      )}
      
      {/* 错误状态 */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'var(--color-bg-tertiary, #ffebee)',
            color: 'var(--color-error, #d32f2f)',
          }}
        >
          <StateView
            mode="error"
            title="地图加载失败"
            description={error}
            actionLabel="重试"
            onAction={() => setReloadKey((current) => current + 1)}
          />
        </Box>
      )}
    </div>
  );
}
