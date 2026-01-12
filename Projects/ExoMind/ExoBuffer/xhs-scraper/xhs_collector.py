# xhs_collector.py - 小红书笔记采集模块
"""
采集单条小红书笔记：标题、正文、图片、评论（含二级回复）

使用方法:
    from xhs_collector import XhsCollector
    collector = XhsCollector()
    note = collector.collect("https://www.xiaohongshu.com/discovery/item/...")
"""

from playwright.sync_api import sync_playwright, Page
import time
import re
import httpx
from pathlib import Path
from datetime import datetime
from config import (
    PROFILE_DIR, OUTPUT_DIR, BROWSER_CONFIG,
    PAGE_TIMEOUT, SELECTORS
)


class XhsCollector:
    """小红书笔记采集器"""

    def __init__(self):
        self.context = None
        self.page = None
        self._playwright = None

    def start(self):
        """启动浏览器"""
        self._playwright = sync_playwright().start()
        self.context = self._playwright.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            headless=BROWSER_CONFIG["headless"],
            slow_mo=BROWSER_CONFIG["slow_mo"],
            viewport=BROWSER_CONFIG["viewport"],
            args=BROWSER_CONFIG["args"]
        )
        self.page = self.context.pages[0] if self.context.pages else self.context.new_page()
        print("Browser started with saved profile")

    def stop(self):
        """关闭浏览器"""
        if self.context:
            self.context.close()
        if self._playwright:
            self._playwright.stop()
        print("Browser closed")

    def collect(self, url: str, output_dir: Path = None) -> dict:
        """
        采集单条笔记

        Args:
            url: 小红书笔记完整链接
            output_dir: 输出目录（可选，用于保存图片）

        Returns:
            dict: 笔记数据
        """
        if not self.page:
            self.start()

        print(f"Collecting: {url[:60]}...")

        # 访问页面 - 使用 load 事件，避免 networkidle 超时
        self.page.goto(url, wait_until="load", timeout=PAGE_TIMEOUT)
        time.sleep(5)  # 等待动态内容加载

        # 提取笔记ID
        note_id = self._extract_note_id(url)

        # 构造笔记数据
        note = {
            "id": note_id,
            "url": url,
            "title": "",
            "author": "",
            "content": "",
            "images": [],
            "comments": [],
            "collected_at": datetime.now().isoformat()
        }

        # 提取标题
        note["title"] = self._extract_text(SELECTORS["title"])

        # 提取作者
        note["author"] = self._extract_text(SELECTORS["author"])

        # 提取正文
        note["content"] = self._extract_text(SELECTORS["content"])

        # 提取图片
        note["images"] = self._extract_images()

        # 下载图片（如果指定了输出目录）
        if output_dir:
            note["local_images"] = self._download_images(note["images"], output_dir, note_id)

        # 提取评论
        note["comments"] = self._collect_comments()

        # 保存整页截图
        if output_dir:
            screenshot_path = output_dir / f"{note_id}_screenshot.png"
            self.page.screenshot(path=str(screenshot_path), full_page=True)
            note["screenshot"] = str(screenshot_path)
            print(f"  Screenshot saved: {screenshot_path.name}")

        print(f"  Title: {note['title'][:50]}...")
        print(f"  Images: {len(note['images'])}")
        print(f"  Comments: {len(note['comments'])}")

        return note

    def _extract_note_id(self, url: str) -> str:
        """从URL提取笔记ID"""
        match = re.search(r'/item/([a-f0-9]+)', url)
        return match.group(1) if match else "unknown"

    def _extract_text(self, selectors: list) -> str:
        """尝试多个选择器提取文本"""
        for selector in selectors:
            try:
                el = self.page.query_selector(selector)
                if el:
                    text = el.inner_text()
                    if text and text.strip():
                        return text.strip()
            except:
                continue
        return ""

    def _extract_images(self) -> list:
        """提取所有图片URL（按DOM顺序，即阅读顺序）"""
        images = []
        for selector in SELECTORS["images"]:
            try:
                # query_selector_all 按DOM顺序返回，直接使用
                for img in self.page.query_selector_all(selector):
                    # 优先获取高清源
                    src = img.get_attribute("data-src") or img.get_attribute("src")
                    if src:
                        # 过滤小图标和重复
                        clean_src = src.split('?')[0]  # 去掉查询参数
                        if "avatar" not in clean_src and "icon" not in clean_src:
                            if clean_src not in [i.split('?')[0] for i in images]:
                                images.append(src)
            except Exception as e:
                print(f"  图片提取错误: {e}")
                continue
        return images

    def _download_images(self, urls: list, output_dir: Path, note_id: str) -> list:
        """下载图片到本地"""
        img_dir = output_dir / note_id / "images"
        img_dir.mkdir(parents=True, exist_ok=True)

        local_paths = []
        for i, url in enumerate(urls, 1):
            try:
                r = httpx.get(url, timeout=30, follow_redirects=True)
                if r.status_code == 200:
                    img_path = img_dir / f"img_{i:02d}.jpg"
                    img_path.write_bytes(r.content)
                    local_paths.append(str(img_path))
                    print(f"  Downloaded: img_{i:02d}.jpg")
            except Exception as e:
                print(f"  Failed to download image {i}: {e}")

        return local_paths

    def _collect_comments(self) -> list:
        """采集评论（含时间戳、回复关系、二级回复）"""
        comments = []
        selectors = SELECTORS["comments"]

        # 展开更多评论
        self._expand_comments()

        # 提取评论
        try:
            for idx, comment_el in enumerate(self.page.query_selector_all(selectors["container"]), 1):
                comment = {
                    "id": idx,
                    "user": "",
                    "content": "",
                    "time": "",
                    "replies": [],
                    "reply_to": None  # 记录回复谁
                }

                # 用户名
                user_el = comment_el.query_selector(selectors["user"])
                if user_el:
                    comment["user"] = user_el.inner_text().strip()

                # 评论内容
                content_el = comment_el.query_selector(selectors["content"])
                if content_el:
                    comment["content"] = content_el.inner_text().strip()

                # 时间（如果有）
                time_el = comment_el.query_selector("[class*='time'], [class*='date'], time")
                if time_el:
                    comment["time"] = time_el.inner_text().strip()

                # 检查是否回复了某人（通过@提及）
                reply_to_el = comment_el.query_selector("[class*='reply'] [class*='name'], [class*='at-']")
                if reply_to_el:
                    comment["reply_to"] = reply_to_el.inner_text().strip()

                # 二级回复（如果有）
                for r_idx, reply_el in enumerate(comment_el.query_selector_all(".reply-item, [class*='reply-item'], [class*='sub-comment']"), 1):
                    reply = {
                        "id": f"{idx}-{r_idx}",
                        "user": "",
                        "content": "",
                        "time": "",
                        "reply_to": None
                    }

                    reply_user = reply_el.query_selector(selectors["user"])
                    reply_content = reply_el.query_selector(selectors["content"])
                    reply_time = reply_el.query_selector("[class*='time'], [class*='date'], time")

                    if reply_user:
                        reply["user"] = reply_user.inner_text().strip()
                    if reply_content:
                        reply["content"] = reply_content.inner_text().strip()
                    if reply_time:
                        reply["time"] = reply_time.inner_text().strip()

                    # 检查回复对象
                    at_el = reply_el.query_selector("[class*='at'], [class*='reply']")
                    if at_el:
                        at_text = at_el.inner_text().strip()
                        if at_text.startswith('@'):
                            reply["reply_to"] = at_text[1:].strip()

                    if reply.get("content"):
                        comment["replies"].append(reply)

                if comment.get("content"):
                    comments.append(comment)

        except Exception as e:
            print(f"  Error collecting comments: {e}")

        return comments

    def _expand_comments(self):
        """展开更多评论"""
        expand_selector = SELECTORS["comments"]["expand"]
        max_clicks = 10  # 最多点击10次

        for _ in range(max_clicks):
            try:
                expand_btn = self.page.query_selector(expand_selector)
                if expand_btn and expand_btn.is_visible():
                    expand_btn.click()
                    time.sleep(1)
                else:
                    break
            except:
                break


# 命令行测试
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python xhs_collector.py <url>")
        sys.exit(1)

    url = sys.argv[1]

    collector = XhsCollector()
    try:
        collector.start()
        note = collector.collect(url, OUTPUT_DIR)
        print("\n" + "=" * 50)
        print(f"Title: {note['title']}")
        print(f"Author: {note['author']}")
        print(f"Content: {note['content'][:200]}...")
        print(f"Images: {len(note['images'])}")
        print(f"Comments: {len(note['comments'])}")
    finally:
        collector.stop()
