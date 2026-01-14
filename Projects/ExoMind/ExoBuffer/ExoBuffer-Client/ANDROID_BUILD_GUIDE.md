# ExoBuffer Android 构建指南

## 环境要求

### 1. 安装 Android Studio
- 下载地址: https://developer.android.com/studio
- 安装后启动，确保 SDK 和 NDK 安装完成

### 2. 配置环境变量
```bash
# Windows PowerShell
$env:ANDROID_HOME = "C:\Users\<用户名>\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\<用户名>\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin"

# 验证安装
adb --version
```

### 3. 安装 Rust Android 目标
```bash
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add i686-linux-android
rustup target add x86_64-linux-android
```

## 初始化 Android 项目

在 `ExoBuffer-Client` 目录下执行:

```bash
cd src-tauri
cargo tauri android init
```

这将创建:
- `src-tauri/android/` - Android 原生项目
- `src-tauri/gen/android/` - Gradle 构建文件

## 构建 APK

### 开发调试版本
```bash
cd src-tauri
cargo tauri android dev
```

### 发布版本
```bash
cd src-tauri
cargo tauri android build
```

输出位置: `src-tauri/android/target/release/bundle/apk/`

## 常见问题

### 1. NDK 未安装
在 Android Studio 中: Tools > SDK Manager > SDK Tools
勾选 "NDK (Side by side)" 并安装

### 2. 权限被拒绝
确保 Android 设备已开启 "开发者模式" > "USB 调试"

### 3. Gradle 同步失败
删除 `android/` 目录后重新运行 `cargo tauri android init`

## 当前项目状态

- ✅ tauri.conf.json: 已配置 Android 权限
- ✅ Cargo.toml: 已配置基础依赖
- ⏳ android/: 需要运行 `cargo tauri android init`
- ⏳ Android SDK: 需要用户自行安装
