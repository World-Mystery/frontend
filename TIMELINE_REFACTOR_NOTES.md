# 健康计划时间线重构文档

## 概述
已完全重构 `DailyTimeline` 组件，从基于列表/行的排列改为**绝对定位架构**，解决了时间刻度不准确和冗余占位符问题。

## 核心改进

### 1. 绝对定位架构（Absolute Positioning）

#### 尺寸计算公式
```javascript
const PIXELS_PER_MINUTE = 2.5  // 可调参数
卡片 top = (开始时间分钟数 - 起始时间) * PIXELS_PER_MINUTE
卡片 height = 持续分钟数 * PIXELS_PER_MINUTE
```

**示例**：
- 15分钟卡片：37.5px 高度（足够显示单行文本）
- 30分钟卡片：75px 高度
- 60分钟卡片：150px 高度

#### 主要特点
- 时间线容器设置 `position: relative`，总高度 = (23:00 - 06:00) * 2.5 = 2550px
- 所有日程卡片使用 `position: absolute`
- 卡片高度准确反映其持续时间

### 2. 移除冗余占位符

**之前（存在的问题）**：
- 生成每个15分钟时段的DOM节点（15:00, 15:15, 15:30 等）
- 每个时段都有一个点击目标和"+"按钮
- 总共编生成约68个时间槽节点，占用大量资源

**之后（改进）**：
- 删除所有个别时间槽元素
- 后台网格线使用纯CSS渲染（就使用 `border-t`）
- 统一点击监听在容器级别

### 3. 背景网格设计

```typescript
// 整点线（粗）：border-border/50
// 30分钟线（细）：border-border/20
// 时间标签：绝对定位在左侧，不占据流布局
```

特点：
- 网格线在底层绝对定位，不阻拦交互
- 使用 `pointer-events: none` 确保背景不干扰鼠标事件
- 时间标签仅显示整点（06:00, 07:00, ...23:00）

### 4. 统一点击监听（Click Handler）

#### 实现逻辑
```typescript
function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
  const rect = timelineRef.current.getBoundingClientRect()
  const y = e.clientY - rect.top + timelineRef.current.scrollTop
  const minutesFromStart = Math.floor(y / PIXELS_PER_MINUTE)
  const roundedMinutes = Math.floor(minutesFromStart / 15) * 15
  const time = minutesToTime(roundedMinutes)
  onClickTimeslot(time)
}
```

#### 计算细节
1. 获取鼠标点击的Y坐标（相对于容器顶部，考虑滚动）
2. 将Y坐标除以 `PIXELS_PER_MINUTE` 得到分钟数
3. 向下取整到最近的15分钟增量
4. 转换回时间字符串并触发新建日程对话框

### 5. 卡片内部样式优化

#### 响应式卡片高度
```typescript
const isShortBlock = height < 40 // 约16分钟以下
const showDetails = !isShortBlock && block.details.length > 0
```

**短卡片（< 40px）**：
- 仅显示图标和标题
- 减小padding和字体大小
- 隐藏详情标签和时间

**标准卡片（≥ 40px）**：
- 显示完整信息：图标、标题、AI标签、时间
- 显示前2个详情标签，超过的显示计数 "+N"
- 悬停时显示操作按钮

#### CSS规则
```css
/* 内容容器 */
display: flex;
flex-direction: column;
flex: 1;
min-width: 0;

/* 标个缝隙处理 */
overflow: hidden;
white-space: nowrap;
text-overflow: ellipsis;
```

### 6. 交互规范

#### 点击卡片行为
✅ **正确**：点击卡片后显示悬浮气泡框（Popover）或抽屉（Drawer）
❌ **错误**：改变卡片在时间轴上的物理高度（破坏时间精度）

#### 操作按钮
- **刷新按钮**：仅对 `meal` 和 `exercise` 类别显示
- **删除按钮**：仅对非AI生成的卡片显示
- **悬停显示**：使用 `opacity-0 group-hover:opacity-100` 实现

## 技术细节

### 时间转换函数

```typescript
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m - TIMELINE_START_HOUR * 60
}

function minutesToTime(minutes: number): string {
  const totalMinutes = minutes + TIMELINE_START_HOUR * 60
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
```

### 布局计算（computeLayout）

维持原有的列分配逻辑，确保重叠卡片并排显示：
1. 按开始时间排序
2. 按时间范围分组
3. 在每组内分配列（0-N）
4. 计算每组的总列数

### 固定高度问题解决

**之前**: `CARD_HEIGHT = 80px`（固定）
**之后**: `height = (endMin - startMin) * PIXELS_PER_MINUTE`（动态）

让时间线能准确展示各日程的实际持续时间。

## 性能改进

| 指标 | 之前 | 之后 | 改进 |
|-----|------|------|------|
| DOM 节点数 | ~68 (时间槽) + 卡片 | 仅卡片 | -68 节点 |
| 点击监听器 | 68 个 | 1 个 | -67 个 |
| 渲染重排频率 | 每次添加卡片重新排列 | 仅卡片影响 | 更稳定 |
| 高度灵活性 | 固定80px | 按分钟计算 | 任意时长卡片都兼容 |

## 配置说明

### 调整时间刻度

修改 `PIXELS_PER_MINUTE` 常数：
```typescript
const PIXELS_PER_MINUTE = 2.5    // 当前值
const PIXELS_PER_MINUTE = 3.0    // 更大的卡片（更清晰）
const PIXELS_PER_MINUTE = 2.0    // 更紧凑的布局
```

### 调整时间范围

修改时间线的起止时间：
```typescript
const TIMELINE_START_HOUR = 6   // 起始时间
const TIMELINE_END_HOUR = 23    // 结束时间
```

### 调整时间线容器高度

当前设置：`height: "calc(100vh - 400px)"`

如需调整可见区域：
```typescript
style={{ height: "600px" }}  // 固定高度
style={{ height: "calc(100vh - 300px)" }}  // 响应式
```

## 已验证

✅ TypeScript 类型检查通过
✅ 无编译错误
✅ 与 `HealthPlanView` 的 props 接口完全匹配
✅ 保持现有的刷新和删除功能
✅ 维持重叠卡片的列分配逻辑

## 后续优化建议

1. **Popover/Drawer 集成**：实现点击卡片时的详情面板（可选）
2. **拖拽编辑**：支持在时间线上拖拽卡片以调整时间
3. **虚拟滚动**：对于日程特别多的场景实现虚拟列表
4. **键盘快捷键**：ESC 关闭对话框、Ctrl+Z 撤销删除等

## 文件修改记录

- ✏️ [daily-timeline.tsx](daily-timeline.tsx) - 完全重构
- ✓ [health-plan-view.tsx](health-plan-view.tsx) - 无更改
- ✓ [types.ts](types.ts) - 无更改
