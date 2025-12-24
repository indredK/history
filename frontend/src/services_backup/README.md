# Services 架构重构总结

## 重构目标
1. 统一接口支持前端mock和真实API两种方式
2. 将硬编码的mock数据迁移到JSON文件
3. 保持数据类型和接口类型一致
4. 建立统一的服务架构
5. **地图数据单独处理，优化大数据加载**
6. **工具函数统一管理，保持services层纯粹**

## 新架构优势

### 1. 地图数据专门处理
- 创建了 `MapDataService` 专门处理地图相关数据
- 支持按需加载边界数据，避免一次性加载所有地图数据
- 内置缓存机制，提高性能
- 支持预加载常用数据

### 2. 工具函数统一管理
- 所有通用工具函数迁移到 `utils/services/` 目录
- 包括数据加载器、错误处理、服务工厂等
- Services层保持纯粹，只关注业务逻辑

### 3. 统一服务架构
- 创建了 `base/serviceFactory.ts` 统一服务工厂
- 所有服务都支持API和Mock两种模式自动切换
- 通过 `config/dataSource.ts` 统一控制数据源

## 文件结构变化

### 新增文件
```
utils/services/
├── dataLoaders.ts          # 统一数据加载器（增强版）
├── errorHandling.ts        # 错误处理和降级策略
├── serviceFactory.ts       # 统一服务工厂
└── README.md              # 工具函数说明

services/map/
└── mapDataService.ts      # 地图数据专用服务
```

### 删除文件
```
services/utils/            # 整个目录已删除
├── apiResponseHandler.ts  # 迁移到 utils/services/dataLoaders.ts
├── enhancedApiClient.ts   # 迁移到 utils/services/errorHandling.ts
├── fallbackManager.ts     # 迁移到 utils/services/errorHandling.ts
├── unifiedDataClient.ts   # 迁移到 utils/services/serviceFactory.ts
└── createDataClient.ts    # 功能整合到其他文件
```

## 使用方式

### 地图数据服务
```typescript
import { mapDataService } from '@/services/map/mapDataService';

// 加载地点数据
const places = await mapDataService.loadPlaces();

// 按需加载边界数据
const tangBoundary = await mapDataService.loadBoundaryData('tang');

// 根据年份获取边界
const boundary = await mapDataService.getBoundaryDataByYear(750);

// 预加载常用数据
await mapDataService.preloadCommonData();
```

### 创建新服务
```typescript
import { createUnifiedService } from '@/utils/services/serviceFactory';

const newService = createUnifiedService<MyType>(
  '/api/endpoint',
  '/data/json/mydata.json',
  transformJsonToMyType,
  { hasGetById: true }
);
```

### 错误处理和降级
```typescript
import { fallbackManager } from '@/utils/services/errorHandling';

// 自动降级策略
const result = await fallbackManager.executeWithFallback(
  apiOperation,
  mockOperation,
  '操作名称'
);
```

## 性能优化

### 地图数据优化
- **按需加载**: 只在需要时加载特定朝代的边界数据
- **缓存机制**: 避免重复加载相同数据
- **预加载策略**: 预先加载常用的地图数据
- **内存管理**: 提供缓存清理功能

### 服务层优化
- **统一工厂**: 减少重复代码，提高维护性
- **降级策略**: API失败时自动切换到Mock数据
- **错误处理**: 统一的错误处理和重试机制

## 向后兼容性
- 保持所有原有接口不变
- 原有的调用方式继续有效
- 渐进式迁移，不影响现有功能
- base/serviceFactory.ts 重新导出新工具，保持兼容

## 类型安全
- ✅ 所有TypeScript类型错误已修复
- ✅ 构建成功通过
- ✅ 保持向后兼容性
- ✅ 新增完整的类型定义

## 下一步计划
1. 逐步将其他服务迁移到新架构
2. 添加更多地图数据格式支持
3. 优化大型JSON文件的加载策略
4. 添加服务监控和性能分析