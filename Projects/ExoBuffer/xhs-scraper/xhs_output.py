# xhs_output.py - 输出模块（Markdown + JSON）
"""
将采集的笔记数据转换为 Scout 格式输出。

输出格式:
- 案例-XXX-标题.md    Scout 格式 Markdown
- 案例-XXX-标题.json  元数据 JSON
"""

import json
import re
from pathlib import Path
from datetime import datetime


def sanitize_title(title: str, max_len: int = 20) -> str:
    """
    标题简化：去除特殊字符，截断长度

    Args:
        title: 原始标题
        max_len: 最大长度

    Returns:
        str: 简化后的标题
    """
    # 去除特殊字符
    clean = re.sub(r'[\\/*?:"<>|！？。，、；：""''【】]', '', title)
    # 空格替换为下划线
    clean = clean.replace(' ', '_')
    # 截断
    return clean[:max_len].strip('_')


def generate_case_name(case_id: int, title: str) -> str:
    """
    生成案例名称

    Args:
        case_id: 案例编号
        title: 笔记标题

    Returns:
        str: 案例名称，如 "案例-014-Claude_Code_CLI更新"
    """
    title_short = sanitize_title(title)
    return f"案例-{case_id:03d}-{title_short}"


def save_note(note: dict, case_id: int, output_dir: Path) -> tuple:
    """
    保存笔记为 Markdown + JSON

    Args:
        note: 笔记数据字典
        case_id: 案例编号
        output_dir: 输出目录

    Returns:
        tuple: (md_path, json_path)
    """
    case_name = generate_case_name(case_id, note.get("title", "untitled"))

    # 创建案例目录
    case_dir = output_dir / case_name
    case_dir.mkdir(parents=True, exist_ok=True)

    # 生成 Markdown
    md_content = generate_markdown(note, case_name)
    md_path = case_dir / f"{case_name}.md"
    md_path.write_text(md_content, encoding="utf-8")

    # 保存 JSON
    json_path = case_dir / f"{case_name}.json"
    json_path.write_text(
        json.dumps(note, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"Saved: {case_name}")
    print(f"  - {md_path.name}")
    print(f"  - {json_path.name}")

    return md_path, json_path


def generate_markdown(note: dict, case_name: str) -> str:
    """
    生成 Scout 格式 Markdown

    Args:
        note: 笔记数据
        case_name: 案例名称

    Returns:
        str: Markdown 内容
    """
    title = note.get("title", "无标题")
    author = note.get("author", "未知作者")
    url = note.get("url", "")
    content = note.get("content", "")
    images = note.get("images", [])
    local_images = note.get("local_images", [])
    comments = note.get("comments", [])
    collected_at = note.get("collected_at", datetime.now().isoformat())

    # 构建 Markdown
    md = f"""# {case_name}: {title}

**来源**: 小红书
**作者**: {author}
**链接**: {url}
**采集时间**: {collected_at}
**格式**: Markdown + JSON (Scout V4 - XHS)

---

> [!SUMMARY] 核心情报摘要
>
> **待人工填写或 MCP understand_image 分析后补充**
>
> ## 核心内容
> （使用 MCP 分析图片后填写）
>
> ## 资源矩阵
> - **作者**: {author}
> - **图片数量**: {len(images)}
> - **评论数量**: {len(comments)}

---

## 正文内容

{content if content else "（正文为空，内容在图片中）"}

---

## 图片列表

"""

    # 添加图片（两列布局，Notion风格）
    md += '<!-- 图片两列布局 -->\n'
    md += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">\n'

    if local_images:
        for i, img_path in enumerate(local_images, 1):
            rel_path = Path(img_path).name
            md += f'  <div>\n'
            md += f'    <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">图片 {i}</p>\n'
            md += f'    <img src="images/{rel_path}" alt="图片{i}" style="width: 100%; border-radius: 8px;">\n'
            md += f'  </div>\n'
    elif images:
        for i, img_url in enumerate(images, 1):
            md += f'  <div>\n'
            md += f'    <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">图片 {i}</p>\n'
            md += f'    <img src="{img_url}" alt="图片{i}" style="width: 100%; border-radius: 8px;">\n'
            md += f'  </div>\n'

    md += '</div>\n\n'

    # 添加评论区（层级结构，时间顺序，回复关系）
    md += """---

## 3. 评论区

"""

    if comments:
        md += f'> **评论总数**: {len(comments)} 条\n'
        md += '> **排序**: 按时间先后（从上到下）\n\n'

        for c in comments:
            c_id = c.get("id", "")
            user = c.get("user", "匿名")
            text = c.get("content", "")
            time_str = c.get("time", "")
            reply_to = c.get("reply_to")
            replies = c.get("replies", [])

            # 一级评论
            md += f'**{c_id}. {user}**'
            if time_str:
                md += f' <span style="color: #999; font-size: 0.85rem;">{time_str}</span>'
            if reply_to:
                md += f' <span style="color: #666;">→ 回复 @{reply_to}</span>'
            md += f'\n> {text}\n\n'

            # 二级回复（缩进显示）
            if replies:
                for r in replies:
                    r_user = r.get("user", "匿名")
                    r_text = r.get("content", "")
                    r_time = r.get("time", "")
                    r_reply_to = r.get("reply_to")

                    md += f'    ↳ **{r_user}**'
                    if r_time:
                        md += f' <span style="color: #999; font-size: 0.85rem;">{r_time}</span>'
                    if r_reply_to:
                        md += f' <span style="color: #666;">→ 回复 @{r_reply_to}</span>'
                    md += f'\n    > {r_text}\n\n'
    else:
        md += "（无评论或评论未加载）\n"

    # 添加 Scout 评估占位
    md += """
---

## Scout 评估

> [!WARNING] 待评估
> 使用 Scout Agent v1.3 进行评估后填写

```json
{
  "value_score": 0,
  "next_action": "PENDING",
  "confidence": 0,
  "tags": [],
  "reasoning": {}
}
```
"""

    return md


# 命令行测试
if __name__ == "__main__":
    # 测试数据
    test_note = {
        "id": "test123",
        "url": "https://www.xiaohongshu.com/discovery/item/test123",
        "title": "Claude Code CLI 2.1.0 重磅更新",
        "author": "AI圈的那些事",
        "content": "这是一条测试笔记的正文内容...",
        "images": ["https://example.com/img1.jpg"],
        "comments": [
            {
                "user": "用户A",
                "content": "很有用的分享！",
                "replies": [
                    {"user": "作者", "content": "感谢支持～"}
                ]
            }
        ],
        "collected_at": datetime.now().isoformat()
    }

    from config import OUTPUT_DIR
    save_note(test_note, 999, OUTPUT_DIR)
    print("Test completed!")
