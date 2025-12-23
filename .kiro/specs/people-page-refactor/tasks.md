# Implementation Plan: People Page Refactor

## Overview

本实现计划将人物页面重构为三个标签页（历代帝王、明朝人物、清朝人物），遵循项目现有的组件模式和代码风格。实现将分阶段进行，每个阶段都有明确的验证点。

## Tasks

- [x] 1. 设置数据模型和类型定义
  - [x] 1.1 创建帝王数据类型和Zod验证模式
    - 创建 `frontend/src/services/emperor/types.ts`
    - 定义 Emperor, EraName, HistoricalEvaluation 接口
    - 创建对应的 Zod schemas
    - _Requirements: 7.1, 7.2_
  - [x] 1.2 创建明朝人物数据类型和Zod验证模式
    - 创建 `frontend/src/services/mingFigure/types.ts`
    - 定义 MingFigure, MingFigureRole, HistoricalEvent 接口
    - 创建对应的 Zod schemas
    - _Requirements: 7.1, 7.2_
  - [x] 1.3 创建清朝统治者数据类型和Zod验证模式
    - 创建 `frontend/src/services/qingRuler/types.ts`
    - 定义 QingRuler, PolicyMeasure 接口
    - 创建对应的 Zod schemas
    - _Requirements: 7.1, 7.2_

- [x] 2. 创建数据服务层
  - [x] 2.1 创建帝王数据服务和Mock数据
    - 创建 `frontend/src/services/emperor/emperorMock.ts`
    - 创建 `frontend/src/services/emperor/emperorService.ts`
    - 创建 `frontend/src/services/emperor/index.ts`
    - 包含从五帝到清末的代表性帝王数据
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 2.2 创建明朝人物数据服务和Mock数据
    - 创建 `frontend/src/services/mingFigure/mingFigureMock.ts`
    - 创建 `frontend/src/services/mingFigure/mingFigureService.ts`
    - 创建 `frontend/src/services/mingFigure/index.ts`
    - 包含明朝重要政治人物数据
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 2.3 创建清朝统治者数据服务和Mock数据
    - 创建 `frontend/src/services/qingRuler/qingRulerMock.ts`
    - 创建 `frontend/src/services/qingRuler/qingRulerService.ts`
    - 创建 `frontend/src/services/qingRuler/index.ts`
    - 包含从努尔哈赤到溥仪的完整数据
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 2.4 编写数据序列化往返属性测试
    - **Property 16: Data Serialization Round Trip**
    - **Validates: Requirements 7.3, 7.4, 7.5, 7.6**

- [x] 3. 创建状态管理Store
  - [x] 3.1 创建帝王Store
    - 创建 `frontend/src/store/emperorStore.ts`
    - 包含数据、筛选、排序、搜索状态
    - _Requirements: 2.7, 2.8, 2.9, 6.3_
  - [x] 3.2 创建明朝人物Store
    - 创建 `frontend/src/store/mingFigureStore.ts`
    - 包含数据、筛选、排序、搜索状态
    - _Requirements: 3.7, 3.8, 3.9, 6.3_
  - [x] 3.3 创建清朝统治者Store
    - 创建 `frontend/src/store/qingRulerStore.ts`
    - 包含数据、筛选、排序、搜索状态
    - _Requirements: 4.7, 4.8, 6.3_
  - [x] 3.4 更新Store索引文件
    - 更新 `frontend/src/store/index.ts` 导出新Store

- [x] 4. Checkpoint - 数据层验证
  - 确保所有类型定义正确
  - 确保Mock数据符合Schema
  - 确保Store正常工作
  - 如有问题请询问用户

- [x] 5. 创建共享UI组件
  - [x] 5.1 创建标签导航组件 PeopleTabs
    - 创建 `frontend/src/features/people/components/PeopleTabs.tsx`
    - 三个标签：历代帝王、明朝人物、清朝人物
    - 响应式设计
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 5.2 创建通用筛选搜索组件 PeopleFilter
    - 创建 `frontend/src/features/people/components/PeopleFilter.tsx`
    - 支持搜索、筛选、排序
    - 显示结果数量
    - _Requirements: 2.7, 2.8, 2.9, 3.7, 3.8, 3.9, 4.7, 4.8_
  - [x] 5.3 创建通用网格骨架屏组件
    - 创建 `frontend/src/features/people/components/GridSkeleton.tsx`
    - 响应式网格布局
    - _Requirements: 6.1_

- [x] 6. 创建历代帝王标签页组件
  - [x] 6.1 创建帝王卡片组件 EmperorCard
    - 创建 `frontend/src/features/people/components/EmperorCard.tsx`
    - 显示姓名、朝代、在位时间、年号
    - 悬停效果和点击交互
    - _Requirements: 2.2_
  - [x] 6.2 创建帝王详情弹窗 EmperorDetailModal
    - 创建 `frontend/src/features/people/components/EmperorDetailModal.tsx`
    - 显示完整信息：功绩、失误、评价
    - 支持关闭操作
    - _Requirements: 2.3, 2.4, 2.5, 2.6_
  - [x] 6.3 创建帝王网格组件 EmperorGrid
    - 创建 `frontend/src/features/people/components/EmperorGrid.tsx`
    - 响应式网格布局
    - 加载和空状态处理
    - _Requirements: 2.1, 5.1, 5.2, 5.3_
  - [x] 6.4 创建帝王内容容器 EmperorsContent
    - 创建 `frontend/src/features/people/components/EmperorsContent.tsx`
    - 整合筛选、网格、弹窗
    - _Requirements: 2.1-2.9_
  - [ ]* 6.5 编写帝王筛选排序属性测试
    - **Property 4: Emperor Search Correctness**
    - **Property 5: Emperor Dynasty Filter Correctness**
    - **Property 6: Emperor Sort Correctness**
    - **Validates: Requirements 2.7, 2.8, 2.9**

- [x] 7. 创建明朝人物标签页组件
  - [x] 7.1 创建明朝人物卡片组件 MingFigureCard
    - 创建 `frontend/src/features/people/components/MingFigureCard.tsx`
    - 显示姓名、生卒年、职位、派系
    - _Requirements: 3.2_
  - [x] 7.2 创建明朝人物详情弹窗 MingFigureDetailModal
    - 创建 `frontend/src/features/people/components/MingFigureDetailModal.tsx`
    - 显示生平、政治主张、成就、事件
    - _Requirements: 3.3, 3.4, 3.6_
  - [x] 7.3 创建明朝人物网格组件 MingFigureGrid
    - 创建 `frontend/src/features/people/components/MingFigureGrid.tsx`
    - 响应式网格布局
    - _Requirements: 3.1, 5.1, 5.2, 5.3_
  - [x] 7.4 创建明朝人物内容容器 MingContent
    - 创建 `frontend/src/features/people/components/MingContent.tsx`
    - 整合筛选、网格、弹窗
    - _Requirements: 3.1-3.9_
  - [ ]* 7.5 编写明朝人物筛选排序属性测试
    - **Property 8: Ming Figure Search Correctness**
    - **Property 9: Ming Figure Filter Correctness**
    - **Property 10: Ming Figure Sort Correctness**
    - **Validates: Requirements 3.7, 3.8, 3.9**

- [-] 8. 创建清朝人物标签页组件
  - [x] 8.1 创建清朝统治者卡片组件 QingRulerCard
    - 创建 `frontend/src/features/people/components/QingRulerCard.tsx`
    - 显示姓名、庙号、年号、在位时间
    - _Requirements: 4.2_
  - [x] 8.2 创建清朝统治者详情弹窗 QingRulerDetailModal
    - 创建 `frontend/src/features/people/components/QingRulerDetailModal.tsx`
    - 显示政策、事件、贡献、责任
    - _Requirements: 4.3, 4.4, 4.5, 4.6_
  - [x] 8.3 创建清朝统治者网格组件 QingRulerGrid
    - 创建 `frontend/src/features/people/components/QingRulerGrid.tsx`
    - 响应式网格布局
    - _Requirements: 4.1, 5.1, 5.2, 5.3_
  - [x] 8.4 创建清朝统治者内容容器 QingContent
    - 创建 `frontend/src/features/people/components/QingContent.tsx`
    - 整合筛选、网格、弹窗
    - _Requirements: 4.1-4.8_
  - [ ]* 8.5 编写清朝统治者筛选排序属性测试
    - **Property 13: Qing Ruler Search Correctness**
    - **Property 11: Qing Ruler Chronological Ordering**
    - **Validates: Requirements 4.1, 4.7, 4.8**

- [x] 9. Checkpoint - 组件验证
  - 确保所有组件正确渲染
  - 确保响应式布局正常
  - 如有问题请询问用户

- [ ] 10. 重构主页面并整合
  - [x] 10.1 重构 PeoplePage 主组件
    - 更新 `frontend/src/features/people/PeoplePage.tsx`
    - 移除现有内容，添加标签导航
    - 实现懒加载逻辑
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.4_
  - [x] 10.2 创建组件索引文件
    - 创建 `frontend/src/features/people/components/index.ts`
    - 导出所有组件
  - [x] 10.3 更新页面样式
    - 更新 `frontend/src/features/people/PeoplePage.css`
    - 添加新组件样式
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [ ]* 10.4 编写标签切换和懒加载属性测试
    - **Property 1: Tab Switching Consistency**
    - **Property 15: Lazy Loading Behavior**
    - **Validates: Requirements 1.2, 6.4**

- [x] 11. Final Checkpoint - 完整功能验证
  - 确保所有标签页正常工作
  - 确保搜索、筛选、排序功能正常
  - 确保响应式设计正常
  - 确保所有测试通过
  - 如有问题请询问用户

## Notes

- 任务标记 `*` 的为可选测试任务，可跳过以加快MVP开发
- 每个任务都引用了具体的需求以便追溯
- Checkpoint任务用于阶段性验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
