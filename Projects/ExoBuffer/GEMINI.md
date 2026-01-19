# ExoBuffer Gemini 模型项目上下文
## 1. 项目身份 (Project Identity)
- **名称**: ExoBuffer (外心缓冲区)
- **角色**: ExoMind 系统“侦察兵 (Scout)”前哨站。
- **核心价值**: 基于**当前上下文**过滤噪音，只让真理通过。
- **座右铭**: "让 Scout 替我挡子弹，只让真理通过。"
- **当前名称**: gemini-3-flash-preview
## 2. 技术栈与需求
- **前端**: Tauri v2 + React (TypeScript) + TailwindCSS
- **后端**: Rust (Tauri Core) + Python (Agent 服务)
- **存储**: 本地优先 SQLite，支持 S3/WebDAV/PouchDB 同步
- **平台**: Android (Intent 分享接收 URL/文本/图片) + Windows (主控)
- **集成**: QQ 机器人 (可选)
## 3. 输出文档风格与交互准则
- **文档风格**: 精准精炼，节省 Token，言简意赅。除文章外，文档内部**段落间不留空行**。
- **时间感知**: 
  - **强制要求**: 必须在会话第一时间通过 PowerShell `Get-Date` 获取起始时间，并在输出结束最后获取一次结束时间。
  - **计算**: 计算持续工作时间，按标准格式输出到日志。
- **日志记录规范**: 必须追加至 `ExoBuffer项目日志.md` 的**最顶部 (Prepend) 的第二行**，第一行必须为空行。
  - **Callout 格式**: 统一使用折叠式 `> [!log]-`。
  - **标题语义化**: 必须使用具体业务标题（如“架构升级：解除依赖”），**严禁**使用“历史记录”或纯时间戳。
  - **样例**:
    ```markdown
    > [!log]- 任务标题 (YYYY-MM-DD HH:mm - XX m)
    > **Model**: gemini-3-flash-preview
    > **Time**: Start HH:mm:ss | End HH:mm:ss | Duration XXm
    > ## 任务执行
    > - **目标**: 简述目标，用户需求，场景，价值
    > - **操作**: 1. 步骤一; 2. 步骤二
    > - **产物**: [[文件链接]]
    > ## AI评价+评价建议
    > 评价内容言简意赅
    > ## 人工评价
    > > - [ ] 可用 checkbox 指导用户审核本次任务
    > ==人工编写的自定义评价内容==
    (空行)
    ```
- **标注区分**: 使用 Obsidian **Callout** 明确区分 Agent 生成内容。
  - **样例**:
    ```markdown
    > [!ai] 标题
    > 这里的回复内容直接紧跟，不留空行。
    ```
- **Git 工作流**: **强制要求**。每完成一个任务单元或对话轮次，必须执行 `git commit` 持久化变更。
- **日志维护 (Lifecycle Management)**: 
  - **评估标准**: 
    - **视觉**: 必须使用 `[!log]-` 实现 100% 折叠。
    - **经济**: 主日志建议保持 < 30 条记录，优先 Context Economy。
    - **语义**: 标题必须精准描述业务价值。
  - **精简原则 (Refinement)**: 
    - **结果导向**: 主日志应侧重于“变更结果”与“核心决策”，冗长的“操作过程/具体命令”在精简时应被压缩或移至存档。
    - **智能过滤**: 保留最近 5 条及包含“架构/蛋白质/协议/战略/进度”等关键词的核心条目。
    - **主动存档**: 定期将次要历史记录迁移至 `_Archived.md`。迁移时必须确保条目按**时间倒序**（最新在上）与已有存档合并。
    - **自动化脚本**: 编写专门的 Python 蛋白质执行精简。
- **维护**: 定期清理冗余空行，确保 Callout structure 严谨。

## 4. 人机协作工作流 (The Scout Loop)
1. **任务捕获**: 用户提供 URL 或工程指令。
2. **蛋白质执行**: Agent 优先调用现有脚本（如 `scout_converter.py`）完成任务，减少重复劳动。
3. **协议输出**: 遵循 **Scout v1.3 协议**，输出集成元数据、资源矩阵摘要及 JSON 评估的 Markdown。
4. **日志记录**: 按规范 **Prepend** 记录至 `ExoBuffer项目日志.md`。
5. **原子提交**: 每一轮对话结项，强制执行 **Git Commit** 持久化所有变更。
## 5. 关键文件与路径
- **日志**: `10-Projects/ExoMind/ExoBuffer/ExoBuffer项目日志.md`
- **状态**: `10-Projects/ExoMind/ExoBuffer/ExoBuffer项目状态.canvas`
- **Specs**: `10-Projects/ExoMind/ExoBuffer/specs/`
- **测试案例**: `10-Projects/ExoMind/ExoBuffer/Scout测试案例/`
## 6. LeanSpec 原则
- **Discovery First**: 写入前先 list 和 read。
- **Atomic Changes**: 小步快跑，原子化变更。
- **Context Economy**: 保持提示词和输出精简。
- **标注区分**: 见第 3 节 Callout 规范。
## 7. 当前上下文
- **主要矛盾**: MVP 24 小时验证计划。
- **当前任务**: 利用 Scout V3 蛋白质完成案例 009-010 的采集与无损转换，并启动全案例价值评估验证。
## 8. 进化能力库 (Protein Library)
- **核心理念**: Agent 编写可复用的 Python 脚本（蛋白质），而非重复执行逻辑。
- **Scout Converter (V3)**: `scout_converter.py`。支持 URL 直连下载、元数据自动打捞、无损 Markdown 转换。
## 9. 演进与模型倾向
- **架构升级**: 2026-01-06 解除 `wechat-article-exporter` 依赖，转向 Python 直连抓取。
- **工具倾向**: 优先使用 Python 脚本，环境为 PowerShell。
