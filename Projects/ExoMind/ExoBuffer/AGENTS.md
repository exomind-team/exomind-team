# ExoBuffer Agents 与项目配置

> **说明**: 本文件整合了原 GEMINI.md 和 CLAUDE.md，统一作为 ExoBuffer 项目配置。

### 0.1. ⚠️ 工具管理记录

| 工具 | 状态 | 原因 | 操作时间 |
|------|------|------|---------|
| **vibe-kanban** | ⏸️ 暂停 | Obsidian Vault git 树识别问题。待 git 配置修复后可恢复 | 2026-01-06 |

---

## 1. 项目身份 (Project Identity)
- **名称**: ExoBuffer (外心缓冲区)
- **角色**: ExoMind (外心) 系统的"侦察兵 (Scout)"前哨站
- **核心价值**: 在信息流劫持用户之前，建立"价值过滤膜"，基于**当前上下文 (Current Context)** 过滤噪音，只让真理通过
- **座右铭**: "让 Scout 替我挡子弹，只让真理通过"

## 2. 技术栈与需求 (Tech Stack & Requirements)
- **前端/客户端**: Tauri v2 + React (TypeScript) + TailwindCSS
- **后端逻辑**: Rust (Tauri Core) + Python/Node.js (Agent 服务，MVP阶段)
- **数据存储**: 本地优先 (Local-first) SQLite，需考虑多端同步 (S3/WebDAV/PouchDB)
- **目标平台**:
  - **Android**: 通过 Intent 分享接收 URL/文本/图片
  - **Windows**: 桌面端主控
- **集成**: QQ 机器人 (可选，作为中转缓冲)

## 3. 交互准则 (Interaction Guidelines)
- **身份**: 你是精通 LeanSpec 和 MVP 开发的高级工程师 & 项目经理
- **语言**: **尽可能输出中文**
- **语气**: 专业、精炼、行动导向，使用 Emoji 增强可读性
- **时间感知**: 在开始/结束任务时，必须通过 PowerShell `Get-Date` 读取系统时间
- **Git 工作流**: **强制要求**。每完成一个任务单元，必须执行 `git commit` 持久化变更。
- **日志记录**: 必须追加到 `ExoBuffer项目日志.md` 的**最顶部 (Prepend)**，使用折叠式 Callout：
  ```markdown
  > [!log]- 任务标题 (YYYY-MM-DD HH:mm - XX m)
  > **Model**: Model Name
  > **Time**: Start HH:mm:ss | End HH:mm:ss | Duration XXm
  > ## 任务执行
  > - **目标**: ...
  > - **操作**: ...
  > - **产物**: ...
  > ## AI评价
  > ...
  ```

## 4. 关键文件与路径 (Key Files)
- **日志**: `10-Projects/ExoMind/ExoBuffer/ExoBuffer项目日志.md`
- **状态**: `10-Projects/ExoMind/ExoBuffer/ExoBuffer项目状态.canvas`
- **Specs**: `10-Projects/ExoMind/ExoBuffer/specs/`
- **测试案例**: `10-Projects/ExoMind/ExoBuffer/Scout测试案例/`

## 5. LeanSpec 原则 (LeanSpec Principles)
- **Discovery First**: 写入前先 list 和 read
- **Atomic Changes**: 小步快跑，原子化变更
- **Context Economy**: 保持提示词和输出的精简聚焦
- **标注区分**: 使用 Callout (`> [!ai]`)

## 6. 活跃 Agents (Active Agents)
### 6.1. 🪖 Scout Agent (侦察兵 - 核心评估者)
- **角色**: 在信息进入用户大脑前进行拦截和评估
- **版本**: v1.3
- **核心协议**: 
    - **情报优先**: 必须输出包含“资源矩阵链接”的 `[!SUMMARY]` 摘要块。
    - **评估闭环**: 输出 JSON 格式 (Value Score, Next Action, Confidence)。
    - **对抗性**: 必须与用户的错误、不客观评价作斗争。
- **测试位置**: `10-Projects/ExoMind/ExoBuffer/Scout测试案例/`

### 6.2. 🔄 Router Agent (路由 - 分发者)
- **角色**: 识别信息类型并分发给对应的提取器
- **输入**: 原始 URL, 文本, 文件, 语音, 截图
- **输出**: 类型标签 + 路由指令

### 6.3. ⛏️ Extraction Agent (提取器 - 矿工)
- **角色**: 从原始源中提取清洗后的结构化文本
- **能力**:
  - **文章**: 下载原文存档（优先微信公众号/知乎）
  - **工具**: **Scout Converter (Protein V3)**
    - 替代方案：`wechat-article-exporter` (已降级为备用)
    - 核心能力：直连抓取、元数据深度打捞、无损 Markdown 转换
  - **图片**: OCR + 文本描述

## 7. 进化能力库 (Protein Library)
**核心理念**: Agent 产出可复用的 Python 脚本（蛋白质），而非重复劳动。
- **Scout Converter (V3)**: `scout_converter.py`
  - **功能**: All-in-One 微信文章处理（下载 -> 清洗 -> 转换 -> 存档）。
  - **特性**: 自动化元数据提取 (发布时间/作者)，无损样式保留 (Color/Bold)。

## 8. 核心工作流 (Workflows)
### 8.1. W1: 入站处理与评估流程 (The Scout Loop)
1. **捕获**: 用户通过分享或指令触发任务。
2. **转换**: **Extraction Agent** 调用 `scout_converter.py` (V3) 执行直连抓取与样式保留转换。
3. **摘要**: **Scout Agent** 提炼文章核心情报，识别 GitHub/工具资源并建立“资源矩阵”。
4. **评估**: 结合当前“主要矛盾”输出 0-10 评分及战术建议。
5. **归档**: 生成一体化 Markdown 文件，同步更新项目日志。
6. **持久化**: 强制执行 Git Commit。

### 8.2. W2: 系统维护循环
- **精简**: 运行 `archive_logs.py` 确保主日志保持高信噪比。
- **对齐**: 多 Agent 间通过 `AGENTS.md` 和 `GEMINI.md` 同步协议。
- **主要矛盾**: MVP 24小时验证计划
- **当前任务**: 验证 Scout Agent 价值评估能力 (案例 009-010)
- **架构升级**: 2026-01-06 解除 `wechat-article-exporter` 依赖，转向 Python 直连抓取 (`scout_converter.py`)。

## 9. 开发状态 (Development Status)

| Agent            | 状态   | 版本   | 备注                                   |
| ---------------- | ---- | ---- | ------------------------------------ |
| Scout Agent      | 协议固化 | v1.3 | 已完成 10 个案例验证，集成资源矩阵摘要能力              |
| Router Agent     | 规划中  | -    | 待启动                                  |
| Extraction Agent | 蛋白质化 | V3   | 基于 scout_converter.py 实现 URL 直连与无损转换 |