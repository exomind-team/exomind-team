import os
import re
import sys
import time
import html
import tempfile
import urllib.request
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from markdownify import MarkdownConverter

DEFAULT_TIMEOUT = 15
MAX_RETRIES = 3

# --- 工具函数与类 ---

def filter_style(style_str):
    """仅保留 color 和 font-weight 样式"""
    if not style_str:
        return ''
    styles = [s.strip() for s in style_str.split(';') if s.strip()]
    allowed_props = ['color', 'font-weight']
    filtered = [s for s in styles if s.split(':')[0].strip().lower() in allowed_props]
    return '; '.join(filtered)

class ScoutConverter(MarkdownConverter):
    def convert_span(self, el, text, *args, **kwargs):
        style = el.get('style', '')
        filtered_style = filter_style(style)
        if filtered_style:
            return f'<span style="{filtered_style}">{text}</span>'
        return text

    def convert_img(self, el, text, *args, **kwargs):
        # 优先从 data-src 获取，这是微信的高清图来源
        src = el.get('data-src') or el.get('src', '')
        alt = el.get('alt', '')
        if not src:
            return ''
        return f'![{alt}]({src})'

    def convert_p(self, el, text, *args, **kwargs):
        style = el.get('style', '')
        filtered_style = filter_style(style)
        if filtered_style:
            n = chr(10)
            return f'{n}{n}<span style="{filtered_style}">{text}</span>{n}{n}'
        return super().convert_p(el, text, *args, **kwargs)

def download_html(url, timeout=DEFAULT_TIMEOUT, max_retries=MAX_RETRIES):
    """模拟浏览器下载 HTML（支持超时与重试）"""
    print(f"Downloading: {url} ...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(1, max_retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.read().decode('utf-8')
        except Exception as e:
            print(f"Error downloading {url} (attempt {attempt}/{max_retries}): {e}")
            if attempt >= max_retries:
                return None

def extract_metadata(html_content):
    """从 HTML 的 JS 变量中深度打捞元数据"""
    metadata = {
        'title': '',
        'author': '',
        'publish_time': '',
        'source_url': ''
    }
    
    # 提取标题
    title_match = re.search(r"var msg_title = '(.*?)'\.html\(", html_content)
    if title_match:
        metadata['title'] = html.unescape(title_match.group(1))
    
    # 提取作者
    author_match = re.search(r'var author = "(.*?)";', html_content)
    if author_match:
        metadata['author'] = html.unescape(author_match.group(1))
        
    # 提取发布时间 (ct)
    ct_match = re.search(r'var ct = "(\d+)";', html_content)
    if ct_match:
        ts = int(ct_match.group(1))
        metadata['publish_time'] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(ts))
        
    # 提取链接
    url_match = re.search(r'var msg_link = "(.*?)";', html_content)
    if url_match:
        metadata['source_url'] = url_match.group(1)
        
    return metadata

def sanitize_filename(name):
    return re.sub(r'[\\/*?:\"<>|]', "", name).strip()

# --- 主逻辑 ---

def process_source(input_source, output_path=None, save_cache=False, cache_dir=None):
    html_content = ""
    cache_path = None
    
    # 1. 确定输入源类型
    if input_source.startswith("http://") or input_source.startswith("https://"):
        html_content = download_html(input_source)
        if html_content and save_cache:
            cache_file = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".html",
                prefix="scout_download_cache_",
                dir=cache_dir or ".",
                mode="w",
                encoding="utf-8",
            )
            cache_file.write(html_content)
            cache_file.close()
            cache_path = cache_file.name
            print(f"Saved cache HTML: {cache_path}")
    else:
        # 假设是本地文件
        if not os.path.exists(input_source):
            print(f"Error: File not found: {input_source}")
            return
        with open(input_source, 'r', encoding='utf-8') as f:
            html_content = f.read()

    if not html_content:
        print("Error: Empty content.")
        return

    # 2. 提取元数据
    meta = extract_metadata(html_content)
    title = meta['title'] or "未命名文章"
    
    # 3. 自动决定输出路径 (如果未指定)
    if not output_path:
        safe_title = sanitize_filename(title)
        output_path = f"{safe_title}.md"
        print(f"Auto-generated output filename: {output_path}")

    # 4. 解析 HTML
    soup = BeautifulSoup(html_content, 'lxml')

    # 清理微信冗余
    for target in soup.find_all(string=re.compile("在小说阅读器中沉浸阅读")):
        if target.parent:
            target.parent.extract()

    # 5. 转换正文
    # 针对微信，js_content 是主要内容区域
    content_div = soup.find('div', id='js_content') or soup.find('div', class_='rich_media_content')
    
    converter = ScoutConverter(heading_style="ATX")
    if content_div:
        md_body = converter.convert_soup(content_div)
    else:
        print("Warning: Could not find 'js_content'. Converting full body.")
        md_body = converter.convert_soup(soup.body or soup)

    # 6. 构造 Header
    n = chr(10)
    # 优先使用提取到的 URL，如果是本地文件且没提取到，则用 'Local File'
    source_url = meta['source_url'] or (input_source if input_source.startswith("http") else "Local File")
    
    header = f"# {title}{n}{n}"
    header += f"**来源**: {source_url}{n}"
    header += f"**作者**: {meta['author']}{n}"
    header += f"**发布时间**: {meta['publish_time']}{n}"
    header += f"**格式**: Markdown (Scout V3){n}{n}"
    header += f"---{n}{n}"

    # 7. 规范化 Markdown
    md_body = re.sub(r'\n{3,}', f'{n}{n}', md_body).strip()
    
    final_md = header + md_body

    # 8. 保存
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(final_md)
        print(f"Successfully generated protein: {output_path}")
    except Exception as e:
        print(f"Error saving file: {e}")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Scout Converter: URL/HTML to Markdown with optional cache save."
    )
    parser.add_argument("input_source", help="URL 或本地 HTML 文件路径")
    parser.add_argument("output_path", nargs="?", help="输出 Markdown 路径（可选）")
    parser.add_argument(
        "--save-cache",
        action="store_true",
        help="保存下载后的 HTML 缓存（使用临时唯一文件名）",
    )
    parser.add_argument(
        "--cache-dir",
        help="HTML 缓存保存目录（默认当前目录）",
    )
    args = parser.parse_args()

    process_source(
        args.input_source,
        args.output_path,
        save_cache=args.save_cache,
        cache_dir=args.cache_dir,
    )
