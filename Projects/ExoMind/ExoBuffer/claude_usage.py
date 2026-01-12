# claude_usage.py - 读取 Claude.ai 使用额度（API 方案）
"""
使用 Playwright 获取登录 Cookie，然后调用 Claude API 获取使用额度数据。

使用方法:
    python claude_usage.py          # 获取 usage
    python claude_usage.py --login  # 先登录
"""

from playwright.sync_api import sync_playwright
from pathlib import Path
import json
import time
import sys
from datetime import datetime

# 复用 xhs-scraper 的 Profile
BASE_DIR = Path(__file__).parent
PROFILE_DIR = BASE_DIR / "xhs-scraper" / "profile"

# Claude URLs
CLAUDE_USAGE_PAGE = "https://claude.ai/settings/usage"
CLAUDE_LOGIN_URL = "https://claude.ai/login"

BROWSER_CONFIG = {
    "headless": False,
    "slow_mo": 500,
    "viewport": {"width": 1280, "height": 900},
    "args": [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox"
    ]
}


def check_login(page) -> bool:
    """检查是否已登录"""
    current_url = page.url
    if "login" in current_url.lower():
        return False
    return True


def do_login():
    """手动登录 Claude.ai"""
    print("=" * 50)
    print("Claude.ai 登录模块")
    print("=" * 50)
    print(f"Profile 目录: {PROFILE_DIR}")
    print()
    
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            headless=False,
            slow_mo=BROWSER_CONFIG["slow_mo"],
            viewport=BROWSER_CONFIG["viewport"],
            args=BROWSER_CONFIG["args"]
        )
        
        page = context.pages[0] if context.pages else context.new_page()
        
        print("正在打开 Claude.ai 登录页...")
        page.goto(CLAUDE_LOGIN_URL, timeout=60000)
        
        print()
        print("=" * 50)
        print("请在浏览器中手动登录 Claude.ai：")
        print("1. 使用 Google/邮箱登录")
        print("2. 完成验证（如有）")
        print("3. 确认登录成功后，回到此窗口按 Enter")
        print("=" * 50)
        print()
        
        input("登录完成后按 Enter 保存会话...")
        
        page.goto(CLAUDE_USAGE_PAGE, timeout=60000)
        page.wait_for_load_state("networkidle")
        
        if check_login(page):
            print("✅ 登录成功！")
        else:
            print("⚠️ 登录可能未成功，请重试")
        
        context.close()
        print(f"登录状态已保存至: {PROFILE_DIR}")


def get_claude_usage():
    """通过 API 获取 Claude.ai 使用额度"""
    
    print("=" * 50)
    print("Claude.ai Usage 读取工具 (API 版)")
    print("=" * 50)
    
    result = {
        "timestamp": datetime.now().isoformat(),
        "usage": None
    }
    
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            headless=BROWSER_CONFIG["headless"],
            slow_mo=BROWSER_CONFIG["slow_mo"],
            viewport=BROWSER_CONFIG["viewport"],
            args=BROWSER_CONFIG["args"]
        )
        
        page = context.pages[0] if context.pages else context.new_page()
        
        api_response = {}
        
        def handle_response(response):
            # 捕获 /usage API
            if "/usage" in response.url and "organizations" in response.url:
                try:
                    api_response["data"] = response.json()
                    api_response["url"] = response.url
                except:
                    pass
        
        page.on("response", handle_response)
        
        print("正在访问 Claude.ai 使用页面...")
        page.goto(CLAUDE_USAGE_PAGE, timeout=60000)
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        
        if not check_login(page):
            print("⚠️ 未登录，跳转到了登录页面")
            print("请先运行: python claude_usage.py --login")
            context.close()
            return None
        
        print("✅ 已登录")
        time.sleep(2)
        
        if api_response.get("data"):
            print("✅ 成功捕获 API 响应")
            result["api_url"] = api_response["url"]
            result["raw_response"] = api_response["data"]
            
            data = api_response["data"]
            
            # 解析 5 小时限制
            five_hour = data.get("five_hour", {})
            seven_day = data.get("seven_day", {})
            
            result["usage"] = {
                "five_hour": {
                    "utilization": five_hour.get("utilization", 0),
                    "resets_at": five_hour.get("resets_at", "")
                },
                "seven_day": {
                    "utilization": seven_day.get("utilization", 0),
                    "resets_at": seven_day.get("resets_at", "")
                }
            }
            
            # 计算剩余重置时间
            if five_hour.get("resets_at"):
                reset_time = datetime.fromisoformat(five_hour["resets_at"].replace("Z", "+00:00"))
                now = datetime.now(reset_time.tzinfo)
                remaining = (reset_time - now).total_seconds()
                result["usage"]["five_hour"]["reset_in_seconds"] = int(remaining)
                result["usage"]["five_hour"]["reset_in_minutes"] = int(remaining // 60)
            
            print()
            print("=" * 50)
            print(f"5小时限制: {five_hour.get('utilization', 0)}% 已使用")
            if result["usage"]["five_hour"].get("reset_in_minutes"):
                print(f"  距离重置: {result['usage']['five_hour']['reset_in_minutes']} 分钟")
            print(f"7天限制: {seven_day.get('utilization', 0)}% 已使用")
            print("=" * 50)
        else:
            print("⚠️ 未捕获到 API 响应")
        
        screenshot_path = BASE_DIR / "claude_usage_screenshot.png"
        page.screenshot(path=str(screenshot_path), full_page=True)
        
        context.close()
    
    output_path = BASE_DIR / "claude_usage.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"✅ 结果已保存: {output_path}")
    
    return result


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--login":
        do_login()
    else:
        get_claude_usage()
