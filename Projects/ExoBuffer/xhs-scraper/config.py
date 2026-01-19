# config.py - 小红书采集器配置
from pathlib import Path

# ===== 路径配置 =====
BASE_DIR = Path(__file__).parent
PROFILE_DIR = BASE_DIR / "profile"
OUTPUT_DIR = BASE_DIR.parent / "Scout测试案例"

# ===== 采集配置 =====
# 案例编号起始值（当前最大是013）
CASE_START_ID = 14

# 请求延迟（秒）- 模拟真实用户
DELAY_MIN = 5
DELAY_MAX = 15

# 页面加载超时（毫秒）
PAGE_TIMEOUT = 120000

# ===== CSS 选择器配置 =====
# 小红书页面元素选择器（可能随版本变化需要更新）
SELECTORS = {
    # 笔记标题
    "title": [
        "#detail-title",
        ".title",
        "[class*='title']",
        "div.note-top-text"
    ],
    # 笔记正文
    "content": [
        "#detail-desc",
        ".desc",
        ".note-content",
        "[class*='desc']"
    ],
    # 作者信息
    "author": [
        ".author-wrapper .username",
        "[class*='author'] .name",
        "[class*='user-name']"
    ],
    # 图片列表
    "images": [
        "div.swiper-slide img",
        ".note-image img",
        "[class*='carousel'] img"
    ],
    # 评论区
    "comments": {
        "container": ".comment-item, [class*='comment-item']",
        "user": ".user-name, [class*='user-name']",
        "content": ".content, [class*='content']",
        "expand": "text=展开更多, text=查看更多回复"
    }
}

# ===== 浏览器配置 =====
BROWSER_CONFIG = {
    "headless": False,          # 可视化模式
    "slow_mo": 500,             # 慢速模式（毫秒）
    "viewport": {"width": 1280, "height": 900},
    "args": [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox"
    ]
}
