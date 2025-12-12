
# 🛠 开发日志 (Development Log)

## v0.9.11 - Mobile Layout V7: Clip Fix & Polish
**日期**: 2024-05-24

### 🐛 修复与调整 (Fixes & Tweaks)
-   **布局 V7 (Layout V7)**:
    -   **Compass Lift**: 将罗盘和出牌中心点再次上移 (`cardCenterOffset.y: 50`, Compass `translateY: 5%`)，确保其视觉位置位于底部“出牌”按钮上方，避免重叠。
    -   **Anti-Clipping**: 修复了出牌区卡牌被桌面遮挡的问题。
        -   问题根源：卡牌采用 `rotateX(-25deg)` 站立姿态，导致下半部分穿模进入 `TableSlab` 平面（Z=20px）。
        -   解决方案：将 `TableCards` 的基础 Z 轴高度提升至 **35px**，确保卡牌旋转后的最低点依然高于桌面纹理层。

---

## v0.9.10 - Mobile Layout V6: High Contrast
**日期**: 2024-05-23

### 🐛 修复与调整 (Fixes & Tweaks)
-   **布局重构 (Layout V6)**:
    -   **Table Y**: 增加至 **82%**，将牌桌重心（罗盘）大幅下移，接近屏幕底部，创造极深的透视感。
    -   **Rotate X**: 增加至 **45deg**，平视角度更大，减少纵向压缩。
    -   **Compass & Cards**: 将 `tableCardSpread` 紧缩至 `{ x: 35, y: 60 }`，确保所有玩家的出牌严格限制在罗盘图形范围内，不再溢出。
    -   **Player Positions**:
        -   **Top**: 上移至 `2%`，紧贴屏幕顶部边缘，最大化与牌桌的距离感。
        -   **Sides**: 调整至 `25%`，位于屏幕中上部，避开拥挤的中央区域。
    -   **Controls**: 底部操作按钮上移至 `22%`，悬浮于手牌之上，避免遮挡或误触。

---

## v0.9.9 - Mobile Layout V5: Precision Alignment
**日期**: 2024-05-23

### 🐛 修复与调整 (Fixes & Tweaks)
-   **布局精修 (Layout Refinement)**:
    -   **Width**: 调整为 `98vw`，确保牌桌完美填充屏幕宽度且不溢出，消除“过宽”或“过窄”的视觉问题。
    -   **Sink**: `tableY` 下沉至 **76%**，配合 **42deg** 的 `rotateX`，强化了“伏案”的临场感，腾出了上方空间用于显示玩家。
    -   **Crosshairs**: 在罗盘中绘制了清晰的金色虚线十字准星，作为视觉锚点。
    -   **Card Alignment**: 重新校准了 `tableCardSpread` 参数 (`x: 60, y: 90`)，确保玩家打出的牌准确落在罗盘的十字线上，视觉逻辑更加严谨。

---

## v0.9.8 - Mobile Layout V4: Wide & Open
**日期**: 2024-05-23

### 🐛 修复与调整 (Fixes & Tweaks)
-   **解决“窄长条”问题**: 
    -   将移动端竖屏（Mobile Portrait）的 `table.width` 从 96vw 激增至 **140vw**。
    -   这使得牌桌在视觉上横向延展，占据整个屏幕宽度并向外溢出，彻底消除了“细长跑道”的感觉，营造出宽阔桌面的沉浸感。
    -   配合恢复 `rotateX` 至 **35deg**，增强了物体的体积感。
-   **优化视野遮挡**:
    -   **Raising Avatars**: 将左右侧玩家头像位置从 40% 上提至 **20-22%**。这腾出了巨大的屏幕中心区域，让玩家能清晰看到牌桌中央的罗盘和出牌区。
    -   **Lowering Controls**: 将底部的“出牌”胶囊按钮下沉至 **10%**（原16%），使其更贴近手牌，进一步减少对牌桌视野的遮挡。
    -   **Table Y Adjustment**: 牌桌重心微调至 **68%**，配合上述改动，确保手牌、桌面、罗盘和对手在视觉上形成自然的纵深层次。

---

## v0.9.7 - Mobile Layout Polish
**日期**: 2024-05-23

### 🐛 修复与调整 (Fixes & Tweaks)
-   **竖屏布局再平衡 (Layout Rebalance)**: 
    -   撤回了 v0.9.6 中过于激进的 `tableY: 88%` 设置，修正为 **`72%`**。此举解决了牌桌远端过窄、与顶部玩家视觉断裂的问题。
    -   将 `rotateX` 减小至 **`28deg`**（原 40deg），创造更平缓的景深，使牌桌看起来更长，自然延伸至远处。
    -   调整了侧边玩家位置，将其垂直坐标从 35% 下移至 **40%**，以对齐新的牌桌重心。

---

## v0.9.6 - Immersion Deep Dive
**日期**: 2024-05-23

### 🐛 修复与调整 (Fixes & Tweaks)
-   **深度沉浸视角 (Extreme Sink)**: 
    -   响应用户请求，将移动端竖屏（Mobile Portrait）模式下的 `tableY` 进一步下沉至 **88%**。
    -   配合调整 `rotateX` 至 **40deg**，确保在极低视角下依然能看清牌桌全貌，增强“伏案”的临场感。
    -   `table.width` 设置为 **100vw**，完美填充屏幕宽度。

---

## v0.9.5 - Visual Correction: Mobile Layout
**日期**: 2024-05-23

### 🐛 修复 (Bug Fixes)
-   **竖屏布局修正 (Mobile Portrait Fix)**: 
    -   针对用户反馈的“牌桌悬空”和“左右溢出”问题进行了参数调整。
    -   **Table Y**: 提升至 **75%** (原 60%)，显著下沉牌桌重心，填补了底部与手牌的视觉空隙。
    -   **Table Width**: 缩减至 **95vw** (原 130vw)，消除了两侧超出屏幕界限的视觉问题。
    -   **Rotate X**: 调整为 **30deg**，优化俯视角度以适应新的高度。

---

## v0.9.4 - Stability Lock & Knowledge Update
**日期**: 2024-05-23

### 🔒 锁定 (Locked)
-   **布局参数冻结**: 经过多次迭代，确认了移动端竖屏（Mobile Portrait）的最佳参数组合：
    -   `tableY: 60%`
    -   `rotateX: 35deg`
    -   `table.height: 145vh`
    -   `camera.z: -50`
    -   此配置已被记录在 `architecture.md` 中，防止未来因误修改导致布局崩坏（如牌桌上浮、黑边重现）。

### 🧠 知识库更新 (Knowledge Base Update)
-   更新了对 CSS3D 在移动端视口行为的理解：单纯使用 `vh` 在强透视下不足以覆盖全屏，必须配合 Overshoot（溢出设计）和 Center Offset（重心偏移）来模拟真实的坐姿视角。

---

## v0.9.3 - Hotfix: Mobile Layout Restoration
**日期**: 2024-05-23

### 🐛 修复 (Bug Fixes)
-   **牌桌位置回归 (Table Positioning Fix)**: 
    -   修复了 v0.9.2 中因 `tableY: 38%` 导致的移动端竖屏模式下牌桌位置过高、底部黑边严重的问题。
    -   **Solution**: 将 `mobile_portrait` 布局配置回滚至先前稳定版本：
        -   `tableY`: **60%** (重心下沉，贴合底部)。
        -   `rotateX`: **35deg** (恢复标准俯视角度)。
        -   `camera.z`: **-50** (拉近镜头)。
    -   **Result**: 牌桌再次完美延伸至屏幕底端，沉浸感恢复。

---

## v0.9.2 - Mobile Polish & Texture Fixes
**日期**: 2024-05-22

### 🔄 变更 (Changes)
1.  **移动端竖屏布局重构 (Mobile Portrait Layout Overhaul)**:
    -   **侧边玩家 (Left/Right)**: 改为垂直堆叠布局。头像位于 35% 高度，AI 手牌位于 50%，得牌堆位于 65%。解决了侧边信息拥挤的问题。
    -   **顶部玩家 (Top)**: 改为水平展开布局。得牌堆(左)-头像(中)-手牌(右)。
    -   **牌桌延伸**: 将牌桌高度增加至 `145vh`，配合 `tableY: 60%` 和 `rotateX: 35deg`，消除了屏幕下方的视觉空隙（黑边）。

2.  **纹理渲染引擎优化 (Texture Engine Rewrite)**:
    -   移除了 `imperialSkin` 和 `mingSkin` 中不稳定的 SVG `feTurbulence` 滤镜背景。
    -   **Fix**: 使用 CSS `radial-gradient` 和 `linear-gradient` 叠加技术重写了“黑漆金沙”和“黄花梨木纹”效果。
    -   **Result**: 彻底修复了部分移动端浏览器上背景显示为纯黑或纯白的问题，显著提升了渲染帧率。

3.  **交互优化**:
    -   移动端竖屏模式下，将“出牌”按钮集成到玩家头像胶囊（Player Capsule）中，去除了独立的悬浮按钮，使界面更清爽。

### 🐛 修复 (Bug Fixes)
-   修复了 `Scene3D` 在极端宽屏比下，牌桌两侧留白过多的问题（通过增加 Table Width 至 145vw）。
-   修复了 AI 玩家在“开冲”（Kai Chong）阶段可能卡死的问题（增加了 `timer` 清理和边界检查）。

---

## v0.9.1 - Risk Engine & AI Personality
**日期**: 2024-05-20

### 🔄 变更 (Changes)
1.  **三防风控引擎 (Risk Engine)**:
    -   实现了 `evaluatePlayRisk` 函数，能够检测“急捉”、“漏庄”、“纵趣”等 12 种违例情况。
    -   UI 新增“战术警示”弹窗，当玩家操作可能导致包赔时进行阻断提示。

2.  **AI 个性化 (AI Personality)**:
    -   为 AI 增加了 `aggression` (激进), `riskTolerance` (风险容忍), `bluffFrequency` (诈唬) 属性。
    -   实现了动态学习机制：赢了强化当前策略，输了调整策略。

---

## v0.9.0 - Initial Beta
**日期**: 2024-05-15

-   完成核心 40 张牌逻辑。
-   完成四大皮肤设计。
-   接入 Gemini API 进行聊天。
