# Services 重构总结

## 重构目标
1. 统一接口支持前端mock和真实API两种方式
2. 将硬编码的mock数据迁移到JSON文件
3. 保持数据类型和接口类型一致
4. 建立统一的服务架构

## 重构成果

### 1. 统一服务架构
- 创建了 `base/serviceFactory.ts` 统一服务工厂
- 所有服务都支持API和Mock两种模式自动切换
- 通过 `config/dataSource.ts` 统一控制数据源

### 2. JSON数据文件
新增的JSON数据文件：
- `public/data/json/mythologies.json` - 神话数据
- `public/data/json/schools.json` - 思想流派数据  
- `public/data/json/religions.json` - 宗教关系数据

已有的JSON文件得到充分利用：
- `dynasties.json` - 朝代数据
- `events.json` - 历史事件数据
- `persons.json` - 人物数据
- `places.json` - 地点数据

### 3. 重构的服务模块
- ✅ Culture (朝代) - 完全重构
- ✅ Timeline (时间线) - 完全重构  
- ✅ People (人物) - 完全重构
- ✅ Mythology (神话) - 完全重构，新增JSON数据
- ✅ Schools (思想流派) - 完全重构，新增JSON数据
- ✅ Religion (宗教) - 完全重构，新增JSON数据
- ✅ Map (地图) - 完全重构

### 4. 统一的接口规范
所有服务都继承自 `BaseService<T>` 接口：
```typescript
interface BaseService<T, ID = string> {
  getAll(): Promise<ApiResponse<T[]>>;
  getById?(id: ID): Promise<ApiResponse<T | null>>;
}
```

### 5. 数据源切换
通过修改 `config/dataSource.ts` 中的 `DATA_SOURCE_MODE` 即可切换：
- `0` = Mock数据模式
- `1` = 真实API模式

## 类型安全修复

### 修复的TypeScript错误
1. **Transformer函数参数类型** - 统一index参数为必需的number类型
2. **服务接口返回类型** - 修正getPerson等方法的返回类型为可空类型
3. **Religion API响应格式** - 添加message字段支持错误处理
4. **导出成员缺失** - 补充缺失的服务函数导出
5. **组件类型断言** - 修复ReligionGraph组件的类型错误
6. **Store筛选逻辑** - 处理activeCategory为null的情况

### 类型检查结果
- ✅ 所有TypeScript类型错误已修复
- ✅ 构建成功通过
- ✅ 保持向后兼容性

## 使用方式

### 基本用法
```typescript
import { dataClient } from '@/services';

// 自动根据配置选择数据源
const events = await dataClient.getEvents();
const dynasties = await dataClient.getDynasties();
```

### 创建新服务
```typescript
import { createUnifiedService } from '@/services/base';

const newService = createUnifiedService<MyType>(
  '/api/endpoint',
  '/data/json/mydata.json',
  transformJsonToMyType,
  { hasGetById: true }
);
```

## 向后兼容性
- 保持所有原有接口不变
- 原有的调用方式继续有效
- 渐进式迁移，不影响现有功能

## 优势
1. **统一架构** - 所有服务使用相同的模式
2. **数据分离** - JSON数据独立管理，便于维护
3. **类型安全** - 完整的TypeScript类型支持，零类型错误
4. **灵活切换** - 一键切换数据源模式
5. **易于扩展** - 新增服务只需几行代码
6. **构建优化** - 支持生产环境构建，代码分割优化