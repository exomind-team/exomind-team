# 小红书采集器 (xhs-scraper)

> **ExoBuffer 外部缓冲区** - 夺取用户在信息时代的主权
>
> 让 Scout 替我挡子弹，只让真理通过

> [!info] 相关文档
> - [AGENTS.md](ExoMind-Team/Projects/ExoMind/ExoBuffer/xhs-scraper/AGENTS.md) - 完整 Agent 工作流规范
> - [Gemini.md](GEMINI.md) - ExoBuffer 项目上下文

---

## 核心理念

- **尊重平台规则**: 用户手动登录，不绕过验证码
- **合规采集**: 使用用户自己的 Cookie，模拟真实用户行为
- **价值过滤**: 采集后通过 Scout Agent 评估价值

---

## 文件结构

```
xhs-scraper/
├── AGENTS.md           # Agent 工作流规范（本项目核心文档）
├── config.py           # 配置：路径、选择器、延迟参数
├── xhs_login.py        # 登录：首次手动登录，保存Cookie
├── xhs_collector.py    # 采集：单条笔记（文字+图片+评论）
├── xhs_output.py       # 输出：Scout格式 Markdown + JSON
├── xhs_batch.py        # 批量：顺序采集 + 反爬延迟
├── profile/            # 浏览器Profile（Cookie存储）
└── README.md           # 快速开始指南
```

---

## 快速开始

### 1. 首次登录（仅需一次）

```bash
cd ExoBuffer/xhs-scraper
python xhs_login.py
```

- 浏览器会自动打开小红书
- 手动完成微信扫码登录
- 登录成功后按 Enter 保存

### 2. 检查登录状态

```bash
python xhs_login.py --check
```

### 3. 采集单条笔记

```bash
python xhs_collector.py "https://www.xiaohongshu.com/discovery/item/..."
```

### 4. 批量采集

```bash
# 从文件读取 URL 列表
python xhs_batch.py urls.txt

# 直接传入 URL（逗号分隔）
python xhs_batch.py "url1,url2,url3"

# 指定起始案例编号
python xhs_batch.py urls.txt 20
```

---

## 输出格式

> **完整格式说明**: 参见 [AGENTS.md](ExoMind-Team/Projects/ExoMind/ExoBuffer/xhs-scraper/AGENTS.md) 第 3.4 节

### 目录结构

```
Scout测试案例/
└── 案例-014-Claude_Code更新/
    ├── 案例-014-Claude_Code更新.md     # Scout格式Markdown
    ├── 案例-014-Claude_Code更新.json   # 元数据JSON
    ├── images/
    │   ├── img_01.jpg
    │   └── img_02.jpg
    └── 695ef192_screenshot.png          # 整页截图备份
```

### Markdown 格式

```markdown
# 案例-014-Claude_Code更新: 完整标题

**来源**: 小红书
**作者**: 作者名
**链接**: URL
**采集时间**: 2026-01-09T11:30:00

---

> [!SUMMARY] 核心情报摘要
> ...

## 正文内容
## 图片列表
## 评论区
## Scout 评估
```

---

## 图片分析（MCP）

> **完整说明**: 参见 [AGENTS.md](ExoMind-Team/Projects/ExoMind/ExoBuffer/xhs-scraper/AGENTS.md) 第 4 节

采集完成后，使用 MCP 手动分析图片：

```python
# 工具: mcp__MiniMax__understand_image
# 参数:
#   image_source: "Scout测试案例/案例-014-xxx/images/img_01.jpg"
#   prompt: "描述这张图片的内容，提取关键信息、代码、工具名称等"
```

---

## 配置说明

编辑 `config.py` 修改配置：

```python
# 案例编号起始值
CASE_START_ID = 14

# 请求延迟（秒）
DELAY_MIN = 5
DELAY_MAX = 15

# 页面超时（毫秒）
PAGE_TIMEOUT = 60000
```

---

## 反爬策略

| 策略 | 说明 |
|------|------|
| 顺序访问 | 严禁并发，一次只访问一个页面 |
| 随机延迟 | 每次访问间隔 5-15 秒 |
| 真实浏览器 | 使用 Playwright，非无头模式 |
| 用户Cookie | 使用用户自己的登录状态 |

---

## 依赖

```bash
pip install playwright httpx
python -m playwright install chromium
```

---

## 与 Scout 集成

> **完整流程**: 参见 [AGENTS.md](ExoMind-Team/Projects/ExoMind/ExoBuffer/xhs-scraper/AGENTS.md) 第 8 节

```
xhs_collector.py (小红书)
       ↓
Scout测试案例/案例-0XX.md
       ↓
Scout Agent v1.3 评估
       ↓
高价值内容 → 00-Inbox/
```

---

## 故障排除

### Cookie 过期

重新运行登录模块：

```bash
python xhs_login.py
```

### 页面加载超时

1. 检查网络连接
2. 增加 `config.py` 中的 `PAGE_TIMEOUT`

### 选择器失效

小红书页面结构可能更新，需要调整 `config.py` 中的 `SELECTORS`

---

**Version**: 1.2.0
**Last Updated**: 2026-01-09
**Related**: [AGENTS.md](ExoMind-Team/Projects/ExoMind/ExoBuffer/xhs-scraper/AGENTS.md) - 完整工作流规范
