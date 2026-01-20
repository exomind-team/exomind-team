# 技术选型 @Argon

📅创建：2026-01-20

## TypeScript、Vite

熟悉，跳过

## React

内容：函数式，状态管理，声明式渲染、组件化、JSX

难度@人：熟悉核心概念，即可上手

难度@Agent：文档多、组件单一职责高内聚低耦合，方便修改

局限性：渲染太多元素仍然会卡顿（几百个就会有）

社区：足够成熟

## Tailwind CSS

哲学：实用优先，能简化css编写，用原子CSS类组合构建样式

功能：设计上对样式进行约束，减少重复；适合定制化UI设计，可供快速原型开发

文档：官方文档详尽，Agent有足够参考

性能：编译生成CSS，体积小，构建快

社区：有各色UI组件框架，比如Radix UI

## Radix UI

哲学：分离组件状态、交互和样式（配合Tailwind CSS，使用Zustand状态管理）

学习：需要理解其API设计，组件组合方式

文档：足够丰富，可快速开始，也方便Agent编写

## shadcn/ui

✅组合Radix UI与Tailwind CSS

功能：可快速开始

❗紧密绑定React、Tailwind CSS

社区：2023发布，足够活跃（GitHub 105k star @ 2026-01-20）

❓一个要考虑的点：shadcn/ui把React与Tailwind CSS结合，需要考虑Zustand状态管理如何被集成

## Zustand

📄中文文档：<https://zustand.nodejs.cn/>

哲学：简化React的状态管理，清晰明了呈现加载、渲染、数据处理逻辑

可读性&易用性：用户可读，AI友好，逻辑清晰可见，有函数式基础的开发者都能上手

❗要注意开发的规范，避免层次过深的嵌套对象

社区：活跃，GitHub维护积极快速（1h内仍有提交），2019.12开始发布2.0.0

## Dapr.io

先不考虑，这是一站式运行时，类似MySQL、HDFS那样基本是独立的软件

❗缺点：体量大、集成困难、跨Actor查询效率低

## ts-emits

哲学：利用TypeScript泛型推断能力，编译时保证事件数据类型正确性

🔗GitHub：<https://github.com/fsdwen/ts-emits>

❗生态：难以被搜索，基本没社区跟维护

- 仓库两年未维护
- 无社区：*1 star*，约等于个人项目

- 同行比较：
    - [ts-bus](https://github.com/ryardley/ts-bus)
        - ❌**六年未维护**
        - star 140
    - [mitt](https://github.com/developit/mitt)
        - 更轻量，但三年未维护
        - **star 11.8k**（至少有一定社区维护量，久经考验）

上边这俩都没中文文档，对TypeScript支持程度也参差不齐

✅优势：架构设计上清晰，很新
🚩后续适合用来做：接口层
——给mitt写壳

## React Router

🔗[官网](https://github.com/remix-run/react-router)
🔗[react-router](https://github.com/ReactTraining/react-router)

最新版本：v7
对应React版本：v19

核心：声明式路由解决方案，将UI与URL紧密绑定

- 📌用来管理Web端的URL路由，类似Node.js的Express
- 🎯解决「哪个链接应该对应哪个页面」的问题
- 单页面、多页面通用

性能：

- 分页面打包JavaScript
- 结合Vite：HMR热模块替换，最小化组件重渲染

生态：

- 📦React框架下良好集成
- React标准解决方案
- 社区庞大活跃
- 维护快（上周有提交）

## Dexie.js @ IndexedDB

🔗[GitHub](https://github.com/dexie/Dexie.js)

场景：IndexedDB方案，主要用于Web端（难以访问本地文件）与移动端（作为备选）

✅深度集成React，易用，异步支持

文档：较为全面

社区：健康活跃，维护活跃度 月（代码三个月，提交上个月）

### 扩展：存储侧 SQLite 备选 - 其实也能全栈打通

PC/Tauri：

- [延伸参考文章](https://aptabase.com/blog/persistent-state-tauri-apps)
- `window.localStorage`：最原始、最简单；目前ExoBuffer Connector前端有用，不能访问Rust但纯TypeScript也能用
- ~~`IndexedDB`异步存储：先前有讨论过，稍微麻烦；存用户数据会比较好~~
- [`tauri-plugin-store`](https://github.com/tauri-apps/tauri-plugin-store)：Rust中访问，提供TypeScript API
- [`tauri-plugin-sql`](https://github.com/tauri-apps/tauri-plugin-sql)：异步，可以跟各种SQL数据库交互，配合SQLite能本地存储

Rust原生：`rusqlite`（直接在Rust本地端处理SQL数据库文件`.db`/`.sqlite`）

服务端TypeScript/bun：[`bun:sqlite`](https://bun.com/docs/runtime/sqlite)，原生，高性能，SQLite3

PAW/Web亦可：[SQLite WASM](https://github.com/sqlite/sqlite-wasm)

- 官方维护
- 直接在浏览器跑

安卓：参考微信，或直接从Tauri v2打包

MacOS&iOS：Tauri也能编译（`.app`/`.ipa`）

## Lucide React

图标库：标准Lucide图标，基本覆盖完全

- 图标库大
- 矢量渲染
- 轻量级，✅非常容易使用

各种技术栈通用，但关注领域也很小，切勿考虑太长时间

## Tauri v2 @ Rust

Web前端×原生Webview×原生后端，桌面+移动

Rust顶流框架，桌面×前端的应用首选

> 如此强劲，令人惊叹

## 后端TypeScript运行时：Bun

功能：

- 构建上，多合一：打包、转译、运行、包管理
- 语言上：原生支持TypeScript、JSX/TSX，内置Web标准API

- ❓[Mdn](https://developer.mozilla.org/en-US/docs/Glossary/Bun)：Bun 构建于 Apple 的 [JavaScriptCore](https://trac.webkit.org/wiki/JavaScriptCore) 之上

性能：足够强

生态：

- 💪依托Zig社区：快速增长
- ❗资源相对少、文档相对少
- ✅可用npm，工作流全覆盖
- ❗安全性不佳，仍可能会有漏洞（一些特性是实验性的）

## Auth.js

哲学：容易使用的API，开发最快，降低认证逻辑门槛

文档社区足够详细，可作为MVP用
