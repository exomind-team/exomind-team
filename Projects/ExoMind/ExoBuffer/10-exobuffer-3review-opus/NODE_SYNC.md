# 节点同步规格 (Phase 2)

> **版本**: v1.0
> **来源**: 06-MiniMax + 四模型评审共识
> **状态**: Phase 2 待实现

---

## 1. 概述

ExoBuffer 支持多节点协作：手机采集、PC 处理。本规格定义节点发现、数据同步和冲突解决机制。

---

## 2. 节点类型

| 类型     | 角色     | 能力               |
| ------ | ------ | ---------------- |
| **采集节点** | 手机/PWA | 只能提交 URL/内容，不能处理 |
| **处理节点** | PC/桌面端 | 提取、评估、导出         |

---

## 3. 节点发现

### 3.1. 局域网发现

- **方案**：mDNS 自动发现（推荐）或手动配置 IP
- **服务名**：`_exobuffer._tcp.local`

### 3.2. 云端发现 (Phase 3)

- 通过用户账号关联节点
- 中继服务转发请求

---

## 4. 数据同步

### 4.1. 同步策略

| 场景   | 策略              |
| ---- | --------------- |
| 在线   | API 实时推送（WebSocket） |
| 离线   | 本地 SQLite 队列，回家同步 |

### 4.2. 同步数据结构

```json
{
  "id": "uuid",
  "type": "buffer_item | task_status | config",
  "action": "create | update | delete",
  "timestamp": "iso8601",
  "payload": {},
  "node_id": "string"
}
```

### 4.3. 同步流程

```
采集节点 (PWA)
    │
    ├── [在线] ──────────▶ WebSocket ──▶ 处理节点 (PC)
    │
    └── [离线] ──────────▶ 本地队列
                              │
                              └── [回家/上线] ──▶ 批量同步
```

---

## 5. 冲突解决

### 5.1. 策略

**时间戳优先 + 用户确认**

| 冲突类型     | 解决策略            |
| -------- | --------------- |
| 同一字段修改   | 取最新 timestamp 版本 |
| 删除 vs 修改 | 保留修改，标记冲突让用户确认  |
| 状态不一致    | 用户手动选择          |

### 5.2. 冲突通知

当发生冲突时，采集节点显示通知：

```
⚠️ 同步冲突：{item_title}
本地版本 vs 服务器版本
[保留本地] [使用服务器] [查看差异]
```

---

## 6. 安全边界

### 6.1. 局域网安全

- API Key 认证（首次配对时生成）
- 可选：配对码机制（类似 AirPlay）

### 6.2. 传输安全

- 局域网：HTTP（可选 HTTPS）
- 公网：强制 HTTPS

---

## 7. API 端点

### 7.1. 节点注册

```
POST /api/v1/nodes/register
{
  "node_id": "string",
  "node_type": "collector | processor",
  "name": "string"
}
```

### 7.2. 同步推送

```
POST /api/v1/sync/push
{
  "items": [SyncItem]
}
```

### 7.3. 同步拉取

```
GET /api/v1/sync/pull?since={timestamp}
Response: { "items": [SyncItem] }
```

### 7.4. WebSocket 实时

```
WS /api/v1/ws

Events:
- buffer_item.created
- buffer_item.updated
- task.progress
- task.completed
```

---

## 8. 验收标准

- [ ] 局域网内手机能发现 PC 节点
- [ ] 手机提交 URL 后 PC 在 5 秒内开始处理
- [ ] 离线时手机能缓存至少 100 条记录
- [ ] 回家后离线数据自动同步无丢失
- [ ] 冲突时有明确的用户确认 UI

---

## 9. 版本演进

| 版本  | 日期         | 变更                |
| --- | ---------- | ----------------- |
| v1.0 | 2026-01-12 | 初始规格（Phase 2 专项） |
