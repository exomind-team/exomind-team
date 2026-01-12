# ExoMind 工作流开发规范 (LeanSpec v0.7)

> **角色**: ExoMind MVP 阶段的产品设计师与工程师，负责设计完整工作流的第一环节（信息输入）。

---

## 1. ❗Problem（问题）

你每天面对 50+ 信息链接（微信公众号、知乎、小红书），但整个外心工作流缺少第一环节：

**失败链条**:
```
信息过载 → 无过滤直接进入工作流 → 身心状态混乱 → 目标需求模糊 → 任务拆分失效 → 行动记录缺失 → 反馈循环中断
```

**根本问题**:
- 📥 **信息入口混乱**: 50+ 信息链接未经筛选直接冲击身心状态觉察环节
- 🔄 **工作流断层**: 信息输入环节缺失，导致后续环节（身心状态觉察、目标分析等）无输入依据
- 📱 **多端不统一**: 手机、PC、浏览器扩展各自处理信息，无统一工作流入口
- 🧠 **无上下文评估**: Scout Agent v1.3 已验证有效，但未纳入ExoMind工作流（案例001-012孤立存在）

**当前状态**:
- ✅ Scout Agent v1.3 评估协议固化（12 案例验证）
- ✅ `scout_converter.py` 已实现 URL→Markdown 转换
- ❌ ExoMind 完整工作流未实现（仅有外心闭环总Spec概念）
- ❌ 缺少：工作流第一环节"信息输入"的系统化实现

---

## 2. 🧩 What（是什么）

ExoBuffer 是 **ExoMind 工作流的第一环节**：信息输入与智能过滤

**ExoMind 完整工作流**:
```
① 信息输入 (ExoBuffer) → ② 身心状态觉察 → ③ 目标需求分析 → ④ 任务拆分 → ⑤ 行动记录 → ⑥ 反馈
```

**ExoBuffer 核心定位**: 不是独立应用，而是ExoMind工作流的"信息入口"，为后续5个环节提供高质量输入。

**系统架构** (Tauri v2 统一框架):
```
桌面端 (Windows Tauri v2)
    ↓ 同构架构
移动端 (Android Tauri v2)
    ↓ 系统分享 Intent
    ↓ WebSocket 通信
共享服务层 (Tauri v2 IPC)
    ├─ scout_converter.py (URL→Markdown)
    ├─ MiniMax M2.1 Code Plan API (Scout Agent 评估)
    └─ Obsidian Vault (完整报告存储)
```

**关键设计决策**:
- ✅ **统一 Tauri v2 框架**: PC 端和 Android 端共享核心逻辑
- ✅ **工作流导向**: ExoBuffer 输出结构化信息，为"身心状态觉察"环节提供输入
- ✅ **MiniMax API 替代 Claude**: 成本低（50元/月）、速度快、适合简单任务
- ✅ **多端一致**: 桌面端（主控）+ 移动端（便携）+ 浏览器扩展（信息采集）

---

## 3. 🎯 Goal（目标）

阶段1 MVP（3-5天）的成功标志：

- ⚡ **工作流第一环节**: 实现 ExoMind 工作流①信息输入环节的完整闭环
- 📊 **快速评估**: 3-10秒内显示评分（0-10）+ 情报等级，为身心状态觉察环节提供输入
- 🔍 **结构化输出**: Scout 评估结果输出结构化信息（价值评分、行动建议、资源矩阵）
- 🔄 **多端一致**: PC 端（Tauri v2）和 Android 端（Tauri v2）共享核心逻辑
- 📝 **后续环节接口**: 为 ExoMind 工作流②身心状态觉察环节提供标准化输入

**验证标准**:
- ✅ 至少处理 3 篇真实文章，Scout 评估为后续环节提供高质量输入
- ✅ PC 端和 Android 端体验一致，代码复用率高
- ✅ Scout 评估结果格式标准化，支持后续环节直接消费

**非目标** (阶段1):
- ❌ 实现 ExoMind 完整6环节工作流（仅实现第一环节）
- ❌ 支持知乎/小红书（仅验证微信公众号）
- ❌ 实现②-⑥环节（后续开发阶段）

---

## 4. ✅ In-scope（做什么）

### 4.1. 桌面端（Windows Tauri v2）

**核心功能**:
- 🖥️ **主控界面**: 桌面端作为主控制中心，展示所有 Scout 评估结果
- 📋 **评估列表**: 展示所有信息评估结果，支持筛选和排序
- 📝 **工作流导航**: 快速跳转到后续环节（②身心状态觉察等）
- 🔧 **系统配置**: Scout Agent 配置、MiniMax API 设置等

**UI 设计**（桌面端主控界面）:
```
┌─────────────────────────────────────┐
│ ExoMind 工作流 - 信息输入环节        │
├─────────────────────────────────────┤
│                                     │
│  📥 待评估 (3)    ⭐ 高价值 (5)     │
│                                     │
│  ┌─ 评估卡片 1 ───────────────┐   │
│  │ ⭐ 8/10 核心 - 牧之野政治觉醒  │   │
│  │ DEEP_READ 立即行动           │   │
│  │ [展开摘要] [查看全文] [工作流]  │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌─ 评估卡片 2 ───────────────┐   │
│  │ ⭐ 6/10 战略 - 技术文章       │   │
│  │ SKIM 稍后处理               │   │
│  └────────────────────────────┘   │
└─────────────────────────────────────┘
```

**技术栈**:
- Tauri v2.0+（桌面端支持）
- React + TypeScript
- TailwindCSS（UI 样式）
- `tauri-plugin-sql`（本地 SQLite）
- `tauri-plugin-window`（窗口管理）

### 4.2. 移动端（Android Tauri v2）

**核心功能**:
- 📱 **信息捕获**: 使用 `tauri-plugin-sharetarget` 接收系统分享链接
- 📲 **同步评估**: 与桌面端实时同步 Scout 评估结果
- 🔍 **快速预览**: 移动端展示评分和摘要，支持快速决策
- 🔄 **离线缓冲**: 网络断开时本地缓存，网络恢复后自动同步

**技术栈**:
- Tauri v2.0+（Android 支持）
- React + TypeScript
- `tauri-plugin-sharetarget`（Intent 接收）
- `tauri-plugin-sql`（本地 SQLite）
- `tauri-plugin-ipc`（IPC 通信）

### 4.3. 共享服务层（Tauri v2 IPC）

**核心功能**:
- 🔄 **统一处理**: PC 端和 Android 端共享 Scout 评估逻辑
- 🧬 **集成脚本**: 调用 `scout_converter.py` 和 MiniMax API
- 💾 **数据存储**: SQLite 本地存储评估结果
- 🔗 **API 接口**: 为工作流后续环节提供标准化数据接口

**服务架构**（Tauri v2 同构）:
```rust
// Rust 核心服务（PC + Android 共享）
pub struct ScoutService {
    pub api_client: MiniMaxClient,    // MiniMax API
    pub converter: ScoutConverter,   // scout_converter.py 封装
    pub storage: SQLiteStorage,     // 评估结果存储
}

// Tauri 命令（IPC 接口）
#[tauri::command]
async fn evaluate_information(url: String) -> Result<ScoutEvaluation, String> {
    // 1. 调用 scout_converter.py
    let markdown = self.converter.convert(url).await?;

    // 2. 调用 MiniMax API 进行 Scout 评估
    let evaluation = self.api_client.evaluate(markdown).await?;

    // 3. 存储结果
    self.storage.save(evaluation).await?;

    // 4. 返回结构化结果
    Ok(evaluation)
}
```

### 4.4. Scout Agent 评估（MiniMax M2.1 Code Plan API）

**上下文感知评估**:
- 读取 Scout v1.3 提示词协议
- 调用 MiniMax API 进行评估
- 输出结构化评估结果，为工作流后续环节提供输入

**API 调用示例**:
```rust
use reqwest;

async fn call_minimax_api(markdown: &str) -> Result<ScoutEvaluation, Error> {
    let client = reqwest::Client::new();

    let response = client
        .post("https://api.minimax.chat/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&json!({
            "model": "minimax-m2.1",
            "messages": [
                {"role": "system", "content": scout_v13_prompt},
                {"role": "user", "content": format!("请评估以下文章：\n\n{}", markdown)}
            ],
            "max_tokens": 4096,
            "temperature": 0.3
        }))
        .send()
        .await?;

    parse_scout_response(response).await
}
```

**输出结构**（为后续环节提供）:
```json
{
  "input_info": {
    "url": "https://mp.weixin.qq.com/s/xxx",
    "title": "文章标题",
    "author": "作者",
    "captured_at": 1704627623000
  },
  "scout_evaluation": {
    "value_score": 8,
    "value_reasoning": "对齐当前个人成长目标",
    "next_action": "DEEP_READ_AND_REFLECT",
    "confidence": 0.90,
    "resource_matrix": [...],
    "bias_alert": {...}
  },
  "workflow_output": {
    "ready_for_stage_2": true,           // 为身心状态觉察环节准备
    "context_for_awareness": {...},     // 身心状态觉察的输入
    "recommendations": {...}            // 目标需求分析的建议
  }
}
```
---

## 5. 🚫 Non-goals（不做什么）

### 阶段1 明确不做：

- ❌ **实现完整6环节工作流**: ExoMind 工作流仅实现①信息输入环节，②-⑥环节后续开发
- ❌ **跨端复杂同步**: PC 端和 Android 端共享核心逻辑，不做分布式同步
- ❌ **完整 Markdown 阅读器**: PC 端仅展示评估结果和导航，不做全文阅读
- ❌ **支持知乎/小红书**: 阶段1 仅验证微信公众号，多平台支持留给阶段2
- ❌ **离线运行**: 需要网络连接（MiniMax API 调用）
- ❌ **浏览器扩展**: 阶段1 仅 PC 端和 Android 端，浏览器扩展后续开发

### 架构边界：

- 🚫 **不替代 Obsidian**: 完整知识管理仍在 Obsidian Vault 中进行
- 🚫 **不做多用户协作**: 单用户本地部署，无需账号系统
- 🚫 **不做内容编辑**: 评估结果只读，不支持手动修改评分或摘要

---

## 6. ✅ Success Criteria（成功判据）

### MVP 验收标准（必达）:

1. ✅ **工作流第一环节**: 实现 ExoMind 工作流①信息输入环节的完整闭环
2. ✅ **多端一致**: PC 端（Tauri v2）和 Android 端（Tauri v2）代码复用，体验一致
3. ✅ **快速评估**: 3-10秒内显示评分（0-10）和情报等级
4. ✅ **结构化输出**: Scout 评估结果格式标准化，为后续环节提供输入
5. ✅ **工作流导航**: PC 端可快速跳转到后续环节（②身心状态觉察等）
6. ✅ **准确率验证**: 至少处理 3 篇真实文章，Scout 评估为后续环节提供高质量输入

### 用户体验指标:

- ⚡ **入站摩擦**: 从看到文章到提交评估 < 3 秒（2 次点击）
- 🔄 **多端切换**: PC 端和 Android 端数据同步，切换无缝
- 🛡️ **容错能力**: 网络断开后自动重试，恢复后自动同步
- 📊 **错误提示**: 失败原因清晰（"MiniMax API 调用失败" / "转换失败"）

### 技术验证:

- 🔧 Tauri v2 同构架构（PC + Android 共享核心逻辑）
- 💾 SQLite 数据持久化（应用关闭后数据不丢失）
- 🧬 MiniMax API 调用成功率 > 95%
- 📝 Scout 评估结果格式符合工作流后续环节接口规范

---

## 7. ⚠️ Risks（风险）

### 技术风险:

| 风险 | 概率 | 影响 | 缓解方案 |
|------|------|------|---------|
| **Tauri v2 Android 生态不成熟** | 中 | 高 | Day 1 优先验证 Intent 接收，如失败切换至 React Native |
| **MiniMax API 不稳定** | 低 | 中 | 添加指数退避重试 + 降级方案（返回"评估失败"） |
| **PC/Android 架构不一致** | 中 | 中 | 使用 Tauri v2 同构架构，核心逻辑共享 |
| **Python 脚本集成** | 中 | 低 | scout_converter.py 已验证，直接复用 |
| **多端数据同步** | 低 | 中 | SQLite 本地存储 + IPC 通信 |

### 工作流风险:

- 📊 **第一环节质量**: Scout 评估质量直接影响后续5个环节效果
- 🔄 **工作流断层**: 第一环节孤立存在，未与后续环节打通
- 🎯 **上下文丢失**: Scout 评估无法读取工作流状态，导致评分偏差

### 业务风险:

- 📱 **微信封号**: 频繁抓取可能触发风控 → 限制频率（每分钟 < 5 篇）
- ⏱️ **调用限额**: MiniMax API 5小时100次限额 → 优化缓存机制，避免重复调用

---

## 8. ➡️ Next Step（下一步）

### 立即执行（Day 1）:

1. ✅ **Tauri v2 项目初始化**:
   ```bash
   # 安装 Tauri CLI
   cargo install tauri-cli --version "^2.0.0"

   # 初始化项目（桌面端）
   cargo tauri init --dist-dir "../dist" --dev-path "http://localhost:1420"

   # 添加 Android 支持
   cargo tauri android init
   ```

2. ✅ **核心依赖添加**:
   ```bash
   # Rust 依赖
   cargo add tauri-plugin-sql --features sqlite
   cargo add tauri-plugin-sharetarget  # Android 端
   cargo add reqwest --features json  # MiniMax API 调用

   # 前端依赖
   npm install react react-dom
   npm install tailwindcss
   ```

3. ✅ **核心服务实现**:
   - 实现 ScoutService（Rust）
   - 集成 scout_converter.py 调用
   - 配置 MiniMax API 客户端
   - 测试 PC 端基础功能

### 关键里程碑:

- **Day 1**: Tauri v2 项目初始化完成，桌面端可运行
- **Day 2**: Android 端集成 Share Target，可接收系统分享
- **Day 3**: Scout Service 实现，MiniMax API 集成完成
- **Day 4**: 多端联调通过，评估结果可同步显示
- **Day 5**: 端到端测试，工作流第一环节完整验证

---

## 9. 📂 Critical Files（关键文件）

### 现有文件（需复用）:
- `D:\Obsidian Vault\10-Projects\ExoMind\ExoBuffer\scout_converter.py` - URL→Markdown 转换
- `D:\Obsidian Vault\10-Projects\ExoMind\ExoBuffer\Scout测试案例\Scout-Agent-v1.3-提示词.md` - Scout Agent 协议

### 新建文件:
```
exomind/
├── packages/
│   ├── core/                      # 核心服务（Rust）
│   │   ├── src/
│   │   │   ├── lib.rs            # Tauri 入口
│   │   │   ├── scout_service.rs  # Scout 评估服务
│   │   │   └── minimax_client.rs # MiniMax API 客户端
│   │   └── Cargo.toml            # Rust 依赖
│   │
│   ├── desktop/                   # 桌面端
│   │   ├── src-tauri/            # Tauri 桌面端配置
│   │   ├── src/                  # React 前端
│   │   │   ├── App.tsx          # 主应用
│   │   │   └── components/       # 组件
│   │   └── index.html
│   │
│   └── mobile/                   # 移动端（Android）
│       ├── src-tauri/            # Tauri Android 配置
│       ├── src/                  # React 前端
│       └── gen/android/         # Android 原生代码
│
└── README.md                    # 项目说明
```

---

## 10. 🔍 Verification（验证方法）

### 端到端测试流程:

1. **准备**: 启动桌面端 Tauri 应用
2. **信息捕获**: Android 端从微信分享文章 → Scout 评估
3. **评估处理**: MiniMax API 调用 Scout v1.3 协议评估
4. **结果同步**: 桌面端和 Android 端显示相同的评估结果
5. **工作流导航**: 桌面端可快速跳转到后续环节
6. **数据持久**: 应用重启后评估数据不丢失

### 关键验证点:

- ✅ **工作流第一环节**: Scout 评估结果为后续环节提供结构化输入
- ✅ **多端一致性**: PC 端和 Android 端体验一致，数据同步
- ✅ **Tauri v2 同构**: 核心逻辑共享，代码复用率高
- ✅ **MiniMax API 稳定**: 评估准确率和速度满足工作流需求

---

**文档版本**: v2.0 (LeanSpec v0.7 - ExoMind 工作流版)
**创建时间**: 2026-01-08
**状态**: 待审核

---

## 总结

ExoMind 工作流开发的核心设计：

- ✅ **工作流第一环节**: 实现 ExoMind 工作流①信息输入环节的完整闭环
- ✅ **Tauri v2 统一**: PC 端和 Android 端共享核心逻辑，代码复用率高
- ✅ **MiniMax API**: 替代 Claude API，成本低速度快
- ✅ **结构化输出**: Scout 评估结果为后续5个环节提供标准化输入
- ✅ **极简界面**: 专注工作流效率，核心操作 < 3 秒

**关键创新**:
- 用 **Tauri v2 同构架构** 实现 PC + Android 统一开发体验
- 用 **工作流思维** 设计信息输入环节，为整个 ExoMind 体系服务
- 用 **MiniMax M2.1 API** 降低评估成本（50元/月）

**下一步**: 获得用户批准后，立即开始 Day 1 Tauri v2 项目初始化和桌面端开发。