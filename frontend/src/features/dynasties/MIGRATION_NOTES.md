# 朝代数据迁移说明

## 更改概述

已将朝代页面从旧的嵌套数据结构迁移到使用 response1-9.json 的平铺数据结构。

## 数据源

- **新数据源**: `/data/json/response1-9.json` (9个文件，共约4361条记录)
- **旧数据源**: `/data/json/chinese-dynasties.json` 和 `/data/json/dynasties/*.json` (已删除)

## 数据字段映射

| API字段 (response*.json) | 表格列 | 说明 |
|-------------------------|--------|------|
| `polity` | dynasty | 朝代名称 |
| `rulerAlias` | title | 统治者别名/名号 |
| `ruler` | name | 统治者姓名 |
| `eraFullName` | yearName | 年号全称 |
| `eraYearNo` | duration | 年号年数 |
| `sexagenary` | ganZhi | 干支纪年 |
| `year` | startYear | 公元纪年 |
| - | changeMonth | 改元月份 (API中无此字段，留空) |

## 新增文件

1. **types.ts** - 数据类型定义
   - `YearRowData`: API返回的原始数据结构
   - `ApiResponse`: API响应结构
   - `TableRowData`: 表格显示的数据结构

2. **DynastiesListFlat.tsx** - 新的平铺列表组件
   - 加载 response1-9.json 文件
   - 将API数据转换为表格数据
   - 平铺展示所有记录，无折叠/展开功能

## 修改文件

1. **DynastiesPage.tsx** - 页面入口
   - 从 `DynastiesList` 改为 `DynastiesListFlat`

2. **index.ts** - 导出文件
   - 新增 `DynastiesListFlat` 导出

## 删除文件

1. `/data/json/chinese-dynasties.json` - 旧的配置文件
2. `/data/json/dynasties/` - 整个旧数据目录

## 功能变化

### 移除的功能
- 朝代折叠/展开功能
- 嵌套的子朝代结构
- 统治者分组显示

### 保留的功能
- 响应式表格布局
- 移动端适配
- 毛玻璃视觉效果
- 列的显示/隐藏优先级

## 数据统计

- **总记录数**: 约4361条 (来自9个response文件)
- **数据范围**: 从秦朝(-221年)开始的历史记录
- **每个文件**: 约500条记录

## 注意事项

1. `changeMonth` 字段在新API中不存在，该列显示为空
2. 所有数据现在是平铺的，没有层级结构
3. 旧的 `DynastiesList` 组件仍然保留，但不再使用
