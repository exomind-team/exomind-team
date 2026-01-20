# 技术选型：架构定位 + 集成分析

📅创建：2026-01-20
📝整合自：架构设计-20260120.md、秘塔搜索技术栈分析、技术选型v1.md

---

## 七层架构概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 第7层 │ UI层           │ core/ui/           │ 通用UI组件（跨端共享）         │
│       │                │ apps/*/ui/         │ 各端专用UI实现                 │
├───────┼────────────────┼────────────────────┼───────────────────────────────┤
│ 第6层 │ 业务层          │ core/business/     │ 通用业务逻辑                   │
│       │                │ apps/*/business/   │ 平台适配业务                   │
├───────┼────────────────┼────────────────────┼───────────────────────────────┤
│ 第5层 │ 事件总线        │ core/event-bus/    │ Actor内模块通讯                │
├───────┼────────────────┼────────────────────┼───────────────────────────────┤
│ 第4层 │ 数据层          │ core/data/         │ 区块链数据结构                 │
├───────┼────────────────┼────────────────────┼───────────────────────────────┤
│ 第3层 │ 同步引擎        │ core/sync/         │ 同步策略+冲突解决              │
├───────┼────────────────┼────────────────────┼───────────────────────────────┤
│ 第2层 │ 存储层          │ core/storage/      │ SQLite/IndexedDB本地存储       │
├───────┼────────────────┼────────────────────┼───────────────────────────────┤
│ 第1层 │ 网络层          │ core/network/      │ mDNS+P2P+WebSocket             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 一、UI层（第7层）

### React

**架构定位**：UI层 - 声明式渲染、组件化框架

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| TypeScript | 原生支持 | 确保 `tsconfig.json` 开启严格模式 |
| Vite | 构建工具 | 开发服务器 + 生产打包 |
| Tailwind CSS | 样式方案 | 配合 `@tailwindcss/vite` 或 PostCSS |
| Radix UI | 无样式组件 | 提供可访问性行为逻辑 |
| Zustand | 状态管理 | 通过 Hooks 订阅状态 |
| React Router | 路由管理 | 页面组件组合 |
| Tauri | 原生封装 | WebView 渲染 |
| shadcn/ui | 组件集合 | 组件代码复制到项目 |

**详细评估**：

- 难度@人：熟悉核心概念，即可上手
- 难度@Agent：文档多、组件单一职责高内聚低耦合，方便修改
- 局限性：渲染太多元素仍然会卡顿（几百个就会有性能问题）
- 社区：足够成熟

**坑**：

- 大量 DOM 元素会导致渲染卡顿（几百个就会有性能问题）
- 避免深层嵌套组件链，造成不必要的重渲染

---

### Tailwind CSS

**架构定位**：UI层 - 原子化 CSS 样式引擎

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| Vite | 构建集成 | `@tailwindcss/vite` 插件 |
| React | 样式编写 | 直接在 JSX 中使用工具类 |
| Radix UI | 样式覆盖 | 覆盖默认样式实现自定义外观 |
| shadcn/ui | 样式基础 | 组件基于 Tailwind 构建 |
| PostCSS | 处理 | 确保 purge 正确以减小体积 |
| design tokens | 配置 | 在 `tailwind.config.js` 中定义设计规范 |

**详细评估**：

- 哲学：实用优先，能简化css编写，用原子CSS类组合构建样式
- 功能：设计上对样式进行约束，减少重复；适合定制化UI设计，可供快速原型开发
- 文档：官方文档详尽，Agent有足够参考
- 性能：编译生成CSS，体积小，构建快
- 社区：有各色UI组件框架，比如Radix UI

**注意事项**：

- 配置 `tailwind.config.js` 定义统一的设计系统
- 使用 `@apply` 谨慎，避免破坏原子化原则
- 构建时启用 Tree-shaking，只生成用到的 CSS

---

### Radix UI

**架构定位**：UI层 - 无样式可访问性组件库

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| Tailwind CSS | 样式配合 | 无样式，需自行添加样式 |
| React | 组件渲染 | 函数式组件 + Hooks |
| shadcn/ui | 底层依赖 | shadcn/ui 基于 Radix 构建 |
| Zustand | 无直接集成 | 状态由 Radix 内部管理 |

**详细评估**：

- 哲学：分离组件状态、交互和样式（配合Tailwind CSS，使用Zustand状态管理）
- 学习：需要理解其API设计，组件组合方式
- 文档：足够丰富，可快速开始，也方便Agent编写

**注意事项**：

- 需额外安装对应组件的包（如 `@radix-ui/react-dialog`）
- 需要理解其 API 设计（Trigger、Content、Overlay 等）
- 键盘导航和焦点管理由 Radix 自动处理

**坑**：

- 无默认样式，外观需要完全自定义
- 组件组合方式复杂，需要阅读文档

---

### shadcn/ui

**架构定位**：UI层 - 组件构建方法论（Radix + Tailwind 组合）

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| React | 组件渲染 | 标准 React 组件 |
| Tailwind CSS | 样式基础 | 组件使用 Tailwind 类 |
| Radix UI | 行为引擎 | Dialog、Dropdown 等基于 Radix |
| Zustand | 状态集成 | 通过 props 传递状态 |
| Lucide React | 图标依赖 | 组件使用 Lucide 图标 |
| TypeScript | 类型支持 | 内置类型定义 |

**详细评估**：

- ✅组合Radix UI与Tailwind CSS
- 功能：可快速开始
- ❗紧密绑定React、Tailwind CSS
- 社区：2023发布，足够活跃（GitHub 105k star @ 2026-01-20）
- ❓一个要考虑的点：shadcn/ui把React与Tailwind CSS结合，需要考虑Zustand状态管理如何被集成

**注意事项**：

- 不是 npm 包，是 CLI 工具将组件代码复制到项目
- 组件代码完全可控，可随意修改
- 运行 `npx shadcn-ui@latest add button` 添加组件

**坑**：

- 与 React、Tailwind CSS 紧密绑定
- 升级需要手动同步修改的代码
- 组件复制可能导致代码重复

---

### Lucide React

**架构定位**：UI层 - 图标库

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| React | SVG 组件渲染 | `<Icon />` 组件 |
| Tailwind CSS | 图标样式 | 通过 class 控制大小、颜色 |
| shadcn/ui | 图标使用 | 组件中嵌入 Lucide 图标 |
| 任意 UI 库 | 通用图标 | 技术栈通用 |

**详细评估**：

- 图标库：标准Lucide图标，基本覆盖完全
- 图标库大、矢量渲染、轻量级，✅非常容易使用
- 各种技术栈通用，但关注领域也很小，切勿考虑太长时间

**注意事项**：

- 按需导入避免打包体积过大
- 支持 `size`、`color`、`strokeWidth` 等属性

---

### React Router v7

**架构定位**：UI层 - 声明式路由解决方案

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| React | 页面渲染 | 声明式路由配置 |
| Vite | 构建集成 | 代码分割 + HMR |
| Zustand | 状态保持 | 页面切换时可能需要持久化 |
| Tauri | 路由适配 | 需要处理原生路由 |

**详细评估**：

- 最新版本：v7，对应React版本：v19
- 核心：声明式路由解决方案，将UI与URL紧密绑定
- 性能：分页面打包JavaScript；结合Vite：HMR热模块替换，最小化组件重渲染
- 生态：React框架下良好集成；React标准解决方案；社区庞大活跃；维护快（上周有提交）

**注意事项**：

- 支持基于路由的代码分割
- 与 Vite HMR 深度集成
- 处理嵌套路由时注意布局组件

---

### AntDesign（排除）

**架构定位**：UI层 - 组件库

**排除原因**：太丑，不考虑

---

## 二、业务层（第6层）

### Zustand

**架构定位**：业务层/UI层 - 状态管理

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| React | Hooks (`useStore`) | 选择性订阅避免重渲染 |
| Dexie.js | 持久化集成 | 使用 `persist` 中间件 |
| SQLite | 数据持久化 | 状态 → 存储适配器 |
| IndexedDB | Web 持久化 | Dexie.js 适配 |
| shadcn/ui | 状态消费 | props 传递或 Hook 直接调用 |
| 事件总线 | 状态同步 | 状态变更时 emit 事件 |

**详细评估**：

- 📄中文文档：<https://zustand.nodejs.cn/>
- 哲学：简化React的状态管理，清晰明了呈现加载、渲染、数据处理逻辑
- 可读性&易用性：用户可读，AI友好，逻辑清晰可见，有函数式基础的开发者都能上手
- ❗要注意开发的规范，避免层次过深的嵌套对象
- 社区：活跃，GitHub维护积极快速（1h内仍有提交），2019.12开始发布2.0.0

**Zustand + shadcn/ui 集成**：

```typescript
// 业务层 store (Layer 6)
const useThemeStore = create((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));

// UI层组件 (Layer 7)
import { Switch } from '@/components/ui/switch';
import { useThemeStore } from '@/business/theme.store';

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  return <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />;
}
```

**注意事项**：

- 避免开发规范问题，防止层次过深的嵌套对象
- 使用选择器 `useStore(state => state.x)` 只订阅需要的状态
- 可按领域拆分多个 store（userStore、notesStore、syncStore）

---

### Auth.js

**架构定位**：业务层/认证模块 - 用户身份认证

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| React | 前端集成 | Provider 包裹 |
| Tauri | 后端适配 | 需自定义后端逻辑 |
| TypeScript | 类型安全 | 内置类型定义 |
| Zustand | 用户状态 | 结合 store 管理 |

**详细评估**：

- 哲学：容易使用的API，开发最快，降低认证逻辑门槛
- 文档社区足够详细，可作为MVP用

**MVP 阶段快速实现方案**

---

## 三、状态机/架构模型

### xstate

**架构定位**：状态机/业务层 - Actor模型 in 有限状态机

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| React | 适配包 | `@xstate/react` |
| 事件总线 | 联动 | 事件驱动，可联动事件总线 |
| TypeScript | 类型支持 | 官方v5支持TypeScript |

**详细评估**：

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

> ✅ 已调研完成

---

## 四、事件总线（第5层）

### mitt

**架构定位**：事件总线 - Actor 内模块通讯

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| TypeScript | 泛型类型 | `mitt<T>()` 定义事件类型 |
| 网络层 | 离线队列 | 网络恢复时重新 emit |
| 存储层 | 持久化事件 | 离线事件存入本地存储 |
| 业务层 | 模块解耦 | 发布/订阅模式 |
| React | 无直接集成 | 可在任意位置使用 |
| xstate | 联动 | 事件驱动架构 |

**事件总线封装设计**：

```typescript
// core/event-bus/events.ts
export type AppEvents = {
  'data:syncCompleted': { status: 'success' | 'failed' };
  'auth:userLoggedIn': { userId: string };
  'storage:databaseReady': void;
};

// core/event-bus/index.ts
import mitt, { Emitter } from 'mitt';
import { AppEvents } from './events';

export const eventBus: Emitter<AppEvents> = mitt<AppEvents>();
```

**注意事项**：

- 避免事件名称冲突，建议使用命名空间（如 `'user:login'`）
- 记得在组件卸载时 `off` 事件监听器
- 考虑实现离线事件队列支持离线优先

---

### ts-emits（备选）

**架构定位**：事件总线 - 类型安全事件

**详细评估**：

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

---

## 五、Actor 模型框架

### Dapr.io（排除）

**架构定位**：Actor 模型框架

**详细评估**：

- 先不考虑，这是一站式运行时，类似MySQL、HDFS那样基本是独立的软件
- ❗缺点：体量大、集成困难、跨Actor查询效率低
- 参考：Dapr 的 Actor 模型设计很好，但作为独立软件集成成本高

> 📌 **结论**：mvp阶段暂时不做

---

## 六、存储层（第2层）

### Dexie.js

**架构定位**：存储层 - IndexedDB 封装（Web端）

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| React | 深度集成 | 配合 `useLiveQuery` 实现响应式 |
| Zustand | 持久化 | 可通过 persist 中间件集成 |
| 存储抽象层 | 适配器模式 | 实现 `IStorageAdapter` 接口 |
| TypeScript | 类型安全 | Schema 定义 |

**详细评估**：

- 🔗[GitHub](https://github.com/dexie/Dexie.js)
- 场景：IndexedDB方案，主要用于Web端（难以访问本地文件）与移动端（作为备选）
- ✅深度集成React，易用，异步支持
- 文档：较为全面
- 社区：健康活跃，维护活跃度月（代码三个月，提交上个月）

---

### SQLite 系列

**架构定位**：存储层 - PC/移动端本地存储

| 具体库 | 场景 | 集成方式 |
|--------|------|----------|
| **bun:sqlite** | Bun 运行时 | 原生 `import { Database } from 'bun:sqlite'` |
| **rusqlite** | Rust/Tauri | `use rusqlite;` |
| **SQLite WASM** | 浏览器 | WebAssembly 运行 |
| **tauri-plugin-sql** | Tauri | `invoke('query', { sql: '...' })` |
| **tauri-plugin-store** | Tauri | 键值对存储 |

**SQLite 全栈打通方案**：

- PC/Tauri：
  - `tauri-plugin-store`：Rust中访问，提供TypeScript API
  - `tauri-plugin-sql`：异步，可以跟各种SQL数据库交互，配合SQLite能本地存储
- Rust原生：`rusqlite`（直接在Rust本地端处理SQL数据库文件）
- 服务端TypeScript/bun：`bun:sqlite`，原生，高性能，SQLite3
- 服务端TypeScript/deno：`node:sqlite`、`deno-sqlite`
- Web端：SQLite WASM，官方维护，直接在浏览器跑
- 移动端：安卓参考微信，或直接从Tauri v2打包；MacOS&iOS Tauri也能编译

**存储抽象层设计**：

```
core/storage/
├── interface.ts      # IStorageAdapter 接口定义
├── provider.ts       # 动态选择适配器
├── indexeddb.adapter.ts  # Dexie.js 实现 (Web)
├── sqlite.adapter.ts     # Tauri/SQLite 实现 (桌面/移动)
└── index.ts          # getStorage() 统一导出
```

**注意事项**：

- Web端使用 Dexie.js (IndexedDB)
- Tauri 桌面端使用 tauri-plugin-sql 或 rusqlite
- 考虑未来统一使用 SQLite WASM

---

## 七、应用框架

### Tauri v2

**架构定位**：原生应用打包 - 桌面 + 移动端

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| React | 前端渲染 | WebView 作为 UI 引擎 |
| Rust | 后端逻辑 | `src-tauri/` 目录 |
| rusqlite | 数据库 | Rust 端操作 SQLite |
| tauri-plugin-sql | 数据库交互 | 前端调用 SQL |
| tauri-plugin-store | 键值存储 | TypeScript API |
| 网络层 | P2P/mDNS | Rust 端或 IPC 调用 |

**详细评估**：

- Web前端×原生Webview×原生后端，桌面+移动
- Rust顶流框架，桌面×前端的应用首选
- 如此强劲，令人惊叹

**注意事项**：

- 前端运行在受限沙箱
- 访问系统资源需通过明确授权的 API
- 移动端支持需要额外配置

---

## 八、后端运行时

### Bun

**架构定位**：开发工具链 / 潜在后端运行时

**集成分析**：

| 相关技术 | 集成方式 | 注意事项 |
|----------|----------|----------|
| Vite | 替代方案 | 开发时可用 Bun 替代 |
| bun:sqlite | 数据库 | 原生高性能 SQLite |
| TypeScript | 原生支持 | 无需额外编译 |
| npm 生态 | 兼容 | 大部分包可用 |

**详细评估**：

- 功能：
  - 构建上，多合一：打包、转译、运行、包管理
  - 语言上：原生支持TypeScript、JSX/TSX，内置Web标准API
- 性能：足够强
- 生态：
  - 💪依托Zig社区：快速增长
  - ❗资源相对少、文档相对少
  - ✅可用npm，工作流全覆盖
  - ❗安全性不佳，仍可能会有漏洞（一些特性是实验性的）

**注意事项**：

- 生态相对 Node.js 较小
- 部分 API 仍属实验阶段
- 安全性需评估

---

### Deno（暂不使用）

**架构定位**：后端运行时 - 备选方案

**决策**：

- 🏷️Node.js续作，但开发泛式与Node.js不同
- 📌稳定性较佳
- ❌ 当前使用 Bun，暂不考虑 Deno

---

## 九、技术栈一览

```
第7层 UI：React + TypeScript + Vite + Tailwind CSS + Radix UI + shadcn/ui + Lucide + React Router
第6层 业务：Zustand + Auth.js
第5层 事件：mitt (封装)
第4层 数据：TypeScript interface/type
第3层 同步：TypeScript 同步算法
第2层 存储：Dexie.js (Web) + bun:sqlite/rusqlite/SQLite WASM (PC)
第1层 网络：mDNS + WebRTC/P2P + WebSocket
应用打包：Tauri v2
运行时：Bun (开发工具/潜在后端)
状态机：xstate ✅ 已调研
```

---

## 十、集成关系图

```
                    ┌─────────────────────────────────────┐
                    │           UI层 (第7层)              │
                    │  React + Vite + Tailwind + shadcn/ui │
                    │  + Lucide + React Router            │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │           业务层 (第6层)              │
                    │  Zustand (状态) + Auth.js (认证)     │
                    └──────────┬──────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼────────┐ ┌─────▼─────┐ ┌──────▼──────┐
     │   事件总线(5)    │ │ 数据层(4) │ │  同步层(3)  │
     │     mitt        │ │ TypeScript│ │  TypeScript │
     │   xstate联动    │ │           │ │             │
     └────────┬────────┘ └─────┬─────┘ └──────┬──────┘
              │                │                │
              │       ┌────────▼────────┐       │
              │       │    存储层(2)     │       │
              │       │ Dexie.js/SQLite │       │
              │       └────────┬────────┘       │
              │                │                │
              │       ┌────────▼────────┐       │
              │       │    网络层(1)     │       │
              │       │ mDNS+P2P+WS     │       │
              │       └────────┬────────┘       │
              │                │                │
              └────────────────┼────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │         Tauri v2 (打包框架)      │
              │  Rust后端 + WebView前端          │
              │  rusqlite + tauri-plugin-*      │
              └─────────────────────────────────┘
```

---

## 十一、待调研

- [x] xstate 状态机调研 ✅
- [ ] 简单代码样例：每项技术 10 行内调用示例
