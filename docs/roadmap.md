
# 🐎 马吊大师 (Ma Diao Master) - 项目路线图

**当前版本**: v0.9.2 (Mobile Polish Beta)
**最后更新**: 2024-05-22

---

## ✅ 已完成功能 (Completed)

### 核心玩法 (Core Gameplay)
- [x] **完整规则引擎**: 实现40张牌、4花色（十字、贯索、文钱）的大小顺序与变幻规则。
- [x] **出牌逻辑**: 包含发牌、跟牌、捉打（Capture）、灭牌（Discard/Melt）逻辑。
- [x] **特殊阶段**: 自动执行“比张”（Bi Zhang）与“开冲”（Kai Chong）阶段逻辑。
- [x] **算分系统**: 实现吊数（Diao）、开注、敲门、色样（Pattern）、开冲色样的自动结算。

### AI 与 智能体 (AI & Agents)
- [x] **Gemini 驱动**: 集成 Google Gemini API，实现 AI 导师（Chat Tutor）与 TTS 语音。
- [x] **策略引擎**: AI 玩家具备性格参数（激进/保守/诈唬），支持“学习记忆”（Win-Stay, Lose-Shift）。
- [x] **三防逻辑**: 实现《马吊牌经》中的“防桩”、“防百老”、“防色样”战术判定。

### 视觉与交互 (Visuals & UI)
- [x] **CSS 3D 引擎**: 自研 `Scene3D` 渲染管线，支持高性能的 3D 透视变换，无需 WebGL。
- [x] **皮肤系统**: 支持热切换皮肤（御制黑漆、圣诞绒布、明代黄花梨、道家水墨）。
- [x] **响应式布局**: 
    - 桌面端 (Desktop): 宽屏影院模式。
    - 移动端竖屏 (Mobile Portrait): "无限长桌"设计，侧边玩家垂直堆叠布局。
    - 移动端横屏 (Mobile Landscape): 沉浸式宽视野。
- [x] **特效**: 动态光照（StoveLighting）、金沙流动边框、粒子滤镜效果。

### 基础设施 (Infrastructure)
- [x] **云端同步**: Supabase/MemFire 集成，支持用户资料、好友系统、战绩上传。
- [x] **管理后台**: `AdminGate` 用于查看全服比赛日志。

---

## 🚧 待开发功能 (In Progress / To Do)

### 短期目标 (v1.0 Release)
- [ ] **多人联机 (Real-time Multiplayer)**:
    - 基于 Supabase Realtime 实现 WebSocket 房间机制。
    - 玩家断线重连与 AI 接管。
- [ ] **新手引导 (Onboarding)**:
    - 交互式教程关卡（Tutorial Scenario），手把手教学“三防”。
- [ ] **音效增强**:
    - 添加发牌、筹码撞击、背景环境音（茶馆嘈杂声、古琴）。

### 长期规划 (Future)
- [ ] **生涯模式 (Campaign)**:
    - 模拟明代士大夫晋升之路，通过打牌获得官职。
- [ ] **牌谱分析器**:
    - 记录整局牌谱，利用 LLM 分析每一步的优劣手（类似围棋 AI 复盘）。
- [ ] **VR/AR 适配**:
    - 探索 WebXR 支持，实现沉浸式打牌体验。
