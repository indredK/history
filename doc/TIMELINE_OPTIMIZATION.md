# 时间轴优化建议(D3Timeline)

聚焦 `frontend/src/features/timeline/components/timeline/`,围绕 `D3Timeline → TimelineChart → TimelineRenderer + useTimelineInteraction` 这条链路。

## TL;DR

当前实现能用,但有 5 类问题会随事件量与交互密度变大而放大。优先级排序:

1. **架构(P0)**:每次 `timeRange` 变都 `svg.selectAll('*').remove()` 全量重建,违反 React + D3 协作的标准做法,是后续所有性能/平滑度问题的根。
2. **性能(P0)**:布局算法 O(N×levels)、SVG 节点数随事件线性增长且每帧重建,事件 ≥ 千级时 zoom/pan 会卡。
3. **交互(P1)**:自研 wheel/mouse/key 三套监听 + Shift+滚轮才能水平平移、`d3.zoom` 完全没用,与生态约定不符,且存在 stale closure 风险。
4. **可访问性(P1)**:SVG 无 `role`/`aria-label`/`<title><desc>`,事件点不可键盘聚焦,toolbar 文案与默认快捷键不一致(写"方向键移动 / Home / End"但代码同时只在 SVG focus 时触发)。
5. **API 与状态(P2)**:`forwardRef + useImperativeHandle` 把 5 个命令暴露给父再回传 props,父子互相穿插,可由内置工具栏直接拿状态简化。

逐项展开 + 实施步骤见下文。

---

## 1. 架构:让 D3 算坐标,React 渲染 SVG

### 现状

- [TimelineChart.tsx:131-162](frontend/src/features/timeline/components/timeline/components/TimelineChart.tsx) 的 `useEffect` 里:`svg.selectAll('*').remove()` → 重新 `append(...)` 主线 / 轴 / 事件点 / 标签 / 年份。
- `TimelineRenderer` 是 OOP 命令式封装,`renderEvents`/`renderEventLabels`/`renderEventYears` 全部用 `.append()`,没有 d3 的 enter/update/exit 数据连接。
- 这意味着 `timeRange` 任何一次变化(滚轮、拖拽、缩放、键盘)都会**销毁 + 重建整棵 SVG 子树**,React 完全失去对该子树的认知。

### 为什么是问题

[Reintech: Building Custom Chart Components with D3.js and React](https://reintech.io/blog/building-custom-chart-components-d3-js-react) 与 [SitePoint: How React Makes Your D3 Better](https://www.sitepoint.com/how-react-makes-your-d3-better/) 的共识:

> React 期望成为 DOM 的唯一真相源。D3 直接修改元素时 React 一无所知,只要这两者管同一棵 DOM 子树,就会拿不到 ref、拿不到合成事件、生命周期错乱。

业界推荐两种模式:

- **A. "React for DOM, D3 for math"**:用 d3-scale / d3-axis / d3-shape 算坐标和路径,JSX 渲染 `<line>`/`<circle>`/`<text>`。React 控制 DOM,D3 只负责计算。 [Medium: React + D3 - Comparing Alternative Approaches](https://medium.com/@numberpicture/react-d3-comparing-alternative-approaches-1a63ced48d66)
- **B. "Black-box D3"**:整个 SVG 子树彻底交给 D3,React 只 mount 一个 `<svg ref>`,但 **必须用 enter/update/exit 而不是 `selectAll('*').remove()`**。 [Pluralsight: Using D3.js Inside a React App](https://www.pluralsight.com/resources/blog/guides/using-d3js-inside-a-react-app)

当前代码混用最差的两种:既用 React mount SVG,又每次 effect 全量清空重建。

### 建议

**采用 A 方案**(更符合 React 生态、可测、零数据-DOM 不同步问题):

```tsx
// TimelineChart.tsx 草图
const xScale = useMemo(
  () => d3.scaleLinear().domain(timeRange).range([0, innerWidth]),
  [timeRange, innerWidth],
);
const labels  = useMemo(() => calculateLabelLayout(...), [...]);
const years   = useMemo(() => calculateYearLayout(...),  [...]);
const ticks   = useMemo(() => xScale.ticks(maxTicks),    [xScale, maxTicks]);

return (
  <svg ref={svgRef} role="img" aria-label="历史事件时间轴">
    <title>{title}</title><desc>{describe(visibleEvents)}</desc>
    <g transform={`translate(${margin.left},${margin.top})`}>
      <TimelineAxis ticks={ticks} y={innerHeight} />
      <TimelineMainLine y={innerHeight / 2} width={innerWidth} />
      <EventLayer events={visibleEvents} xScale={xScale} ... />
      <LabelLayer  layout={labels} />
      <YearLayer   layout={years}  />
    </g>
  </svg>
);
```

收益:

- 没有 `selectAll('*').remove()`,子树由 React 增量 diff,zoom/pan 时只更新坐标属性。
- `TimelineRenderer` 类整个移除,代码减 ~450 行;`Renderer.handleDotHover` 之类的命令式过渡迁到 CSS transition 或 framer-motion。
- 单元测试可以直接 render JSX 后断言节点数与坐标,不再需要 jsdom + d3 selection mock。

### 实施步骤

1. 抽出 `useTimelineGeometry({ events, timeRange, width, height, favorites })`,返回 `{ xScale, ticks, eventNodes, labelLayout, yearLayout }`,纯函数 + memo。
2. 拆出 5 个无状态组件:`TimelineAxis` / `TimelineMainLine` / `EventLayer` / `LabelLayer` / `YearLayer`,只接收坐标数据。
3. `TimelineRenderer` 类删除,`timelineRenderer.ts` 整体废弃。
4. `D3Timeline.css` 的 `event-dot:hover` 等保留(变成更纯的 CSS 驱动)。

---

## 2. 性能:布局算法 + SVG 节点数

### 现状

- [layoutAlgorithms.ts:42-101](frontend/src/features/timeline/components/timeline/utils/layoutAlgorithms.ts) 双重循环 + 内层 `labels.filter`,最坏复杂度 O(N × maxLevels × N)。
- [layoutAlgorithms.ts:35](frontend/src/features/timeline/components/timeline/utils/layoutAlgorithms.ts) 用 `title.length * 7` 估算文字宽度,中英文混排误差大,会导致重叠或浪费空间。
- [timelineRenderer.ts:251-303](frontend/src/features/timeline/components/timeline/utils/timelineRenderer.ts) 渲染标签时**每个 label 都调用 `getBBox()`** 测量宽度,而 `getBBox` 触发 layout reflow,N 次调用 = N 次 reflow。
- 事件 + 跨度 + 圆点 + tick + 年份 + 标签背景 + 标签阴影 + 标签文本 ≈ **每个事件 7-10 个 SVG 节点**;500 事件 = 4-5k 节点。

### 为什么是问题

- [StackOverflow #62624925](https://stackoverflow.com/questions/62624925/javascript-d3-js-draw-large-data-set-improve-the-speed-of-zoom-and-pan-in):"sluggish zoom/pan 是 SVG 元素太多导致,关键是 hierarchical levels of detail"。
- [ExpertBeacon: D3 + Canvas In 3 Steps](https://expertbeacon.com/d3-and-canvas-in-3-steps-the-bind-the-draw-and-the-interactivity/):"低于 1000 元素 SVG 一般够用,过千就要 Canvas 或虚拟化"。
- [moldstud: D3 Performance Tips](https://moldstud.com/articles/p-essential-performance-optimization-tips-for-d3js-visualizations-in-vuejs):object pooling + 增量 update 比 re-create 快。

### 建议

短期(P0,与 #1 一起做):

1. **视口裁剪 + 等级 LoD**:在 `useTimelineGeometry` 里,根据当前 `currentZoom` 决定标签数量上限。当前已有 `maxLevels` 但没有 `maxLabels`,不收藏 + 重要度低的事件超过密度阈值时,只保留 `dot + tick`,不画标签。stackoverflow 那条建议的"image pyramid"思路。
2. **`getBBox()` 替换为 canvas measureText**:`new OffscreenCanvas(0,0).getContext('2d').measureText(text).width`,无 reflow,可批量。或者干脆放弃测量,用固定 padding + CSS `text-anchor: middle` + `dominant-baseline`。
3. **稳定 key**:`<EventLayer events>` 用 `event.id` 做 React key,避免 zoom 时整层 unmount/remount。

中期(P1,有 1000+ 事件再做):

4. **混合渲染**:dot/tick(数量大) 用 `<canvas>`,label/year(已经 LoD 限量到几十) 留 SVG。Hit-test 用 quadtree。参考 [bomberbot: D3 + HTML5 Canvas](https://www.bomberbot.com/d3/harnessing-the-power-of-d3-and-html5-canvas-for-high-performance-data-visualization/)。
5. **Web Worker 跑布局**:`calculateLabelLayout` 主线程 16ms 预算占比变高时移到 worker。

### 度量指标

实施前后用 Chrome Performance 录制以下场景,对比:

- 加载首屏 → 首次 paint 时间。
- 拖拽 1 秒 → average frame time(目标 ≤ 16ms)。
- 滚轮快速缩放 → long task 数量(目标 0)。
- DOM 节点总数(目标:visible events ≤ 200 时,SVG 节点 ≤ 1500)。

---

## 3. 交互:换成 d3.zoom

### 现状

- [useTimelineInteraction.ts](frontend/src/features/timeline/components/timeline/hooks/useTimelineInteraction.ts) 自己实现 wheel / mousedown / mousemove / mouseup / keydown 五个监听。
- 滚轮**必须按 Shift** 才平移、原生缩放手势(双指 / Ctrl+wheel)完全没接。
- `dragState` 用 `useState`,但每次 `mousemove` 都会触发组件重渲染 → 触发 `useEffect` 重绑监听。看 [useTimelineInteraction.ts:194](frontend/src/features/timeline/components/timeline/hooks/useTimelineInteraction.ts) 的依赖数组确实包含所有 callback,而 callback 又依赖 `dragState`,链路上是 stale-closure 高发区。
- toolbar 文案"拖拽滚动 | Shift+滚轮水平滚动 | 方向键移动 | Home/End 快速定位",但 ArrowKey/Home/End 只有在 SVG 取得 focus 时才触发,新用户基本发现不了。

### 为什么是问题

- [d3-zoom 官方思路](https://www.d3indepth.com/zoom-and-pan/):一个 `d3.zoom().on('zoom', ...)` 同时处理 wheel 缩放、双指、拖拽平移、键盘 +/-,且自动保留 `transform.k/x/y` 的语义,数年来是实际标准。
- [reactuse: The Ref Escape Hatch](https://reactuse.com/blog/react-ref-escape-hatch/):**手写 mousemove + setState 会导致每帧 re-render**,正确做法是直接改 ref + `useSyncExternalStore` 或者在 `requestAnimationFrame` 里 batch。
- [Beehiiv: Why Your Event Listener is Lying](https://engineering-log.beehiiv.com/p/why-your-event-listener-is-lying-to-you-a-react-mystery):大段 useCallback + 长依赖数组的写法是 stale closure 与重复绑定的高发场景,应改 `useEffectEvent`(React 19.2 stable)或 ref-pattern。

### 建议

```ts
// 草图
useEffect(() => {
  const svg = d3.select(svgRef.current!);
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 200])
    .translateExtent([[0, 0], [width, height]])
    .filter((event) => !event.button) // 屏蔽右键
    .on('zoom', (event) => {
      const t = event.transform;
      const newScale = baseXScale.copy().domain(
        baseXScale.range().map((r) => t.invertX(r)).map(baseXScale.invert)
      );
      onTimeRangeChange(newScale.domain() as TimeRange);
    });
  svg.call(zoom);
  return () => { svg.on('.zoom', null); };
}, [width, height, baseXScale, onTimeRangeChange]);
```

收益:

- 自由组合手势:wheel = 缩放(Mac trackpad 双指自动捏合)、drag = 平移、双击 = 局部放大。Shift+wheel 改为水平 pan(可选)。
- 可在 `scaleExtent` / `translateExtent` 里集中限制,目前散落在 `panLeft/panRight/zoomIn/zoomOut` 四处的 clamp 逻辑可全部删。
- 回调里只读 `event.transform`,无 stale closure。
- `useImperativeHandle` 暴露的 5 个命令改为调 `zoom.transform(svg.transition(), d3.zoomIdentity)`,代码量减半。

兼容性:键盘 ArrowLeft / Home / End 仍保留(WAI-ARIA 推荐),但只需在 svg 上 listen 一个 `keydown`,不再各 case 手写 clamp,而是 `zoom.translateBy(svg, ±step, 0)`。

### 实施步骤

1. 引入 `d3.zoom`,把 wheel/drag 行为迁过去。
2. 删除 `useTimelineInteraction` 内 mouse/wheel 处理函数;保留键盘 hook,但简化为调用 `zoom.translateBy/scaleBy`。
3. `createTimelineCommands` 改为返回 wrapper 调 d3.zoom。
4. toolbar 描述文案从"Shift+滚轮"改为"滚轮缩放 / 拖拽平移 / 双击放大"。

---

## 4. 可访问性:让屏幕阅读器和键盘用户也能看时间轴

### 现状缺失项

| 项 | WCAG 2.2 / WAI-ARIA APG 要求 | 当前 |
| - | - | - |
| `<svg role="img" aria-label="...">` | 必需 | 无 |
| `<title>` + `<desc>` 子元素摘要 | 推荐 | 无 |
| 事件点 `tabindex="0"` + `role="button"` + `aria-label="《大业元年》开始..."` | 必需(交互元素) | 无,只能鼠标点 |
| 焦点环 visible | 必需 | `outline: 2px` 仅在 SVG 整体上 |
| 焦点顺序 | 跟视觉顺序一致 | 无序(因为没 tabindex) |
| 颜色对比 ≥ 4.5:1 | text 必需 | 浅灰 `#475569` on `rgba(248,250,252,0.9)` 边界值,需测 |
| 缩放 200% 不丢内容 | 必需 | 标签会重叠到不可读 |
| `prefers-reduced-motion` | 必需 | `transition: r 0.2s` 没禁用 |

### 为什么是问题

- [WCAG Compliance for Data Visualizations](https://kindatechnical.com/data-visualization/wcag-compliance-for-data-visualizations.html):图表不是"可视化的特例",图像 / 交互 / 颜色 / 文本替代的标准全部适用。
- [Cambridge Intelligence: Build accessible viz](https://www.cambridge-intelligence.com/blog/build-accessible-data-visualization-apps-with-keylines/):图表必须可纯键盘操作 + 焦点可见 + 屏幕阅读器有意义的 announce。
- [Telerik Kendo Timeline a11y](https://www.telerik.com/kendo-angular-ui/components/layout/timeline/accessibility/) 给的范本:每个时间节点是一个 `role="article"` / `role="button"`,容器 `role="list"`。

### 建议

```tsx
<svg role="img" aria-label="中国历史事件时间轴" tabIndex={0}>
  <title>中国历史事件时间轴</title>
  <desc>{`从 ${startYear} 年到 ${endYear} 年,共 ${visibleEventCount} 个事件`}</desc>
  ...
  {events.map(e => (
    <g
      key={e.id}
      role="button"
      tabIndex={-1}      // 由 roving tabindex 管控
      aria-label={`${e.title},${formatTimelineYear(e.startYear)}${e.endYear ? '至' + e.endYear : ''}`}
      onClick={() => onSelect(e)}
      onKeyDown={(ev) => ev.key === 'Enter' && onSelect(e)}
    >
      <circle ... />
    </g>
  ))}
</svg>
```

加上 [WAI-ARIA APG: Roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) — 用左右方向键在事件之间切换焦点,Tab 进出整个时间轴。

`prefers-reduced-motion` 在 CSS:

```css
@media (prefers-reduced-motion: reduce) {
  .event-dot { transition: none; }
}
```

### 实施步骤(2-3 PR)

1. SVG 容器加 role/aria-label/title/desc。
2. 事件 `<g>` 包装层加 role + aria-label。
3. roving tabindex hook,统一管 ArrowKey 移动焦点。
4. 颜色对比检查(用 Chrome Lighthouse Accessibility audit)。
5. CSS 加 `prefers-reduced-motion` 与可见焦点环。

---

## 5. API 与状态:命令式 ref 不必要

### 现状

- [TimelineChart.tsx:62-67](frontend/src/features/timeline/components/timeline/components/TimelineChart.tsx) 用 `forwardRef + useImperativeHandle` 暴露 5 个命令给父。
- [D3Timeline.tsx:35-39](frontend/src/features/timeline/components/timeline/components/D3Timeline.tsx) 父再把 5 个命令包成 props 传给同一个 `TimelineChart`(因为 `TimelineToolbar` 在 `TimelineChart` 内)。
- 也就是说命令离开 `TimelineChart` 转一圈又回到 `TimelineChart`,信息流是 loop。

### 建议

让 `TimelineToolbar` 直接订阅 zoom 状态:把工具栏放进 `TimelineChart`,工具栏的按钮直接调 `zoom.scaleBy(svg.transition(), 1.5)` —— 命令式 API 整层删除。`zoomLevel` 显示用从 `event.transform.k` 派生的 state。

`D3Timeline` 退化为薄壳,只做数据获取与 loading/empty 态。

### 实施步骤

1. 把 zoom 状态(scale + 当前 domain)作为 `TimelineChart` 内部 state。
2. `TimelineToolbar` 接收的不再是 5 个 callback 而是直接读 d3.zoom 的 wrapper hook。
3. 删除 `TimelineChartRef` 类型、`createTimelineCommands`、`useImperativeHandle`。

---

## 6. 锦上添花

- **文档**:`TimelineChart` 单元测试目前覆盖什么没有看到,加快照测试 + 交互测试(用 `@testing-library/user-event` 模拟键盘 ArrowRight)。
- **响应式高度**:[timelineConfig.ts:8](frontend/src/features/timeline/components/timeline/config/timelineConfig.ts) 写死 `height: 400`,容器收缩时事件标签会被裁。改为 `useResizeObserver` 拿真实高度。已经 observe width 了,顺手 observe height。
- **`focusRange` 行为**:目前每次朝代切换都把 `currentZoom` 重置为 1,但用户可能希望保留缩放级别。可以加 `preserveZoom?: boolean` prop。
- **事件详情面板**:[EventDetailPanel.tsx](frontend/src/features/timeline/components/timeline/components/EventDetailPanel.tsx) 写好但没在 `TimelineChart` 中使用,要么接入(点击 dot → 展开),要么删除避免误导。

---

## 优先级落地建议

| 阶段 | 内容 | 估时 | 风险 |
| - | - | - | - |
| Phase 1 (P0) | §1 React-for-DOM 重构 + §2 短期优化 1-3 | 2-3 天 | 中,需要测试覆盖跟上 |
| Phase 2 (P0/P1) | §3 切换 d3.zoom + §5 删命令式 ref | 1 天 | 低,行为对齐即可 |
| Phase 3 (P1) | §4 a11y 全套 | 1-1.5 天 | 低 |
| Phase 4 (P2) | §2 中期(canvas 混合)、§6 锦上添花 | 按需 | 中 |

每个 Phase 单独 PR,不要混。验证手段:每个 PR 都要跑 `bunx tsc --noEmit` + `bun test`,Phase 1/2 还要手动 perf 录制对比。

---

## 参考资料

### 架构 / React+D3

- [Reintech — Building Custom Chart Components with D3.js and React](https://reintech.io/blog/building-custom-chart-components-d3-js-react)
- [Medium — React + D3: Comparing Alternative Approaches](https://medium.com/@numberpicture/react-d3-comparing-alternative-approaches-1a63ced48d66)
- [SitePoint — How React Makes Your D3 Better](https://www.sitepoint.com/how-react-makes-your-d3-better/)
- [Pluralsight — Using D3.js Inside a React App](https://www.pluralsight.com/resources/blog/guides/using-d3js-inside-a-react-app)

### 性能

- [StackOverflow — improve speed of zoom and pan in d3.js SVG chart](https://stackoverflow.com/questions/62624925/javascript-d3-js-draw-large-data-set-improve-the-speed-of-zoom-and-pan-in)
- [ExpertBeacon — D3 And Canvas In 3 Steps](https://expertbeacon.com/d3-and-canvas-in-3-steps-the-bind-the-draw-and-the-interactivity/)
- [Bomberbot — D3 + HTML5 Canvas for Performance](https://www.bomberbot.com/d3/harnessing-the-power-of-d3-and-html5-canvas-for-high-performance-data-visualization/)
- [moldstud — D3.js Performance Optimization](https://moldstud.com/articles/p-essential-performance-optimization-tips-for-d3js-visualizations-in-vuejs)

### 交互 / d3.zoom

- [d3-in-depth — Zoom and Pan](https://www.d3indepth.com/zoom-and-pan/)
- [reactuse — The Ref Escape Hatch](https://reactuse.com/blog/react-ref-escape-hatch/)
- [Engineering Log — Why Your Event Listener is Lying](https://engineering-log.beehiiv.com/p/why-your-event-listener-is-lying-to-you-a-react-mystery)
- [LogRocket — useEffectEvent in React 19.2](https://blog.logrocket.com/react-useeffectevent/)

### 可访问性

- [WCAG Compliance for Data Visualizations](https://kindatechnical.com/data-visualization/wcag-compliance-for-data-visualizations.html)
- [Cambridge Intelligence — Accessible Graph Visualization](https://www.cambridge-intelligence.com/blog/build-accessible-data-visualization-apps-with-keylines/)
- [Kendo Angular Timeline Accessibility](https://www.telerik.com/kendo-angular-ui/components/layout/timeline/accessibility/)
- [WAI-ARIA APG — Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
