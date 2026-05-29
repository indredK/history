import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import * as echarts from 'echarts';
import type { ScatterSeriesOption } from 'echarts';
import type { Event } from '@/services/timeline/types';
import { mapDataService } from '@/services/map/mapDataService';
import type {
  BoundaryFeature,
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
  showTitle?: boolean;
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

/**
 * 修复 GeoJSON 中 Polygon 坐标层级错误
 * 部分数据中 Polygon 实际为 4 层嵌套（[[[[x,y],...]]]），应为 3 层，实为 MultiPolygon
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
            coordinates: f.geometry.coordinates as BoundaryFeature['geometry']['coordinates'],
          },
        } as BoundaryFeature;
      }
      return f;
    }),
  };
}

export function EChartsMap({
  width = '100%',
  height = '100%',
  showTitle = true,
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

  const showHistoricalOverlay = Boolean(historicalBoundary && historicalMapKey) && dynastyBoundaryVisible;

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

    // ── 注册合并地图 ──
    // 有历史疆域时：将疆域特征合并到底图 GeoJSON 中一起注册
    // 这样所有特征共享同一个 geo 坐标系，roam/zoom 完全同步
    const mapData = showHistoricalOverlay && historicalBoundary
      ? {
          ...chinaGeoJson,
          features: [
            ...chinaGeoJson.features,
            ...normalizeGeoJSON(historicalBoundary).features,
          ],
        }
      : chinaGeoJson;

    echarts.registerMap('china', mapData as never);

    // 初始化 chart 实例（仅首次）
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // ── 透明度参数 ──
    // 有历史疆域叠加时：现代底图大幅淡化作为背景参考，历史疆域突出显示
    const modernAreaOpacity = showHistoricalOverlay
      ? 0.04  // 历史叠加时现代底色几乎隐去
      : adminBoundaryVisible
        ? 0.12 + adminBoundaryOpacity * 0.45
        : 0;
    const modernBorderOpacity = showHistoricalOverlay
      ? 0.08  // 历史叠加时现代边界半隐
      : adminBoundaryVisible
        ? Math.max(adminBoundaryOpacity, 0.18)
        : 0;
    const historicalAreaOpacity = 0.35 + dynastyBoundaryOpacity * 0.35;   // 更实
    const historicalBorderOpacity = Math.max(dynastyBoundaryOpacity, 0.5); // 边框更明显

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      ...(showTitle
        ? {
            title: {
              text: showHistoricalOverlay
                ? (historicalBoundaryName || '历史疆域')
                : '中国地图',
              subtext: showHistoricalOverlay
                ? `年份切片：${historicalBoundary?.valid_from ?? '-'} - ${historicalBoundary?.valid_to ?? '-'}`
                : (adminBoundaryVisible ? '现代行政区底图' : ''),
              left: 'center',
              top: 10,
              textStyle: { color: 'var(--color-text-primary, #333)', fontSize: 18 },
              subtextStyle: { color: 'var(--color-text-secondary, #666)', fontSize: 12 },
            },
          }
        : {}),
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

          // 历史疆域特征提示
          if (showHistoricalOverlay) {
            const feature = historicalBoundary?.features.find(
              (item) => item.properties.name === payload.name,
            );
            if (feature) {
              return `<div style="padding:8px;"><strong>${feature.properties.name}</strong><br/>层级: ${feature.properties.admin_level}<br/>年份: ${feature.properties.year}</div>`;
            }
          }

          // 现代省份提示
          const province = provinces.find((item) => item.name === payload.name);
          if (province) {
            return `<div style="padding:8px;"><strong>${province.name}</strong><br/>数值: ${province.value}<br/>行政代码: ${province.adcode || '-'}</div>`;
          }
          return payload.name ?? '';
        },
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        scaleLimit: { min: 0.8, max: 5 },
        center: [104, 35],
        label: {
          show: adminBoundaryVisible && !showHistoricalOverlay,
          fontSize: 10,
          color: 'var(--color-text-primary, #333)',
        },
        itemStyle: {
          areaColor: `rgba(227, 242, 253, ${modernAreaOpacity})`,
          borderColor: `rgba(255, 61, 0, ${modernBorderOpacity})`,
          borderWidth: adminBoundaryVisible ? 1 : 0,
        },
        emphasis: {
          label: { show: true, fontSize: 12 },
          itemStyle: {
            areaColor: `rgba(187, 222, 251, ${Math.min(modernAreaOpacity + 0.16, 0.7)})`,
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        // 历史疆域使用 regions 覆盖样式
        regions: showHistoricalOverlay && historicalBoundary
          ? normalizeGeoJSON(historicalBoundary).features.map((f) => ({
              name: f.properties.name,
              itemStyle: {
                  areaColor: `rgba(214, 127, 88, ${historicalAreaOpacity})`,
                  borderColor: `rgba(149, 48, 30, ${historicalBorderOpacity})`,
                  borderWidth: 0.8 + dynastyBoundaryOpacity * 0.8,
                },
                emphasis: {
                  itemStyle: {
                    areaColor: `rgba(222, 125, 72, ${Math.min(historicalAreaOpacity + 0.12, 0.58)})`,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0,0,0,0.28)',
                  },
                  label: { show: true, fontSize: 12 },
                },
              }
            ))
          : [],
      },
      series: [
        // 事件标记点（使用 geo 坐标系）
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

    try {
      chartInstance.current.clear();
      chartInstance.current.setOption(option, true);
          } catch (err) {
      console.error('地图渲染失败:', err);
      setError(err instanceof Error ? err.message : '地图渲染失败');
    }

    // ── 点击事件 ──
    chartInstance.current.off('click');
    chartInstance.current.on('click', (params: unknown) => {
      const eventParams = params as {
        componentType?: string | undefined;
        seriesType?: string | undefined;
        name?: string | undefined;
        data?: { event?: Event | undefined } | undefined;
      };

      // 事件标记点
      if (eventParams.seriesType === 'scatter') {
        if (eventParams.data?.event) {
          onEventMarkerClick?.(eventParams.data.event);
        }
        return;
      }

      // 省份 / 区域点击
      if (eventParams.componentType === 'geo' || eventParams.seriesType === 'map') {
        if (!adminBoundaryVisible && !showHistoricalOverlay) return;
        const data = provinces.find((item) => item.name === eventParams.name) || null;
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
    showHistoricalOverlay,
  ]);

  // 响应式调整
  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width, height, minHeight: 400, position: 'relative' }}>
      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: '100%',
          visibility: loading || error ? 'hidden' : 'visible',
        }}
      />

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
