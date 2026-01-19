# xhs-scraper Agent 工作流

> **ExoBuffer 外部缓冲区** - 夺取用户在信息时代的主权
>
> **Agent Role**: 小红书内容侦察兵 (XHS Scout)
>
> **Protocol**: Scout v1.3 + MCP understand_image

---

## 1. Agent 身份定义

| 属性 | 值 |
|------|-----|
| **名称** | xhs-collector |
| **角色** | 小红书内容侦察兵 |
| **使命** | 采集小红书笔记，提取有价值信息 |
| **工作模式** | 单次会话顺序采集，严禁并发 |
| **合规原则** | 用户自主登录，模拟真实用户行为 |

---

## 2. 输入规范

### 2.1. URL 格式

```markdown
# 完整参数链接（不能删减，删减会出错）
https://www.xiaohongshu.com/discovery/item/695ef192000000001a02eeaf?app_platform=android&app_version=9.6.0&...
```

### 2.2. 输入来源

| 来源   | 格式                | 处理方式          |
| ---- | ----------------- | ------------- |
| 日记转发 | Markdown 链接       | 提取 URL，移除查询参数 |
| 批量文件 | urls.txt（每行一个URL） | 逐行解析          |
| 命令行  | 逗号分隔 URL          | 分割处理          |

---

## 3. 工作流程 (The Scout Loop)

### 3.1. 阶段一：预处理

```
┌─────────────────────────────────────────────────────┐
│  1. 检查登录状态                                     │
│     └─→ xhs_login.py --check                        │
│         └─→ 检查 profile/Cookies 是否有效            │
├─────────────────────────────────────────────────────┤
│  2. 解析 URL                                         │
│     └─→ 提取 note_id (695ef192000000001a02eeaf)      │
│         └─→ 验证 URL 格式                            │
├─────────────────────────────────────────────────────┤
│  3. 配置反爬参数                                     │
│     └─→ 随机延迟 5-15 秒                             │
│         └─→ 检查请求频率限制                          │
└─────────────────────────────────────────────────────┘
```

### 3.2. 阶段二：页面采集

```python
# xhs_collector.py 核心流程

class XhsCollector:
    def collect(self, url, output_dir):
        # 1. 启动浏览器（带用户 Cookie）
        self.browser.start()

        # 2. 访问页面（等待 load 事件）
        self.page.goto(url, wait_until="load")
        time.sleep(5)  # 等待动态内容

        # 3. 提取元数据
        note = {
            "id": self._extract_note_id(url),
            "title": self._extract_title(),
            "author": self._extract_author(),
            "content": self._extract_content(),
            "images": self._extract_images(),      # 按DOM顺序
            "local_images": self._download_images(),
            "comments": self._collect_comments(),  # 含时间戳
        }

        # 4. 整页截图备份
        self.page.screenshot(path=f"{note_id}_screenshot.png")

        # 5. 保存输出
        save_note(note, case_id, output_dir)

        return note
```

### 3.3. 阶段三：数据提取

#### 3.3.1. 图片提取（按阅读顺序）

```python
def _extract_images(self) -> list:
    """提取所有图片URL（按DOM顺序，即阅读顺序）"""
    images = []
    for selector in SELECTORS["images"]:
        for img in self.page.query_selector_all(selector):
            src = img.get_attribute("data-src") or img.get_attribute("src")
            if src and "avatar" not in src and "icon" not in src:
                clean_src = src.split('?')[0]
                if clean_src not in images:
                    images.append(src)
    return images
```

#### 3.3.2. 评论提取（含层级结构）

```python
def _collect_comments(self) -> list:
    """采集评论（含时间戳、回复关系、二级回复）"""
    comments = []
    for idx, comment_el in enumerate(self.page.query_selector_all(SELECTORS["comments"]["container"]), 1):
        comment = {
            "id": idx,                    # 评论ID
            "user": "",                   # 用户名
            "content": "",                # 评论内容
            "time": "",                   # 时间戳
            "replies": [],                # 二级回复列表
            "reply_to": None,             # 回复谁
        }
        # 提取用户名、内容、时间
        # 提取二级回复（带 @提及 关系）
        comments.append(comment)
    return comments
```

#### 3.3.3. 图片下载

```python
def _download_images(self, urls: list, output_dir: Path, note_id: str) -> list:
    """下载图片到本地（按顺序）"""
    img_dir = output_dir / note_id / "images"
    img_dir.mkdir(parents=True, exist_ok=True)

    local_paths = []
    for i, url in enumerate(urls, 1):
        r = httpx.get(url, timeout=30, follow_redirects=True)
        if r.status_code == 200:
            img_path = img_dir / f"img_{i:02d}.jpg"
            img_path.write_bytes(r.content)
            local_paths.append(str(img_path))
    return local_paths
```

### 3.4. 阶段四：输出生成

```
┌─────────────────────────────────────────────────────┐
│  输出文件结构                                        │
├─────────────────────────────────────────────────────┤
│  Scout测试案例/                                      │
│  └── 案例-015-xxx/                                   │
│      ├── 案例-015-xxx.md           # Scout格式       │
│      ├── 案例-015-xxx.json          # 完整元数据      │
│      ├── images/                    # 图片目录        │
│      │   ├── img_01.jpg             # 按阅读顺序      │
│      │   └── img_02.jpg             # ...            │
│      └── note_id_screenshot.png      # 整页截图备份    │
└─────────────────────────────────────────────────────┘
```

#### 3.4.1. Markdown 模板

```markdown
# 案例-015-xxx: 笔记标题

**来源**: 小红书
**作者**: 作者名
**链接**: URL
**采集时间**: 2026-01-09T12:00:00

---

> [!SUMMARY] 核心情报摘要
> **情报等级**: [战略/支持/参考]
> **核心情报**: 一句话价值描述
> **资源矩阵**:
> - 标签: #xxx
> - 图片: N张
> - 评论: N条

---

## 1. 正文内容
*（从图片提取的文字内容，按阅读顺序排列，用markdown格式进行格式化）*
*如果图片与正文内容一致，则去重*
*还有网页实际的正文内容，如正文+标签*


## 2. 图片列表
*图片按幻灯片滑动顺序重新排列，不按 DOM 采集顺序排列*
<!-- 两列布局 -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
  <div>
    <p>图片 1 - 描述</p>
    <img src="images/img_01.jpg">
  </div>
  <div>
    <p>图片 2 - 描述</p>
    <img src="images/img_02.jpg">
  </div>
</div>

## 3. 评论区
> **评论总数**: N条
> **排序**: 按时间先后

**1. 用户名** <span>时间戳</span>
> 评论内容

    ↳ **回复者** <span>时间</span>
    > 回复内容

## 4. Scout 评估
> [!SUCCESS] 已验证
```

---

## 4. MCP 集成

### 4.1. 图片理解工具

```python
# 工具: mcp__MiniMax__understand_image
# 参数:
image_source: "Scout测试案例/案例-015-xxx/images/img_01.jpg"
prompt: "描述这张小红书笔记图片的内容，提取：1）标题 2）核心观点 3）代码/工具 4）标签"
```

### 4.2. 工作流

```
采集完成
    ↓
提取图片文字 → MCP understand_image
    ↓
更新正文 → Scout格式 Markdown
    ↓
人工审核 / Scout Agent 评估
    ↓
ARCHIVE → 00-Inbox/
```

---

## 5. 反爬策略

| 策略            | 实现                        | 参数                                                       |
| ------------- | ------------------------- | -------------------------------------------------------- |
| **顺序访问**      | 严禁并发，一次只处理一个 URL          | -                                                        |
| **随机延迟**      | 每次请求间隔 5-15 秒             | `DELAY_MIN=5`, `DELAY_MAX=15`                            |
| **真实浏览器**     | Playwright 非无头模式          | `headless=False`                                         |
| **用户 Cookie** | 使用用户已登录状态                 | `profile/` 目录                                            |
| **自动化检测规避**   | 禁用 `AutomationControlled` | `args=["--disable-blink-features=AutomationControlled"]` |

---

## 6. 合规原则

### 6.1. 必须遵守

- [x] 用户手动登录，不自动破解验证码
- [x] 使用用户自己的 Cookie，不盗用他人账号
- [x] 模拟真实用户行为（延迟、顺序访问）
- [x] 尊重平台robots.txt和服务条款

### 6.2. 禁止行为

- [ ] 并发请求
- [ ] 自动绕过验证码
- [ ] 批量注册账号
- [ ] 采集后立即大量点赞/关注

---

## 7. 错误处理

### 7.1. 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `TimeoutError` | 页面加载慢 | 增加 `PAGE_TIMEOUT` |
| `Cookie过期` | 登录状态失效 | 重新运行 `xhs_login.py` |
| `Selector失效` | 小红书改版 | 更新 `config.py` 中的 `SELECTORS` |
| `httpx.ReadTimeout` | 网络问题 | 重试或检查网络 |

### 7.2. 重试策略

```python
MAX_RETRIES = 3
RETRY_DELAY = 30  # 秒

for attempt in range(MAX_RETRIES):
    try:
        collect(url)
        break
    except Exception as e:
        if attempt < MAX_RETRIES - 1:
            time.sleep(RETRY_DELAY * (attempt + 1))
        else:
            log_error(e)
```

---

## 8. 与 Scout 集成

```
xhs-scraper (采集)
    ↓
Scout测试案例/案例-0XX.md + .json
    ↓
Scout Agent v1.3 评估
    ├─ value_score: 0-10
    ├─ next_action: [ARCHIVE/PENDING/REVIEW]
    └─ tags: [分类标签]
    ↓
高价值 → 00-Inbox/ (永久保存)
低价值 → 归档 (节省空间)
```

---

## 9. 使用示例

### 9.1. 单条采集

```bash
cd ExoBuffer/xhs-scraper
python xhs_collector.py "https://www.xiaohongshu.com/discovery/item/695ef192..."
```

### 9.2. 批量采集

```bash
# 从文件
python xhs_batch.py urls.txt

# 指定起始编号
python xhs_batch.py urls.txt 20

# 逗号分隔
python xhs_batch.py "url1,url2,url3"
```

### 9.3. 图片分析

```bash
# 使用 MCP understand_image 分析图片
# image_source: "Scout测试案例/案例-015-xxx/images/img_01.jpg"
# prompt: "提取小红书笔记的标题、作者、核心观点、工具/标签"
```

---

## 10. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始版本：基础采集 + MCP集成 |
| 1.1.0 | 2026-01-09 | 增强评论：时间戳 + 回复关系 |
| 1.2.0 | 2026-01-09 | 优化图片：按阅读顺序排列 |

---

**Agent ID**: xhs-collector-v1.2
**Protocol**: Scout v1.3
**Last Updated**: 2026-01-09
