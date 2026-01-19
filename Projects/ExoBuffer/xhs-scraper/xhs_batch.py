# xhs_batch.py - 批量采集模块
"""
批量采集小红书笔记，顺序访问 + 随机延迟（模拟真实用户）。

使用方法:
    # 从文件读取 URL 列表
    python xhs_batch.py urls.txt

    # 直接传入 URL（逗号分隔）
    python xhs_batch.py "url1,url2,url3"
"""

import random
import time
import sys
from pathlib import Path
from datetime import datetime

from xhs_collector import XhsCollector
from xhs_output import save_note
from config import OUTPUT_DIR, DELAY_MIN, DELAY_MAX, CASE_START_ID


def batch_collect(urls: list, start_id: int = CASE_START_ID) -> list:
    """
    批量采集小红书笔记

    Args:
        urls: URL 列表
        start_id: 起始案例编号

    Returns:
        list: 采集结果列表
    """
    results = []
    total = len(urls)

    print("=" * 60)
    print(f"小红书批量采集")
    print(f"总数: {total} 条")
    print(f"起始编号: {start_id}")
    print(f"输出目录: {OUTPUT_DIR}")
    print(f"延迟范围: {DELAY_MIN}-{DELAY_MAX} 秒")
    print("=" * 60)
    print()

    collector = XhsCollector()

    try:
        collector.start()

        for i, url in enumerate(urls, 1):
            case_id = start_id + i - 1

            print(f"\n[{i}/{total}] 案例-{case_id:03d}")
            print(f"URL: {url[:80]}...")
            print("-" * 40)

            try:
                # 采集笔记
                note = collector.collect(url, OUTPUT_DIR)

                # 保存输出
                md_path, json_path = save_note(note, case_id, OUTPUT_DIR)

                results.append({
                    "case_id": case_id,
                    "url": url,
                    "title": note.get("title", ""),
                    "status": "success",
                    "md_path": str(md_path),
                    "json_path": str(json_path)
                })

                print(f"Status: SUCCESS")

            except Exception as e:
                print(f"Status: FAILED - {e}")
                results.append({
                    "case_id": case_id,
                    "url": url,
                    "title": "",
                    "status": "failed",
                    "error": str(e)
                })

            # 随机延迟（最后一条不延迟）
            if i < total:
                delay = random.uniform(DELAY_MIN, DELAY_MAX)
                print(f"\nWaiting {delay:.1f}s before next...")
                time.sleep(delay)

    finally:
        collector.stop()

    # 打印汇总
    print_summary(results)

    return results


def print_summary(results: list):
    """打印采集汇总"""
    success = [r for r in results if r["status"] == "success"]
    failed = [r for r in results if r["status"] == "failed"]

    print()
    print("=" * 60)
    print("采集完成汇总")
    print("=" * 60)
    print(f"成功: {len(success)} 条")
    print(f"失败: {len(failed)} 条")
    print()

    if success:
        print("成功列表:")
        for r in success:
            print(f"  - 案例-{r['case_id']:03d}: {r['title'][:30]}...")

    if failed:
        print("\n失败列表:")
        for r in failed:
            print(f"  - 案例-{r['case_id']:03d}: {r['error']}")

    # 保存汇总报告
    report_path = OUTPUT_DIR / f"batch_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    save_report(results, report_path)
    print(f"\n汇总报告: {report_path}")


def save_report(results: list, path: Path):
    """保存汇总报告"""
    success = [r for r in results if r["status"] == "success"]
    failed = [r for r in results if r["status"] == "failed"]

    report = f"""# 小红书批量采集报告

**采集时间**: {datetime.now().isoformat()}
**总数**: {len(results)}
**成功**: {len(success)}
**失败**: {len(failed)}

---

## 成功列表

| 案例编号 | 标题 | 文件 |
|----------|------|------|
"""

    for r in success:
        title = r.get("title", "")[:30]
        md_name = Path(r.get("md_path", "")).name
        report += f"| 案例-{r['case_id']:03d} | {title} | {md_name} |\n"

    if failed:
        report += """
---

## 失败列表

| 案例编号 | URL | 错误 |
|----------|-----|------|
"""
        for r in failed:
            url_short = r.get("url", "")[:50]
            error = r.get("error", "")[:50]
            report += f"| 案例-{r['case_id']:03d} | {url_short}... | {error} |\n"

    path.write_text(report, encoding="utf-8")


def load_urls_from_file(filepath: str) -> list:
    """从文件加载 URL 列表"""
    path = Path(filepath)
    if not path.exists():
        print(f"File not found: {filepath}")
        return []

    urls = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and line.startswith("http"):
                urls.append(line)

    return urls


def parse_urls_from_string(s: str) -> list:
    """从字符串解析 URL 列表（逗号或换行分隔）"""
    urls = []
    for part in s.replace(",", "\n").split("\n"):
        part = part.strip()
        if part and part.startswith("http"):
            urls.append(part)
    return urls


# 命令行入口
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python xhs_batch.py urls.txt")
        print("  python xhs_batch.py \"url1,url2,url3\"")
        sys.exit(1)

    arg = sys.argv[1]

    # 判断是文件还是 URL 字符串
    if Path(arg).exists():
        urls = load_urls_from_file(arg)
    else:
        urls = parse_urls_from_string(arg)

    if not urls:
        print("No valid URLs found!")
        sys.exit(1)

    print(f"Found {len(urls)} URLs")

    # 可选：指定起始编号
    start_id = CASE_START_ID
    if len(sys.argv) > 2:
        try:
            start_id = int(sys.argv[2])
        except:
            pass

    batch_collect(urls, start_id)
