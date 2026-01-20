# 技术选型 @Argon

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

GitHub库：<https://github.com/fsdwen/ts-emits>

❗生态：难以被搜索，仓库两年未维护，无社区（1 star）

- 但同行衬托：
    - [ts-bus](https://github.com/ryardley/ts-bus)（六年未维护，star 140）
    - [mitt](https://github.com/developit/mitt)（更轻量，但三年未维护，star 11.8k）

上边这俩都没中文文档，对TypeScript支持程度也参差不齐
