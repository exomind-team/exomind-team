# ExoBuffer Client

ExoBuffer 客户端应用，支持 Android、Windows 和 Web 平台。

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **桌面/移动端**: Tauri 2.0 (Rust)
- **实时通信**: Server-Sent Events (SSE)

## 项目结构

```
exobuffer-client/
├── src/
│   ├── api/           # API 客户端和类型定义
│   ├── components/    # React 组件
│   ├── hooks/         # 自定义 Hooks (useSSE)
│   ├── App.tsx        # 主应用组件
│   └── main.tsx       # 入口文件
├── src-tauri/         # Tauri 后端 (Rust)
│   ├── src/           # Rust 源码
│   └── tauri.conf.json
├── index.html
├── vite.config.ts
└── tailwind.config.js
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 安装 Tauri CLI

```bash
cargo install tauri-cli
```

### 3. 开发模式

**Web 开发 (推荐先运行)**:
```bash
npm run dev
```

**Tauri 桌面开发**:
```bash
npm run dev:tauri
```

### 4. 构建发布

**构建 Web 版本**:
```bash
npm run build:web
# 输出到 dist/ 目录
```

**构建 Windows 安装包**:
```bash
npm run build:windows
# 输出到 src-tauri/target/release/bundle/
```

**构建 Android APK**:
```bash
npm run build:android
# 需要 Android Studio 和 NDK
# 输出到 src-tauri/target/release/apk/
```

## 配置

### API 地址

在 `.env` 文件中配置 ExoBuffer Connector 地址:

```
VITE_API_URL=http://localhost:3000
```

### Tauri 权限

编辑 `src-tauri/capabilities/` 下的配置文件来调整权限。

## 功能特性

- [x] 实时消息接收 (SSE)
- [x] 消息发送
- [x] 回复消息
- [x] 移动端自适应
- [x] 深色/浅色主题
- [x] 连接状态显示

## 环境要求

- Node.js 18+
- Rust 1.70+
- cargo (Rust 包管理器)
- Android Studio (Android 构建)
- Visual Studio Build Tools (Windows 构建)

## 许可证

MIT
