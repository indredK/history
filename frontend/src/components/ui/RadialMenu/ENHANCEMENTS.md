# RadialMenu 增强路线图

记录 RadialMenu 轮盘组件的增强方向。分「功能」与「视觉」两类，每项标注是否已在本轮落地。
组件当前已具备：径向弧形排布视图（`RadialOrbit`）、时间轴 SVG 弧线刻度视图（`RadialTimeline`）、
滚轮翻页、点击核心切换模式、conic-gradient 进度环。消费方为 `DynastySelector`（左）与 `EmperorSelector`（右）。

> 设计约束：RadialMenu 是通用 UI 组件，不依赖 emperors-cyber 领域类型。
> 领域数据（年号、年份等）由消费方映射进通用 props（如 `tags`、`yearValue`），组件本身保持中立。

## 功能增强

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| F1 | 时间轴按真实年代比例分布 | ✅ 本轮 | `getTimelinePosition` 原先用 `index/(n-1)` 均匀分布。改为接收每个刻度的归一化 `ratio`，由真实 `yearValue` 线性映射；年份缺失则回退均匀分布。弧线由此成为「时间密度图」。 |
| F2 | 年号（tags）展示 | ✅ 本轮 | `RadialMenuItem` 新增通用 `tags?: string[]`。`EmperorSelector` 将 `emperor.yearNames` 映射进去，选中节点下方展示年号标签。 |
| F3 | 键盘方向键导航 | ✅ 本轮 | `role="listbox"` 此前仅支持滚轮 + 点击。新增 ↑/↓（或 ←/→）切换上一/下一项、Home/End 跳首尾，提升无障碍与桌面手感。 |
| F4 | 位置计数（n / total） | ✅ 本轮 | 进度环只表达比例。核心圆盘下方补「当前序号 / 总数」文字。 |
| F5 | Type-ahead 首字母定位 | ⬜ 未做 | 项目较多时滚轮翻页慢，键入首字直达对应项。 |
| F6 | 时间轴 hover 预览卡片 | ⬜ 未做 | 刻度 hover 弹出小卡片显示名称 + 在位区间 + 概要（`summary` 字段当前未在轮盘露出）。 |
| F7 | 移动端手势 | ⬜ 未做 | `max-width:1080px` 降级为线性布局，触屏滚轮失效。可补 swipe / 拖拽旋转弧盘。 |

## 视觉效果

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| V1 | 节点错位展开（stagger） | ⚠️ 已退役 | 初版用 `transform` 过渡 + `stagger-order*45ms` 级联延迟。该延迟正是快速滚动时「节点逐个排队进出」的主因，已由 S1 平滑滚动方案取代（位置去过渡 + 连续淡入）。 |
| V2 | 焦点景深 | ✅ 本轮 | 非选中节点叠加轻微 `blur()`，强化选中项的视觉层次。 |
| V3 | 进度环刻度化 | ✅ 本轮 | 连续 conic-gradient 叠加按 item 数分段的刻度环（表盘感），顺带暗示总数。 |
| V4 | 朝代主色过渡 | ✅ 本轮 | `--menu-accent` 切换由瞬变改为平滑 transition，整个轮盘主色流动切换。 |
| V5 | 核心—选中节点连接线 | ⬜ 未做 | 在 hub 与当前 active 节点间画发光连线，强化「当前选中」锚点。 |
| V6 | 指针拖尾 | ⬜ 未做 | 时间轴指针切换时加扫描余晖 / 拖尾。 |

## 滚动手感

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| S1 | 径向平滑滚动 | ✅ 本轮 | 修复快速滚动时节点「逐个排队进出」的生硬感。两处根因：①窗口切片 `[floor, floor+4]` 相对连续中心不对称，节点在可见区（满透明度）凭空挂载/卸载；②`transform` 位置过渡叠加 RAF 缓动造成二次拖尾，并被 stagger 级联延迟放大。方案：以连续中心 `orbitCenter` 对称渲染 `5 实显 + 两侧各 ORBIT_BUFFER` 个缓冲节点，透明度/缩放按到中心的连续归一化距离衰减（进出恒发生在 opacity≈0 处）；位置由 JS 每帧注入且 CSS 不加过渡，缩放/透明度保留极短过渡。 |

涉及文件（S1）：

- `geometry.ts` — 新增 `ORBIT_BUFFER` 等常量与纯函数 `getOrbitNodeVisual(offset, halfSpan, side)`，统一计算节点位置 + 连续景深。
- `useRadialMenu.ts` — 窗口切片由离散 `[floor, floor+4]` 改为以连续中心 `orbitCenter` 对称渲染并附带每节点的连续 `offset`；暴露 `halfSpan` 取代 `visibleWindowStart`/`visibleCount`。
- `RadialOrbit.tsx` — 用 `getOrbitNodeVisual` 注入 `--orbit-opacity/scale/pointer`，移除离散 `stagger-order`。
- `RadialMenu.module.scss` — 节点位置去过渡（杜绝二次拖尾），opacity/scale 由 JS 变量驱动；缓冲节点 `pointer-events:none` 防误点。

## 本轮落地（高价值精选集）

数据项 **F1 + F2** 放大历史数据本身的信息量；功能项 **F3 + F4** 补足交互与无障碍；
视觉项 **V1 + V2 + V3 + V4** 改动集中在样式层、风险低、提升明显。

涉及文件：

- `geometry.ts` — 新增 `getTimelineRatios`，`getTimelinePosition` 改为按 ratio 定位。
- `types.ts` — `RadialMenuItem.tags?`。
- `useRadialMenu.ts` — 计算 `timelineRatios`、点击反算改最近邻、暴露计数、方向键导航。
- `RadialMenu.tsx` — 位置计数器、CSS 变量注入。
- `RadialOrbit.tsx` — 渲染 active tags、注入 stagger 序号变量。
- `RadialTimeline.tsx` — 接入 ratios 定位。
- `RadialMenu.module.scss` — stagger、景深、刻度环、主色过渡、tags、计数器样式。
- `EmperorSelector.tsx` — 映射 `yearNames` → `tags`。
