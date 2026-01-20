# 技术选型 v1

📅创建：2026-01-20
📝整合自：【人写】技术选型 @Argon.md、【人写】技术选型.md

---

## 一、前端技术栈

### 框架与构建

| 技术 | 选型 | 说明 |
|------|------|------|
| **TypeScript** | ✅ | 熟悉，跳过 |
| **Vite** | ✅ | 构建工具，熟悉 |
| **React** | ✅ | 函数式、状态管理、声明式渲染、组件化、JSX |
| **React Router v7** | ✅ | 声明式路由解决方案，管理URL与UI的映射 |

**React 详细评估**：

- 难度@人：熟悉核心概念，即可上手
- 难度@Agent：文档多、组件单一职责高内聚低耦合，方便修改
- 局限性：渲染太多元素仍然会卡顿（几百个就会有）
- 社区：足够成熟

### 状态管理

| 技术 | 选型 | 说明 |
|------|------|------|
| **Zustand** | ✅ | 简化React状态管理，AI友好，有中文文档 |

**Zustand 详细评估**：

- 📄中文文档：<https://zustand.nodejs.cn/>
- 哲学：简化React的状态管理，清晰明了呈现加载、渲染、数据处理逻辑
- 可读性&易用性：用户可读，AI友好，逻辑清晰可见，有函数式基础的开发者都能上手
- ❗要注意开发的规范，避免层次过深的嵌套对象
- 社区：活跃，GitHub维护积极快速（1h内仍有提交），2019.12开始发布2.0.0

### UI 组件

| 技术 | 选型 | 说明 |
|------|------|------|
| **Tailwind CSS** | ✅ | 实用优先，原子CSS类组合，构建快、体积小 |
| **Radix UI** | ✅ | 分离状态、交互和样式，配合Tailwind使用 |
| **shadcn/ui** | ✅ | Radix UI + Tailwind CSS 组合，快速开始 |
| **AntDesign** | ❌ | 太丑，不考虑 |

**Tailwind CSS 详细评估**：

- 哲学：实用优先，能简化css编写，用原子CSS类组合构建样式
- 功能：设计上对样式进行约束，减少重复；适合定制化UI设计，可供快速原型开发
- 文档：官方文档详尽，Agent有足够参考
- 性能：编译生成CSS，体积小，构建快
- 社区：有各色UI组件框架，比如Radix UI

**Radix UI 详细评估**：

- 哲学：分离组件状态、交互和样式（配合Tailwind CSS，使用Zustand状态管理）
- 学习：需要理解其API设计，组件组合方式
- 文档：足够丰富，可快速开始，也方便Agent编写

**shadcn/ui 详细评估**：

- ✅组合Radix UI与Tailwind CSS
- 功能：可快速开始
- ❗紧密绑定React、Tailwind CSS
- 社区：2023发布，足够活跃（GitHub 105k star @ 2026-01-20）
- ❓一个要考虑的点：shadcn/ui把React与Tailwind CSS结合，需要考虑Zustand状态管理如何被集成

### 图标

| 技术 | 选型 | 说明 |
|------|------|------|
| **Lucide React** | ✅ | 图标库，矢量渲染，轻量易用 |

**Lucide React 详细评估**：

- 图标库：标准Lucide图标，基本覆盖完全
- 图标库大、矢量渲染、轻量级，✅非常容易使用
- 各种技术栈通用，但关注领域也很小，切勿考虑太长时间

---

## 二、后端技术栈

### 运行时

| 技术 | 选型 | 说明 |
|------|------|------|
| **Bun** | ✅ | 多合一构建、原生TypeScript支持、高性能 |
| **Deno** | ⏸️ | 备选，安全与稳定优先；但不太兼容Node.js |

**Bun 详细评估**：

- 功能：
  - 构建上，多合一：打包、转译、运行、包管理
  - 语言上：原生支持TypeScript、JSX/TSX，内置Web标准API
- 性能：足够强
- 生态：
  - 💪依托Zig社区：快速增长
  - ❗资源相对少、文档相对少
  - ✅可用npm，工作流全覆盖
  - ❗安全性不佳，仍可能会有漏洞（一些特性是实验性的）

**Deno 详细评估**：

- 🏷️Node.js续作
- ❗开发泛式与Node.js不同
- 📌稳定性较佳

### 本地存储

| 技术 | 选型 | 说明 |
|------|------|------|
| **Dexie.js** | ✅ | IndexedDB方案，Web端首选，深度集成React |
| **bun:sqlite** | ✅ | Bun原生SQLite，高性能 |
| **rusqlite** | ✅ | Rust原生SQLite库 |
| **SQLite WASM** | ✅ | 官方维护，直接在浏览器运行 |
| **tauri-plugin-sql** | ✅ | Tauri插件，异步SQL数据库交互 |
| **tauri-plugin-store** | ✅ | Tauri插件，键值对存储，TypeScript可调用 |

**Dexie.js 详细评估**：

- 🔗[GitHub](https://github.com/dexie/Dexie.js)
- 场景：IndexedDB方案，主要用于Web端（难以访问本地文件）与移动端（作为备选）
- ✅深度集成React，易用，异步支持
- 文档：较为全面
- 社区：健康活跃，维护活跃度月（代码三个月，提交上个月）

**SQLite 全栈打通方案**：

- PC/Tauri：
  - `tauri-plugin-store`：Rust中访问，提供TypeScript API
  - `tauri-plugin-sql`：异步，可以跟各种SQL数据库交互，配合SQLite能本地存储
- Rust原生：`rusqlite`（直接在Rust本地端处理SQL数据库文件）
- 服务端TypeScript/bun：`bun:sqlite`，原生，高性能，SQLite3
- 服务端TypeScript/deno：`node:sqlite`、`deno-sqlite`
- Web端：SQLite WASM，官方维护，直接在浏览器跑
- 移动端：安卓参考微信，或直接从Tauri v2打包；MacOS&iOS Tauri也能编译

### 原生应用

| 技术 | 选型 | 说明 |
|------|------|------|
| **Tauri v2** | ✅ | Rust顶流框架，桌面×移动端应用首选 |

**Tauri v2 详细评估**：

- Web前端×原生Webview×原生后端，桌面+移动
- Rust顶流框架，桌面×前端的应用首选
- 如此强劲，令人惊叹

### 认证

| 技术 | 选型 | 说明 |
|------|------|------|
| **Auth.js** | ✅ | 容易使用的API，开发最快，降低认证逻辑门槛 |

**Auth.js 详细评估**：

- 哲学：容易使用的API，开发最快，降低认证逻辑门槛
- 文档社区足够详细，可作为MVP用

---

## 三、架构模型

### 状态机

| 技术 | 选型 | 说明 |
|------|------|------|
| **xstate** | ✅ | Actor模型 in 有限状态机，社区活跃 |

**xstate 详细评估**：

- 🔗[官网](https://xstate.js.org/)
- ✅actor模型 in 有限状态机
- 核心哲学：状态图+actor

**状态图特性**：

- 层级：状态嵌套
- 并行：独立同时存在，如文档的「字体样式」与「对齐样式」
- 历史：状态回滚

**Actor模型特性**：

- 封装隔离：外部无法访问内部状态
- 组件通信：派生子状态机 `spawn`
- 副作用管理：异步操作→建模→短暂子actor

**方法论**：

- 声明式建模行为：主要使用方法 `createMachine` 创建「状态机定义」，行为说明书
- 事件驱动：可联动事件总线

**学习重难点**：

- 概念：状态、事件、转换、动作、服务/actor、卫兵、上下文
- 支持TypeScript：并非从一开始就支持TypeScript，可能有历史遗留问题

**联动支持**：

- 📦相应适配包：`@xstate/react`
- 🔍潜在联动：与事件总线相关进行联动
- Agent编码友好性：简单清晰定义

### 事件总线

| 技术 | 选型 | 说明 |
|------|------|------|
| **ts-emits** | ⚠️ | 利用TypeScript泛型推断，编译时保证类型正确 |
| **mitt** | ⏸️ | 备选，轻量，但三年未维护，star 11.8k |

**ts-emits 详细评估**：

- 哲学：利用TypeScript泛型推断能力，编译时保证事件数据类型正确性
- 🔗GitHub：<https://github.com/fsdwen/ts-emits>
- ❗生态：难以被搜索，基本没社区跟维护
  - 仓库两年未维护
  - 无社区：1 star，约等于个人项目

**同行比较**：

- [ts-bus](https://github.com/ryardley/ts-bus)：六年未维护，star 140
- [mitt](https://github.com/developit/mitt)：更轻量，但三年未维护，star 11.8k（至少有一定社区维护量，久经考验）

上边这俩都没中文文档，对TypeScript支持程度也参差不齐

✅优势：架构设计上清晰，很新
🚩后续适合用来做：接口层——给 mitt 写壳

### Actor 模型框架

| 技术 | 选型 | 说明 |
|------|------|------|
| **Dapr.io** | ❌ | 一站式运行时，体量大、集成困难、跨Actor查询效率低 |
| **xstate** | ✅ | 29.2k star，社区活跃，月级维护频率，[官方v5支持TypeScript](https://stately.ai/docs/typescript) |

- 先不考虑，这是一站式运行时，类似MySQL、HDFS那样基本是独立的软件
- ❗缺点：体量大、集成困难、跨Actor查询效率低
- 参考：Dapr 的 Actor 模型设计很好，但作为独立软件集成成本高

> 📌 **结论**：Dapr不做，用xstate

---

## 四、技术栈一览

```
前端：React + TypeScript + Vite + Tailwind CSS + Zustand + shadcn/ui + Lucide
存储：Dexie.js (Web) + bun:sqlite/rusqlite/SQLite WASM (PC)
应用：Tauri v2 (桌面/移动)
认证：Auth.js
状态机：xstate
事件：ts-emits → 后续可能迁移到 mitt
```

---

## 五、待调研

- [ ] 简单代码样例：每项技术 10 行内调用示例
