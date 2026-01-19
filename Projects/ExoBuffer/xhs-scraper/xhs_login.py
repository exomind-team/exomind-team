# xhs_login.py - 小红书登录模块
"""
首次运行需要手动登录小红书（微信扫码）。
登录状态会自动保存到 profile 目录，后续运行无需重复登录。

使用方法:
    python xhs_login.py
"""

from playwright.sync_api import sync_playwright
from config import PROFILE_DIR, BROWSER_CONFIG


def login():
    """启动浏览器，用户手动登录，保存Cookie到Profile目录"""

    print("=" * 50)
    print("小红书登录模块")
    print("=" * 50)
    print(f"Profile 存储位置: {PROFILE_DIR}")
    print()

    with sync_playwright() as p:
        # 使用独立 Profile 目录，登录状态自动持久化
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            headless=BROWSER_CONFIG["headless"],
            slow_mo=BROWSER_CONFIG["slow_mo"],
            viewport=BROWSER_CONFIG["viewport"],
            args=BROWSER_CONFIG["args"]
        )

        page = context.pages[0] if context.pages else context.new_page()

        # 访问小红书首页
        print("正在打开小红书...")
        page.goto("https://www.xiaohongshu.com", timeout=60000)

        print()
        print("=" * 50)
        print("请在浏览器中手动登录小红书：")
        print("1. 点击右上角「登录」")
        print("2. 使用微信扫码登录")
        print("3. 完成验证码（如有）")
        print("4. 确认登录成功后，回到此窗口按 Enter")
        print("=" * 50)
        print()

        input("登录完成后按 Enter 保存会话...")

        # 验证登录状态
        title = page.title()
        print(f"当前页面: {title}")

        context.close()

        print()
        print("=" * 50)
        print(f"登录状态已保存至: {PROFILE_DIR}")
        print("后续运行采集脚本将自动使用此登录状态")
        print("=" * 50)


def check_login_status():
    """检查当前登录状态"""

    print("检查登录状态...")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            headless=True,  # 静默检查
            viewport=BROWSER_CONFIG["viewport"],
            args=BROWSER_CONFIG["args"]
        )

        page = context.pages[0] if context.pages else context.new_page()
        page.goto("https://www.xiaohongshu.com", timeout=30000)

        # 检查是否有登录按钮（未登录标志）
        login_btn = page.query_selector("text=登录")

        if login_btn:
            print("当前状态: 未登录")
            print("请运行 python xhs_login.py 进行登录")
            context.close()
            return False
        else:
            print("当前状态: 已登录")
            context.close()
            return True


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        check_login_status()
    else:
        login()
