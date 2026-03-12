# 时间线重构 - 改进前后对比

## 1. 架构方案对比

### ❌ 之前：固定高度 + 时间槽占位符

```typescript
// 生成所有时间槽（每15分钟）
const timeSlots: string[] = []
for (let h = 6; h <= 22; h++) {
  for (let m = 0; m < 60; m += 15) {
    // 产生: ["06:00", "06:15", "06:30", "06:45", ..., "22:45"]
    // 总共 68 个元素 + 对应的 68 个 DOM 节点
    timeSlots.push(`${h}:${m}`)
  }
}

const CARD_HEIGHT = 80  // 所有卡片固定高度
const SLOT_HEIGHT = 80  // 每个时间槽高度

function getBlockHeight(startTime, endTime) {
  return CARD_HEIGHT  // ❌ 45分钟的卡片和15分钟的卡片一样高！
}

// 总高度 = 时间槽数 × SLOT_HEIGHT = 68 × 80 = 5440px
<div style={{ height: `calc(${timeSlots.length} * ${SLOT_HEIGHT}px)` }}>
  {timeSlots.map((slot) => (
    <div key={slot}>
      <button onClick={() => onClickTimeslot(slot)}>
        <Plus className="h-3.5 w-3.5" />  {/* 68 个 "+" 按钮 */}
      </button>
    </div>
  ))}
  {/* 卡片位置... */}
</div>
```

**问题**：
- 🔴 固定高度无法准确表示事件的实际持续时间
- 🔴 68 个时间槽占位符 DOM 节点浪费资源
- 🔴 68 个独立的点击事件监听器
- 🔴 时间线高度与实际时间跨度脱离（应为 1020 分钟 = 2550px）

---

### ✅ 之后：动态高度 + 统一点击监听

```typescript
// 仅定义常数，无需生成数组
const PIXELS_PER_MINUTE = 2.5
const TIMELINE_START_HOUR = 6
const TIMELINE_END_HOUR = 23
const TOTAL_MINUTES = (23 - 6) * 60  // 1020 分钟

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m - TIMELINE_START_HOUR * 60
}

function getBlockHeight(startTime: string, endTime: string): number {
  const startMin = timeToMinutes(startTime)
  const endMin = timeToMinutes(endTime)
  return (endMin - startMin) * PIXELS_PER_MINUTE  // ✅ 按实际分钟数计算
}

// 总高度 = 1020 分钟 × 2.5px = 2550px
<div 
  style={{ height: "calc(100vh - 400px)" }}
  onClick={handleTimelineClick}  // ✅ 统一点击监听
>
  {/* 背景网格线 - 每小时一条（仅 17 条线） */}
  {Array.from({ length: 18 }).map((_, i) => (
    <div key={i} className="border-t border-border/50">
      <span>{TIMELINE_START_HOUR + i}:00</span>
    </div>
  ))}
  
  {/* 卡片使用 position: absolute 和动态高度 */}
  {positioned.map((block) => (
    <ScheduleBlockCard
      top={block.startMin * PIXELS_PER_MINUTE}
      height={(block.endMin - block.startMin) * PIXELS_PER_MINUTE}
      // ...
    />
  ))}
</div>
```

**优势**：
- ✅ 卡片高度精确反映实际持续时间
- ✅ 0 个占位符 DOM 节点
- ✅ 1 个统一的点击监听器
- ✅ 时间线高度与真实时间完全对应

---

## 2. 点击交互对比

### ❌ 之前：每个时间槽有单独的点击按钮

```typescript
{timeSlots.map((slot) => (
  <button
    onClick={() => onClickTimeslot(slot)}
    className="... hover:bg-accent/40"
    style={{ height: `${SLOT_HEIGHT}px` }}
  >
    <Plus className="h-3.5 w-3.5" />
  </button>
))}

// 问题：
// 1. 用户只能在特定的 15 分钟边界点击
// 2. 无法在 12:13 点击来创建 12:00 的日程
// 3. 需要 68 个事件监听器
```

**用户体验**: 必须点击精确的时间槽才能创建日程

---

### ✅ 之后：根据点击 Y 坐标计算时间

```typescript
function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
  if (!timelineRef.current) return
  
  // 获取点击位置的 Y 坐标
  const rect = timelineRef.current.getBoundingClientRect()
  const y = e.clientY - rect.top + timelineRef.current.scrollTop
  
  // 反向计算时间
  const minutesFromStart = Math.floor(y / PIXELS_PER_MINUTE)
  const roundedMinutes = Math.floor(minutesFromStart / 15) * 15  // 取整到 15 分钟
  const time = minutesToTime(roundedMinutes)
  
  onClickTimeslot(time)
}

// 示例计算：
// 用户点击 Y = 252px
// minutesFromStart = floor(252 / 2.5) = 100 分钟
// roundedMinutes = floor(100 / 15) * 15 = 100 分钟 = 07:40
// time = minutesToTime(100) = "07:40"→取整到"07:30"
```

**用户体验**: 点击任意位置，系统自动对齐到最近的 15 分钟

---

## 3. 卡片高度示例

### 场景：用户的日程安排

```
Time      Event         Duration    Old Height   New Height
────────────────────────────────────────────────────────
06:00     早餐          30 分钟      80px        75px        ✅
06:45     药物          15 分钟      80px        37.5px      ✅ 短卡片
07:00     散步          60 分钟      80px        150px       ✅
08:00     检查          45 分钟      80px        112.5px     ✅
...
```

**改进点**：
- 15分钟卡片：从 80px → 37.5px（高度自适应）
- 60分钟卡片：从 80px → 150px（充分展示）
- 卡片在时间线上的物理高度完全对应其实际持续时间

---

## 4. 背景网格对比

### ❌ 之前：网格线嵌入时间槽

```
+──────────────────────────────────────+
| 06:00  ─────────────────────────────  |  <- 完整的 80px 行
|        ┌─────────────────────┐        |
|        │ 早餐                │        |  <- 卡片固定 80px
|        └─────────────────────┘        |
+────────────────────────────────────────+
| 06:15  ─────────────────────────────  |  <- 占位符行
|        (可点击 "+" 添加)              |
+────────────────────────────────────────+
| 06:30  ─────────────────────────────  |  <- 占位符行
```

问题：占位符行与卡片混淆，结构不清晰

---

### ✅ 之后：网格线在底层，卡片浮在上层

```
(绝对定位的背景网格)
─────────────────────────────────────────
│  06:00 ←─ 整点线
│                    ┏━━━━━━━━━━━━━┓
│                    ┃ 早餐 (30分钟) ┃  <- 正确高度：75px
│                    ┗━━━━━━━━━━━━━┛
│                  ┏━━━━┓
│                  ┃ 药物 ┃  <- 短卡片：37.5px
────────────────────┃ 15分 ┃────
│  07:00 ←─ 整点线 ┗━━━━┛
│
│              ┏━━━━━━━━━━━━━━━┓
│              ┃ 散步 (60分钟)  ┃
│              ┃              ┃
────────────────┃              ┃────
│  08:00 ←─ 整点线┗━━━━━━━━━━━━━━━┛
```

优势：
- 网格线在视觉底层（pointer-events-none）
- 卡片浮在上层，清晰可见
- 卡片高度与时间精确对应

---

## 5. DOM 结构对比

### ❌ 之前

```
<div height="5440px">
  {timeSlots.map((slot) => (      // 68 次循环
    <div>
      <button onClick={...}>+</button>  // 68 个按钮
      <div className="border-t" />      // 68 条线
      <span>{slot}</span>               // 68 个标签
    </div>
  ))}
  {schedule.map((block) => (
    <ScheduleBlockCard />               // N 个卡片
  ))}
</div>
```

节点数：~68 + N

---

### ✅ 之后

```
<div height="2550px" onClick={handleTimelineClick}>
  {/* 背景网格层 - pointer-events-none */}
  <div className="pointer-events-none">
    {Array.from({ length: 18 }).map((_, i) => (
      <div>
        <div className="border-t" />          // 18 条整点线
        <div className="border-t opacity-20" /> // 18 条 30 分钟线
        <span>{hour}:00</span>                // 18 个时间标签
      </div>
    ))}
  </div>
  
  {/* 日程卡片层 */}
  {schedule.map((block) => (
    <ScheduleBlockCard />                    // N 个卡片
  ))}
</div>
```

节点数：~36 + N（节省 68 个占位符节点）

---

## 6. 性能指标

| 指标 | 之前 | 之后 | 改进 |
|------|------|------|------|
| **时间槽节点** | 68 | 0 | -100% |
| **点击按钮** | 68 | 0 | -100% |
| **事件监听器** | 68+ | 1 | -98% |
| **网格线层** | 68 条 | 36 条 | -47% |
| **总 DOM 节点** | ~200+ | ~100+ | -50% |
| **卡片高度准确度** | ❌ 固定80px | ✅ 按分钟计算 | 大幅提升 |
| **时间线总高度** | 5440px | 2550px | -53% |
| **用户交互准确性** | 仅15分钟点击点 | 任意点击自动对齐 | 更友好 |

---

## 7. 代码可维护性对比

### ❌ 之前：魔法数字满天飞

```typescript
const SLOTS_PER_HOUR = 4
const CARD_HEIGHT = 80
const SLOT_HEIGHT = CARD_HEIGHT

const top = (h - 6) * (SLOTS_PER_HOUR * SLOT_HEIGHT) + (m / 15) * SLOT_HEIGHT
const height = getBlockHeight(...)  // 但开始和结束时间无关，都返回 CARD_HEIGHT

// 时间槽总数依赖于外层循环逻辑，难以维护
```

**问题**：修改一个常数可能破坏其他计算

---

### ✅ 之后：清晰的参数和计算

```typescript
const PIXELS_PER_MINUTE = 2.5      // 明确的尺寸单位
const TIMELINE_START_HOUR = 6      // 明确的时间范围
const TIMELINE_END_HOUR = 23

const top = startMin * PIXELS_PER_MINUTE
const height = (endMin - startMin) * PIXELS_PER_MINUTE

// 计算可读性强，易于调试和扩展
```

**优势**：参数语义清晰，修改时作用范围明确

---

## 总结

| 方面 | 改进 |
|------|------|
| **整体架构** | 从时间槽占位符 → 绝对定位 |
| **高度计算** | 从固定 → 按分钟数动态 |
| **点击交互** | 从 68 个按钮 → 1 个统一监听 |
| **DOM 复杂度** | 从 200+ 节点 → 100+ 节点 |
| **视觉准确性** | 卡片高度完全反映时间长度 |
| **代码可维护性** | 参数明确，逻辑清晰 |
| **用户体验** | 点击任意位置自动对齐 |

**最终效果**：干净、高效、美观的时间线组件，完全消除了冗余占位符的视觉杂乱！
