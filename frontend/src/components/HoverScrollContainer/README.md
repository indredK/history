# HoverScrollContainer 组件

一个支持鼠标悬停滚动的容器组件，当鼠标悬停在容器底部区域时，可以通过鼠标位置控制平滑滚动。

## 功能特性

- 🎯 **悬停滚动**: 鼠标悬停在底部区域时，根据鼠标位置自动滚动
- 🎨 **平滑动画**: 使用缓动函数实现流畅的滚动效果
- ✨ **炫酷滚动条**: 多彩流光渐变滚动条，支持悬停和激活动画效果
- 🔧 **高度可配置**: 支持自定义缓动速度、滚动区域高度等参数
- 📱 **响应式**: 自动检测内容变化和容器尺寸变化
- 🎮 **完整控制**: 通过 ref 暴露滚动控制方法

## 基本使用

```tsx
import { HoverScrollContainer } from '@/components/HoverScrollContainer';

function MyComponent() {
  return (
    <HoverScrollContainer>
      <div style={{ display: 'flex', gap: '20px' }}>
        {items.map(item => (
          <div key={item.id}>{item.content}</div>
        ))}
      </div>
    </HoverScrollContainer>
  );
}
```

## 高级配置

```tsx
import { HoverScrollContainer } from '@/components/HoverScrollContainer';
import type { HoverScrollContainerRef } from '@/components/HoverScrollContainer';

function MyComponent() {
  const scrollRef = useRef<HoverScrollContainerRef>(null);

  return (
    <HoverScrollContainer
      ref={scrollRef}
      containerClassName="my-custom-class"
      hoverScrollOptions={{
        easing: 0.08,              // 缓动速度 (0-1)
        enabled: true,             // 是否启用
        scrollbarAreaHeight: 16,   // 底部滚动区域高度 (px)
        showScrollbarArea: false,  // 是否显示调试区域
        onScrollChange: (current, target) => {
          console.log('滚动位置:', current, '目标位置:', target);
        }
      }}
    >
      {/* 你的内容 */}
    </HoverScrollContainer>
  );
}
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | - | 容器内容 |
| `hoverScrollOptions` | `UseHoverScrollOptions` | `{}` | 滚动配置选项 |
| `containerClassName` | `string` | - | 自定义容器类名 |
| `...props` | `HTMLAttributes<HTMLDivElement>` | - | 其他 div 属性 |

### HoverScrollOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `easing` | `number` | `0.08` | 缓动速度，值越大滚动越快 (0-1) |
| `enabled` | `boolean` | `true` | 是否启用悬停滚动 |
| `scrollbarAreaHeight` | `number` | `16` | 底部滚动区域高度 (像素) |
| `showScrollbarArea` | `boolean` | `false` | 是否显示调试区域 (仅开发环境) |
| `onScrollChange` | `(current: number, target: number) => void` | - | 滚动变化回调 |

### Ref 方法

通过 ref 可以访问以下方法：

```tsx
const scrollRef = useRef<HoverScrollContainerRef>(null);

// 设置滚动位置
scrollRef.current?.setScrollPosition(500);

// 启用/禁用滚动
scrollRef.current?.setEnabled(false);

// 获取滚动状态
const state = scrollRef.current?.getScrollState();
// { scrollLeft: number, maxScroll: number, hasScrollableContent: boolean }

// 访问容器元素
const element = scrollRef.current?.containerElement;
```

## 样式定制

组件内置了炫酷的流光渐变滚动条样式，包含以下特性：

- **多彩流光轨道**: 渐变色轨道背景，持续流动动画
- **流光滑块**: 多色渐变滑块，带有发光阴影效果
- **悬停增强**: 鼠标悬停时滚动条放大，流光加速
- **激活脉冲**: 拖动时触发脉冲动画效果

你可以通过 CSS 自定义容器样式：

```css
.my-custom-class {
  /* 自定义容器样式 */
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px 0;
}

/* 如果需要自定义滚动条样式，可以覆盖默认样式 */
.my-custom-class::-webkit-scrollbar {
  height: 8px;
}

.my-custom-class::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #your-color-1, #your-color-2);
}
```

## 注意事项

1. 容器内容需要设置为横向布局（如 `display: flex`）才能实现横向滚动
2. 悬停区域默认为容器底部 16px，可通过 `scrollbarAreaHeight` 调整
3. 在开发环境下可以设置 `showScrollbarArea: true` 来可视化滚动区域
4. 组件会自动检测内容变化，无需手动触发更新
