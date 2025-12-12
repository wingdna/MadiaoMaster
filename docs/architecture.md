
# 🏛 架构决策记录 (Architecture Decision Record)

## 1. 技术栈选择 (Tech Stack)

| 组件 | 选择 | 理由 |
| :--- | :--- | :--- |
| **View Layer** | **React 18** | 组件化开发，强大的状态管理生态，适合复杂的 UI 交互。 |
| **Styling** | **Tailwind CSS** | 原子化 CSS，极大地加速了 UI 开发，便于处理响应式布局。 |
| **3D Rendering** | **CSS3D Transforms** | **关键决策**。未选择 Three.js/WebGL。原因：马吊牌是平面卡片，CSS `transform-style: preserve-3d` 足以实现透视、翻转和堆叠，且 DOM 元素天然支持无障碍访问（a11y）和文本渲染，无需处理 Canvas 中的字体模糊问题，性能开销更低。 |
| **State Management** | **React Hooks** | 使用 `useMaDiaoGame` (Logic), `useUIState` (UI) 等自定义 Hooks 分离关注点，避免 Redux 的样板代码。 |
| **AI Backend** | **Google Gemini API** | 提供强大的自然语言理解（规则问答）和逻辑推理能力（AI 出牌策略），且支持较长的 Context Window。 |
| **Backend/DB** | **Supabase / MemFire** | 提供现成的 Auth、Database 和 Realtime 功能，适合 Serverless 架构。 |

## 2. 核心架构设计 (Core Design Patterns)

### 2.1 游戏循环与状态分离
采用 **MVVM (Model-View-ViewModel)** 变体：
- **Model (`types.ts`, `services/`)**: 纯 TypeScript 逻辑。`riskEngine`（风控引擎）、`scoringService`（算分服务）、`kaiChongRules`（开冲规则）均为纯函数，不依赖 React，易于单元测试。
- **ViewModel (`useMaDiaoGame.ts`)**: 唯一的“真理之源”（Source of Truth）。管理 `phase`（游戏阶段）、`players`（玩家状态）、`tableCards`（桌牌）等核心状态，并通过 `GameEvent`流向 UI 发送信号。
- **View (`components/`)**: 纯展示组件。`Scene3D` 负责渲染，`HumanHandHUD` 负责交互。

### 2.2 皮肤系统 (Strategy Pattern)
通过 `ISkin` 接口定义了一套完整的视觉规范（Layout, Card, HUD, Effects）。
- 具体的皮肤实现（如 `ImperialSkin`, `MingSkin`）作为策略注入到 `SkinContext` 中。
- **优势**: 切换皮肤只需更改 Context 中的 ID，无需修改任何 UI 组件代码。实现真正的“换肤”而非简单的 CSS 变量替换。

### 2.3 布局引擎 (Layout Engine)
在 `Scene3D.tsx` 中实现了 `LAYOUT_CONFIGS` 字典。
- 根据 `useLayoutMode` 钩子检测屏幕宽高比，动态切换配置（Desktop, Mobile Portrait, Mobile Landscape）。
- **关键参数**: `camera.rotateX` (摄像机角度), `table.height` (牌桌物理高度), `players.position` (3D 坐标)。

#### 📐 关键布局策略：无限长桌 (Endless Table Strategy)
针对移动端竖屏（Mobile Portrait），我们锁定了一套“黄金参数”以解决视口黑边和透视违和感：
- **Table Height**: `145vh` (极大溢出值)。这保证了在 `rotateX` 倾斜后，牌桌底部依然能延伸出屏幕下沿，不会看到“桌脚”或黑边。
- **Table Y**: `60%` (重心下移)。将牌桌中心点推向屏幕下方，结合倾角，使玩家感觉坐在桌边，而非俯瞰悬空的板子。
- **Rotate X**: `35deg`。保留纵深感的同时，避免倾斜过度导致远处内容难以辨认。
- **Cam Z**: `-50`。拉近镜头，增强沉浸感。
> **警告**: 修改上述参数极易破坏移动端体验，请务必在真机测试后再调整。

## 3. 已知限制与解决方案 (Limitations & Solutions)

### 3.1 移动端 SVG 滤镜兼容性
- **问题**: 在部分低端 Android 机型或旧版 iOS WebView 中，复杂的 SVG `feTurbulence` 滤镜会导致 GPU 渲染异常，表现为背景变黑或纹理闪烁。
- **解决方案 (v0.9.2)**: 引入 `graphicsQuality` 设置。在移动端默认检测并降级为 `LOW` 质量，使用 CSS `linear-gradient` 和 `radial-gradient` 模拟纹理，移除 SVG 滤镜依赖。

### 3.2 竖屏布局的纵深感
- **问题**: 竖屏模式下，为了看清所有玩家，摄像机往往需要拉远，导致牌桌显得很短，下方留有黑边。
- **解决方案 (v0.9.2)**: 实施“无限长桌”方案。将牌桌高度设为 `145vh`（远超屏幕高度），并将摄像机角度固定为 35度，配合 `tableY: 60%` 下沉重心，使得牌桌视觉上延伸至屏幕底端之外，增强沉浸感。

### 3.3 AI 响应延迟
- **问题**: Gemini API 调用存在网络延迟（1-2秒），影响出牌流畅度。
- **解决方案**: 
    1. **启发式回退 (Heuristic Fallback)**: 在 `geminiService` 中实现了一套本地规则算法（基于手牌价值排序）。如果 API 失败或超时，立即使用本地算法接管。
    2. **预加载/异步**: AI 思考期间播放 "Thinking..." 动画，掩盖延迟感。

### 3.4 3D 卡牌穿模 (Z-Fighting / Clipping)
- **问题**: 当卡牌在桌面出牌区以站立姿态（`rotateX(-25deg)`）显示时，由于 `TableSlab` 有物理厚度，卡牌下半部分会旋转切入桌面内部，导致视觉上被桌面纹理遮挡。
- **解决方案 (v0.9.11)**: 计算旋转后的最低点深度。对于高度 100px 的卡牌，倾斜 25 度会导致底部下降约 20px。因此，`TableCards` 容器的基础 Z 轴偏移量必须设定为 `> 30px` (原为 2px)，以确保卡牌整体悬浮于桌面之上。
