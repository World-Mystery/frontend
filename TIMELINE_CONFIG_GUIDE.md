# 时间线配置快速参考

## 📐 核心常数（都定义在 daily-timeline.tsx 顶部）

### PIXELS_PER_MINUTE - 空间密度

```typescript
const PIXELS_PER_MINUTE = 2.5  // 当前值
```

| 值 | 15分钟块高度 | 说明 | 适用场景 |
|-----|-------------|------|---------|
| `2.0` | 30px | 紧凑 | 日程很密集的用户 |
| **2.5** | **37.5px** | **推荐** | **一般用户** |
| `3.0` | 45px | 宽松 | 强调视觉清晰度 |
| `4.0` | 60px | 很宽松 | 可访问性优化 |

**修改方法**：
```typescript
// 第 37 行，修改数值后自动应用到所有计算
const PIXELS_PER_MINUTE = 3.0  // 改大更清晰，改小更紧凑
```

---

### 时间范围

```typescript
const TIMELINE_START_HOUR = 6   // 当前：早上 6 点
const TIMELINE_END_HOUR = 23    // 当前：晚上 11 点
```

**计算得出的总高度**：
```
TOTAL_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60
TIMELINE_HEIGHT = TOTAL_MINUTES * PIXELS_PER_MINUTE

当前：(23 - 6) * 60 * 2.5 = 1020 * 2.5 = 2550px
```

**修改示例**：
```typescript
// 改为 5:00 - 24:00（跨度 19 小时）
const TIMELINE_START_HOUR = 5
const TIMELINE_END_HOUR = 24

// 新高度 = 19 * 60 * 2.5 = 2850px
```

---

## 📏 卡片高度计算

### 一个完整的例子

```
日程：08:30 - 09:15 的"早操"（45 分钟）

1. 计算分钟数：
   startMin = 8 * 60 + 30 - 6 * 60 = 510 - 360 = 150 分钟
   endMin = 9 * 60 + 15 - 6 * 60 = 555 - 360 = 195 分钟
   duration = 195 - 150 = 45 分钟

2. 计算 top 位置：
   top = 150 * 2.5 = 375px（从时间线顶部向下 375 像素）

3. 计算高度：
   height = 45 * 2.5 = 112.5px

结果：卡片在 Y=375px 处，高度 112.5px（准确表示 45 分钟）
```

---

## 🖱️ 点击交互公式

### 从点击位置计算时间

用户在 Y = 300px 处点击时间线：

```typescript
// 1. 计算相对于时间线顶部的距离
y = 300px  // 鼠标相对于容器顶部的位置

// 2. 将像素转换为分钟
minutesFromStart = floor(300 / 2.5) = floor(120) = 120 分钟

// 3. 向下取整到 15 分钟边界
roundedMinutes = floor(120 / 15) * 15 = 8 * 15 = 120 分钟

// 4. 转换为时间字符串
time = minutesToTime(120)
     = totalMinutes = 120 + 6*60 = 480 分钟
     = h = floor(480 / 60) = 8
     = m = 480 % 60 = 0
     = "08:00"

结果：用户点击 Y=300px 创建 08:00 的日程
```

### 15分钟取整的目的

```typescript
// 没有取整
y = 312px → 124.8分钟 → "08:04"（用户困惑：为什么是 4 分？）

// 有取整
y = 312px → 124.8分钟 → floor(124.8/15)*15 = 120分钟 → "08:00"（自然）
```

---

## 🎨 卡片响应式样式

### 短卡片 vs 标准卡片

```typescript
const isShortBlock = height < 40  // 约 16 分钟以下

// 短卡片（< 40px）：
// ├─ 隐藏：时间范围、详情标签
// └─ 显示：图标、标题

// 标准卡片（≥ 40px）：
// ├─ 显示：图标、标题、时间、AI 标签
// └─ 显示：前 2 个详情标签（超过显示 "+N"）
```

### 高度范围参考

| 分钟数 | 高度 | 显示内容 |
|--------|------|---------|
| 15分钟 | 37.5px | 仅图标+标题 |
| 20分钟 | 50px | 标题+时间 |
| 30分钟 | 75px | 标题+时间+1-2个标签 |
| 60分钟 | 150px | 完整内容 |

---

## 🔧 常见调整场景

### 场景 1：日程密集，需要更紧凑

```typescript
// 改小 PIXELS_PER_MINUTE
const PIXELS_PER_MINUTE = 1.8

// 效果：15分钟块从 37.5px → 27px，时间线总高度从 2550px → 1836px
```

### 场景 2：需要更大的卡片便于操作

```typescript
// 改大 PIXELS_PER_MINUTE
const PIXELS_PER_MINUTE = 3.5

// 效果：15分钟块从 37.5px → 52.5px，时间线总高度从 2550px → 3570px
```

### 场景 3：用户需要显示夜间日程

```typescript
// 延长时间范围
const TIMELINE_START_HOUR = 5
const TIMELINE_END_HOUR = 24

// 新增 6 小时，总高度从 2550px → 2850px
```

### 场景 4：用户只关注上班时间

```typescript
// 缩小时间范围
const TIMELINE_START_HOUR = 8
const TIMELINE_END_HOUR = 20

// 仅 12 小时，总高度从 2550px → 1800px
```

---

## 🐛 调试技巧

### 打印坐标计算

在 `handleTimelineClick` 中添加日志：

```typescript
function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
  const rect = timelineRef.current!.getBoundingClientRect()
  const y = e.clientY - rect.top + timelineRef.current!.scrollTop
  const minutesFromStart = Math.floor(y / PIXELS_PER_MINUTE)
  const roundedMinutes = Math.floor(minutesFromStart / 15) * 15
  const time = minutesToTime(roundedMinutes)

  // 调试日志
  console.log(`点击 Y=${y.toFixed(1)}px → ${minutesFromStart}分钟 → ${time}`)

  onClickTimeslot(time)
}

// 控制台输出示例：
// 点击 Y=375.5px → 150分钟 → 08:30
// 点击 Y=500.0px → 200分钟 → 09:20
```

### 验证卡片高度

在 `ScheduleBlockCard` 中添加日志：

```typescript
const startMin = timeToMinutes(block.startTime)
const endMin = timeToMinutes(block.endTime)
const height = (endMin - startMin) * PIXELS_PER_MINUTE

console.log(`${block.title}: ${block.startTime}-${block.endTime} = ${endMin - startMin}分钟 → ${height}px`)

// 控制台输出示例：
// 早餐: 06:00-06:30 = 30分钟 → 75px
// 散步: 07:00-08:00 = 60分钟 → 150px
```

---

## 📞 常见问题

### Q: 为什么我的卡片看起来很小？
**A:** 检查 `PIXELS_PER_MINUTE` 是否太小。建议值 2.5-3.5。

### Q: 点击后没有创建日程?
**A:** 确保 `onClickTimeslot` 正确传递给父组件 `HealthPlanView`。

### Q: 时间线太长了，滚动困难？
**A:** 增加容器的固定高度或减小 `PIXELS_PER_MINUTE`。

### Q: 如何禁用点击创建功能？
**A:** 移除 `onClick={handleTimelineClick}` 或添加条件判断。

### Q: 能否支持其他时间间隔（不是 15 分钟）？
**A:** 在 `handleTimelineClick` 中修改舍入逻辑：
```typescript
// 改为 30 分钟对齐
const roundedMinutes = Math.floor(minutesFromStart / 30) * 30

// 改为 1 分钟精确
const roundedMinutes = minutesFromStart
```

---

## 🚀 高级定制

### 自定义背景网格颜色

在 DailyTimeline 组件中修改：

```typescript
<div
  className="absolute left-0 right-0 border-t border-border/50"  // ← 修改这里
  style={{ top: 0 }}
/>

// 其他选项：
// "border-blue-300"      // 蓝色
// "border-green-300"     // 绿色
// "border-slate-200"     // 浅灰色
// "border-border/70"     // 更深的边框
```

### 自定义卡片最小高度阈值

修改短卡片判定：

```typescript
// 当前：height < 40 为短卡片
const isShortBlock = height < 40

// 改为：height < 60 为短卡片（隐藏更多细节）
const isShortBlock = height < 60
```

---

## 📊 监控指标

### 推荐的配置组合

```typescript
// 配置 A：一般用户（推荐）
const PIXELS_PER_MINUTE = 2.5
const TIMELINE_START_HOUR = 6
const TIMELINE_END_HOUR = 23
// 总高度: 2550px，容器高度建议: 600-800px

// 配置 B：日程密集的用户
const PIXELS_PER_MINUTE = 1.8
const TIMELINE_START_HOUR = 5
const TIMELINE_END_HOUR = 24
// 总高度: 1980px，容器高度建议: 400-600px

// 配置 C：强调视觉清晰度
const PIXELS_PER_MINUTE = 3.5
const TIMELINE_START_HOUR = 7
const TIMELINE_END_HOUR = 22
// 总高度: 3150px，容器高度建议: 800-1000px
```

---

## 最后的检查清单

- [ ] 验证 `PIXELS_PER_MINUTE` 符合您的视觉需求
- [ ] 确认时间范围（`START_HOUR` - `END_HOUR`）包含所有日程
- [ ] 测试点击创建功能（验证时间对齐）
- [ ] 检查长卡片和短卡片的显示效果
- [ ] 在移动设备上测试滚动性能
- [ ] 确保与现有的日程数据兼容
