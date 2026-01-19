# 🚀 ExoBuffer: 侦察兵前哨站 (Scout Outpost)

> **"让 Scout 替我挡子弹，只让真理通过。"**

ExoBuffer 是 ExoMind (外心) 系统的“侦察兵”前哨站。它通过高度自动化的 Agent 协作流，在信息流劫持用户之前建立“价值过滤膜”，基于当前上下文过滤噪音，提炼真理。

---

## 1. 🎯 核心使命
- **噪音过滤**: 基于用户当前的“主要矛盾”和“任务优先级”，对入站信息进行冷酷打分（0-10）。
- **情报提炼**: 自动生成集成“资源矩阵链接”的 `[!SUMMARY]` 块，实现知识的瞬间获取。
- **无损转换**: 将微信公众号等封闭生态内容转换为保留关键样式（颜色、加粗）的工业级 Markdown 资产。

## 2. 🏗️ 核心架构: Scout V3
项目已实现 **Direct Fetch** 架构，彻底解除对中间件的依赖：
`微信 URL` → `urllib (模拟浏览器)` → `JS 变量深度打捞` → `markdownify (无损转换)` → `一体化 Markdown`

## 3. 🧪 进化能力库 (Protein Library)
项目采用“蛋白质”化开发理念，将 Agent 能力沉淀为可复用的 Python 脚本：
- **[scout_converter.py](ExoMind-Team/Projects/ExoMind/ExoBuffer/scout_converter.py)**: All-in-One 抓取与转换引擎。
- **[archive_logs.py](archive_logs.py)**: 价值导向的日志生命周期管理工具。

## 4. 🧰 CLI 使用说明（scout_converter.py）
```bash
# 基础用法
python scout_converter.py <URL_or_FilePath> [Output_Path]

# 保存下载 HTML 缓存（自动使用唯一文件名）
python scout_converter.py <URL> --save-cache

# 指定缓存目录
python scout_converter.py <URL> --save-cache --cache-dir ./cache
```

**缓存命名策略**:
- 启用 `--save-cache` 后会使用 `tempfile` 生成唯一文件名（`scout_download_cache_*.html`），避免覆盖历史缓存。

## 5. 🔄 人机协作流: The Scout Loop
1. **Capture**: 用户输入 URL 或工程指令。
2. **Execute**: 调用蛋白质脚本执行自动化任务。
3. **Evaluate**: 遵循 **Scout v1.4 协议**进行价值评估。
4. **Log**: 自动 **Prepend** 记录至项目日志。
5. **Commit**: 强制执行 **Git Commit** 持久化变更。

## 6. 🛠️ 技术栈
- **前端**: Tauri v2 + React (TypeScript) + TailwindCSS
- **后端**: Rust (Core) + Python (Agent 蛋白质)
- **存储**: 本地优先 SQLite + 跨端同步 (S3/WebDAV)
- **平台**: Android (Intent 分享) + Windows (主控)

## 7. 📊 路线图与状态
| 组件 | 状态 | 版本 | 核心突破 |
| :--- | :--- | :--- | :--- |
| **Scout Agent** | 协议固化 | v1.4 | 完成 15+ 案例验证，支持角色 A/B/C 三维评估 |
| **Extraction** | 蛋白质化 | V3 | 实现直连抓取，获取精确发布时间 |
| **Log System** | 已重构 | Callout | 实现 100% 折叠，支持语义化搜索 |

---
*Powered by gemini-3-flash-preview & The Scout Loop.*
