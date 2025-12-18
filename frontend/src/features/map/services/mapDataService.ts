/**
 * 地图数据服务 - 从接口获取数据
 */

export interface MapDataPoint {
  name: string;
  value: number;
  coord?: [number, number];
}

export interface ProvinceData {
  name: string;
  value: number;
  adcode?: string;
  center?: [number, number];
}

export interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    adcode: string;
    name: string;
    level: string;
    center: [number, number];
  };
  geometry: any;
}

export interface GeoJsonData {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

/**
 * 获取 GeoJSON 地图数据
 */
export async function fetchGeoJson(): Promise<GeoJsonData> {
  // 处理部署路径，确保在 GitHub Pages 上正确加载
  const basePath = import.meta.env.BASE_URL || '/';
  const fullPath = `${basePath.replace(/\/$/, '')}/data/json/100000.geoJson`;
  
  const response = await fetch(fullPath);
  if (!response.ok) {
    throw new Error(`获取地图数据失败: ${response.status}`);
  }
  return response.json();
}

/**
 * 从 GeoJSON 中提取省份数据
 */
export function extractProvinceData(geoJson: GeoJsonData): ProvinceData[] {
  return geoJson.features.map((feature) => ({
    name: feature.properties.name,
    value: Math.floor(Math.random() * 10000) + 500, // 模拟数值
    adcode: feature.properties.adcode,
    center: feature.properties.center
  }));
}

/**
 * 从 GeoJSON 中提取城市标记点
 */
export function extractCityMarkers(geoJson: GeoJsonData): MapDataPoint[] {
  return geoJson.features
    .filter(f => f.properties.center)
    .slice(0, 10) // 取前10个作为标记点
    .map(feature => ({
      name: feature.properties.name.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, ''),
      value: Math.floor(Math.random() * 100) + 50,
      coord: feature.properties.center
    }));
}
