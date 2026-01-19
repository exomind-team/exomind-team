import os
import re

log_path = 'ExoBuffer项目日志.md'
archive_path = 'ExoBuffer项目日志_Archived.md'

# 核心价值关键词
core_keywords = [
    "Git Commit 工作流集成",
    "Scout Agent v1.3 发布",
    "Scout Agent v1.2 提示词",
    "蛋白质进化 V3",
    "架构升级：解除",
    "蛋白质进化 V2",
    "战略评审",
    "技术调研",
    "架构设计",
    "项目初始化",
    "Scout Agent 核心提示词工程",
    "Scout 核心验证逻辑设计",
    "日志协议升级",
    "日志生命周期管理"
]

def get_time_from_chunk(chunk):
    """从日志块中提取起始时间用于排序"""
    match = re.search(r'Time: Start (\d{2}:\d{2}:\d{2})', chunk)
    if match:
        return match.group(1)
    return "00:00:00"

def refine_and_archive():
    if not os.path.exists(log_path): return

    with open(log_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    header = []
    chunks = []
    current_chunk = []
    
    # 1. 结构化分割
    for line in lines:
        if line.startswith('> [!log]- '):
            if current_chunk: chunks.append(current_chunk)
            current_chunk = [line]
        elif chunks or current_chunk:
            current_chunk.append(line)
        else:
            header.append(line)
    if current_chunk: chunks.append(current_chunk)

    to_keep = []
    to_archive = []
    
    # 2. 价值评估过滤 (保留前5条及核心业务条目)
    recent_limit = 5
    for idx, chunk in enumerate(chunks):
        title = chunk[0]
        is_core = any(kw in title for kw in core_keywords)
        if idx < recent_limit or is_core:
            to_keep.append(chunk)
        else:
            to_archive.append(chunk)

    # 3. 写入精简后的主日志
    with open(log_path, 'w', encoding='utf-8') as f:
        f.writelines(header)
        for chunk in to_keep:
            f.writelines(chunk)
            f.write('\n')

    # 4. 有序合并存档 (时间倒序)
    if to_archive:
        existing_archive_content = ""
        if os.path.exists(archive_path):
            with open(archive_path, 'r', encoding='utf-8') as f:
                existing_archive_content = f.read()
        
        # 移除存档标题以便重新组合
        existing_archive_content = re.sub(r'^# ExoBuffer 项目日志存档\n\n', '', existing_archive_content)
        
        new_archive_text = "".join(["".join(c) + "\n" for c in to_archive])
        
        # 微信公众号条目通常已经按照 PREPEND 方式排列（最新的在最前）
        # 所以直接 new + existing 即可保持时间倒序
        combined_content = "# ExoBuffer 项目日志存档\n\n" + new_archive_text + existing_archive_content
        
        with open(archive_path, 'w', encoding='utf-8') as f:
            f.write(combined_content)

    print(f"Refinement complete. Kept {len(to_keep)}, Archived {len(to_archive)}")

if __name__ == "__main__":
    refine_and_archive()