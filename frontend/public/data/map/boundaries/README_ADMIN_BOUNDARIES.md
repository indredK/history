# 现代行政区域边界数据说明

## 文件结构

需要准备以下GeoJSON文件来支持现代行政区域显示：

### 1. china_provinces.geojson
中国省级行政区域边界数据

```json
{
  "type": "FeatureCollection",
  "name": "中国省级行政区域",
  "description": "中华人民共和国省级行政区域边界",
  "features": [
    {
      "type": "Feature",
      "id": "beijing",
      "properties": {
        "name": "北京市",
        "name_en": "Beijing",
        "admin_level": "province",
        "type": "municipality",
        "population": 21540000,
        "area_km2": 16410.54,
        "capital": "北京",
        "established": "1949-10-01"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[116.0, 39.5], [117.0, 39.5], [117.0, 40.5], [116.0, 40.5], [116.0, 39.5]]]
      }
    }
  ]
}
```

### 2. china_cities.geojson
中国地级市边界数据

```json
{
  "type": "FeatureCollection",
  "name": "中国地级市",
  "description": "中华人民共和国地级市行政区域边界",
  "features": [
    {
      "type": "Feature",
      "id": "beijing_dongcheng",
      "properties": {
        "name": "东城区",
        "name_en": "Dongcheng District",
        "admin_level": "city",
        "parent_province": "北京市",
        "population": 919000,
        "area_km2": 41.84
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[116.3, 39.9], [116.4, 39.9], [116.4, 40.0], [116.3, 40.0], [116.3, 39.9]]]
      }
    }
  ]
}
```

## 数据来源建议

1. **官方数据源**：
   - 国家基础地理信息中心
   - 自然资源部标准地图服务
   - 中国科学院地理科学与资源研究所

2. **开源数据源**：
   - OpenStreetMap (需要处理和验证)
   - Natural Earth Data
   - GADM (Global Administrative Areas)

3. **商业数据源**：
   - 高德地图API
   - 百度地图API
   - 腾讯地图API

## 数据处理要求

### 坐标系统
- 使用 WGS84 (EPSG:4326) 坐标系
- 经度范围：73°E - 135°E
- 纬度范围：18°N - 54°N

### 精度要求
- 省级边界：简化到适合1:100万比例尺
- 市级边界：简化到适合1:50万比例尺
- 文件大小控制在合理范围内（省级<5MB，市级<20MB）

### 属性字段标准

#### 必需字段
- `name`: 中文名称
- `name_en`: 英文名称（可选）
- `admin_level`: 行政级别 ("province", "city", "county")

#### 推荐字段
- `population`: 人口数量
- `area_km2`: 面积（平方公里）
- `capital`: 省会/首府
- `established`: 建立时间

## 文件放置位置

将处理好的GeoJSON文件放置在以下位置：
- `data/raw/china_provinces.geojson`
- `data/raw/china_cities.geojson`
- `data/raw/china_counties.geojson` (可选)

## 数据更新

现代行政区域数据相对稳定，但需要注意：
- 行政区划调整（如撤县设市、区划合并等）
- 新设立的自贸区、开发区等特殊区域
- 建议每年检查一次数据更新

## 使用说明

1. 现代行政区域作为底图显示，透明度较低
2. 历史朝代边界作为上层显示，突出历史疆域
3. 用户可以通过图层控制面板调整显示和透明度
4. 支持点击查看详细信息

## 注意事项

1. **版权问题**：确保使用的地图数据符合版权要求
2. **政治敏感性**：边界数据涉及领土主权，需要使用官方认可的标准
3. **数据准确性**：定期验证边界数据的准确性和时效性
4. **性能优化**：大文件需要适当简化几何形状以提高渲染性能