#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
提取Burks 1969技术报告的全文
Von Neumann's Self-Reproducing Automata
"""

import pypdf
import sys
import os

def main():
    pdf_dir = "D:\\project\\ExoMind-Obsidian-HailayLin\\ExoMind-Team\\Projects\\计算机生命\\文献\\自复制自动机"

    # 列出所有pdf文件
    print("目录中的PDF文件:")
    pdf_files = []
    for f in os.listdir(pdf_dir):
        if f.endswith('.pdf'):
            print(f"  {f}")
            pdf_files.append(f)

    # 查找包含Burks的文件
    burks_file = None
    for f in pdf_files:
        if "Burks" in f or "burks" in f.lower():
            burks_file = f
            break

    if burks_file:
        print(f"\n找到Burks文件: {burks_file}")
        pdf_path = os.path.join(pdf_dir, burks_file)

        reader = pypdf.PdfReader(pdf_path)
        print(f"总页数: {len(reader.pages)}")

        full_text = []
        for i, page in enumerate(reader.pages):
            print(f"正在处理第 {i+1}/{len(reader.pages)} 页...")
            text = page.extract_text()
            if text:
                full_text.append(f"\n\n=== PAGE {i+1} ===\n\n")
                full_text.append(text)
            else:
                print(f"  警告: 第 {i+1} 页无法提取文本")
                full_text.append(f"\n\n=== PAGE {i+1} ===\n\n[无法提取文本]")

        result = "".join(full_text)

        # 保存到文件
        output_path = os.path.join(pdf_dir, "burks_1969_extracted.txt")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(result)

        print(f"\n提取完成！")
        print(f"文件大小: {len(result)} 字符")
        print(f"已保存到: {output_path}")
    else:
        print("未找到Burks的PDF文件")

if __name__ == "__main__":
    main()
