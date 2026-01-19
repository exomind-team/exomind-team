# Scout 协议规格 v1.4

> **版本**: v1.4
> **来源**: 综合 08-TECH_SPEC + 四模型评审共识
> **状态**: 规范化、可引用

---

## 1. 协议概述

Scout 是 ExoBuffer 的核心评估 Agent，负责对外部信息进行价值判断和行动建议。

**输入**：Markdown 格式的内容 + 用户上下文（可选）
**输出**：结构化评估（`[!SUMMARY]` 块 + JSON）

---

## 2. 评估框架

### 2.1. 价值评分 (0-10)

| 分数   | 含义              | 建议行动               |
| ---- | --------------- | ------------------ |
| 0-3  | 低价值，无需保留        | DISCARD            |
| 4-6  | 中等价值，可留存        | ARCHIVE_FOR_FUTURE |
| 7-9  | 高价值，需深度阅读       | DEEP_READ          |
| 10   | 极高价值，立即行动       | IMMEDIATE_ACTION   |

### 2.2. 建议行动 (Next Action)

| 行动                    | 含义             |
| --------------------- | -------------- |
| DEEP_READ_AND_REFLECT | 高价值，需仔细阅读      |
| SKIM_AND_SUMMARIZE    | 中等价值，提取要点即可    |
| ARCHIVE_FOR_FUTURE    | 暂存，无需立即处理      |
| DISCARD               | 低价值，可丢弃        |
| DELEGATE_TO_AGENT     | 传递给其他 Agent 处理 |

---

## 3. 输出格式

### 3.1. Markdown 摘要块

```markdown
[!SUMMARY]
**价值评分**: {score}/10
**建议行动**: {next_action}
**置信度**: {confidence}%

**核心观点**:
- {point_1}
- {point_2}
- {point_3}

**关键洞察**:
{insights}

**潜在偏见**:
{bias_alert || "未检测到明显偏见"}

**资源链接**:
{resource_matrix}
```

### 3.2. JSON 评估结构

```json
{
  "value_score": 0,
  "value_reasoning": "string",
  "next_action": "DEEP_READ_AND_REFLECT | SKIM_AND_SUMMARIZE | ARCHIVE_FOR_FUTURE | DISCARD | DELEGATE_TO_AGENT",
  "confidence": 0.0,
  "user_bias_alert": "string | null",
  "tactical_suggestions": {
    "immediate_action": "string",
    "deferred_value": 0,
    "time_budget": "15min | 30min | 1h | 2h+"
  },
  "alignment_check": {
    "role_A_short_term": "string",
    "role_B_long_term": "string",
    "role_C_growth": "string"
  },
  "resource_matrix": [
    {"type": "article | video | tool | book", "name": "string", "url": "string"}
  ]
}
```

---

## 4. Prompt Template

```markdown
# Role: Scout Agent (ExoBuffer v1.4)

You are the "Scout" of ExoMind system. Your mission is to evaluate external information and provide actionable intelligence.

## Input Content
---
{markdown_content}
---

## User Context (Optional)
---
{user_context}
---

## Evaluation Framework

### 1. Value Assessment (0-10)
- 0-3: Low value, discard
- 4-6: Medium value, archive for later
- 7-9: High value, deep read recommended
- 10: Critical, immediate action

### 2. Next Action Recommendation
Choose ONE:
- DEEP_READ_AND_REFLECT
- SKIM_AND_SUMMARIZE
- ARCHIVE_FOR_FUTURE
- DISCARD
- DELEGATE_TO_AGENT

### 3. Bias Detection
Identify potential biases:
- Political bias
- Commercial bias
- Emotional manipulation
- Missing context

### 4. Resource Extraction
Extract all URLs and references from the content.

## Output Requirements
- Be concise but informative
- Focus on actionable insights
- Highlight potential risks/biases
- Extract all useful resources
- Output both [!SUMMARY] block AND JSON evaluation
```

---

## 5. 平台适配

### 5.1. Router 规则

| 平台 | URL Pattern | Extractor |
|------|-------------|-----------|
| 微信公众号 | `mp.weixin.qq.com` | `wechat_article` |
| 小红书 | `xiaohongshu.com` | `xhs_post` |
| 知乎 | `zhihu.com` | `zhihu` |
| PDF | `*.pdf` | `pdf` |
| 通用 | `*` | `general` |

### 5.2. Extractor 接口

```python
class BaseExtractor:
    """提取器基类"""
    async def extract(self, url: str) -> ExtractResult:
        """提取 URL 内容"""
        raise NotImplementedError

class ExtractResult:
    title: str
    content: str  # Markdown
    images: list[str]
    metadata: dict
```

---

## 6. Obsidian 导出规范

### 6.1. 目录结构

```
0-Inbox/
└── YYYYMMDD-HHmm-{摘要}/
    ├── 原文.md      # 提取的原始内容
    ├── 评估.md      # Scout 评估结果
    └── meta/
        └── metadata.json  # 机器可读元数据
```

### 6.2. 评估.md 格式

```markdown
---
exobuffer_id: "eb-{timestamp}-{hash}"
exobuffer_source: "{source_url}"
value_score: {score}
next_action: "{action}"
tags: [{tags}]
created_at: "{iso8601}"
---

# {title}

## Scout 评估

[!SUMMARY]
{summary_block}

## 完整评估

```json
{scout_json}
```

## 7. 元数据
- **来源**: {source_url}
- **评估时间**: {timestamp}
- **评分**: {score}/10
- **建议**: {next_action}
```

---

## 7. 版本演进

| 版本  | 日期         | 变更           |
| --- | ---------- | ------------ |
| v1.4 | 2026-01-12 | 独立成规格文档，格式标准化 |
| v1.3 | 2026-01-06 | 增加资源矩阵、偏见检测  |
| v1.0 | 2025-12-xx | 初始版本         |
