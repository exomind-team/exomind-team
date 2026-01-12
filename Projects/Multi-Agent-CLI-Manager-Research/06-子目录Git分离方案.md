# Obsidian 库子目录独立 Git 仓库方案

> 文档版本：v1.0
> 创建日期：2026年1月9日

## 一、需求背景

### 1.1 问题描述

你的 Obsidian Vault 是一个大型单仓库：
```
Obsidian Vault/
├── 10-Projects/           # 需要独立的 ExoMind 项目
├── 20-Areas/              # 个人笔记
├── OneNote/               # 历史迁移笔记
└── ...
```

需求：
- 将 `10-Projects/ExoMind/` 提取为独立 Git 仓库
- 同时保留在主仓库中的引用（类似 submodule）
- 保持版本控制历史

### 1.2 适用场景

| 场景 | 推荐方案 |
|-----|---------|
| 项目需要独立版本发布 | 完全分离 |
| 项目需要独立 CI/CD | 完全分离 |
| 项目需要多人协作 | 完全分离 |
| 项目有独立生命周期 | 完全分离 |
| 只需独立管理，但不想分裂仓库 | git subtree |

---

## 二、方案对比

### 2.1 方案对比表

| 方案 | 优点 | 缺点 | 推荐场景 |
|-----|------|-----|---------|
| **git filter-repo** | 历史干净、独立彻底 | 不可逆、需要重写历史 | 永久分离 |
| **git subtree** | 简单、保持单仓库 | 历史不独立、复杂操作 | 临时/部分分离 |
| **git submodule** | 明确依赖、版本锁定 | 复杂性高、维护成本高 | 依赖管理 |
| **手动复制** | 简单直接 | 丢失历史 | 不推荐 |

### 2.2 推荐方案

针对你的场景，**推荐使用 `git filter-repo`**：
- 完全独立，可自由开发
- 历史完整保留
- 可建立双向同步（如需要）

---

## 三、实施步骤（git filter-repo）

### 3.1 准备工作

```bash
# 1. 备份整个仓库（重要！）
cd D:/Obsidian\ Vault
git bundle create obsidian-vault-backup.bundle --all

# 2. 安装 filter-repo（需要 Python）
pip install git-filter-repo

# 3. 确认当前目录结构
ls -la 10-Projects/ExoMind/
```

### 3.2 方案一：完全分离（推荐）

```bash
# 进入仓库
cd D:/Obsidian\ Vault

# 创建独立仓库（保留历史）
git filter-repo --path 10-Projects/ExoMind/ --force

# 此时当前目录变成了 ExoMind 的独立仓库
# 需要重新初始化主仓库

# 重新克隆主仓库（干净的历史）
cd ..
git clone obsidian-vault-backup.bundle obsidian-vault-main --strip-prefix

# 进入主仓库，添加 ExoMind 为 submodule
cd obsidian-vault-main
git submodule add https://github.com/你的用户名/exomind.git 10-Projects/ExoMind
```

### 3.3 方案二：保留工作树（不重写历史）

```bash
# 仅仅复制文件，不改变原仓库
cd D:/Obsidian\ Vault

# 创建新仓库
mkdir -p /tmp/exomind-repo
cd /tmp/exomind-repo
git init

# 复制文件（带历史）
git filter-repo --source . --path 10-Projects/ExoMind/ --force
# 注意：这会在 /tmp/exomind-repo 中创建 ExoMind 仓库

# 添加 remote 并推送
git remote add origin https://github.com/你的用户名/exomind.git
git push -u origin main
```

### 3.4 方案三：git subtree（更温和）

```bash
# 在主仓库中添加 remote
cd D:/Obsidian\ Vault
git remote add exomind-remote https://github.com/你的用户名/exomind.git

# 提取子树
git subtree split --prefix=10-Projects/ExoMind -b exomind-split

# 推送到新仓库
git push exomind-remote exomind-split:main --force

# 清理
git branch -D exomind-split
```

---

## 四、完整操作流程（推荐方案）

### 4.1 第一步：备份

```powershell
# PowerShell（Windows）
cd D:\
# 复制整个 vault 为备份
Copy-Item "Obsidian Vault" "Obsidian Vault Backup" -Recurse

# 或使用 git bundle
cd D:/Obsidian\ Vault
git bundle create backup.bundle --all
```

### 4.2 第二步：创建独立仓库

```bash
# 在 Windows WSL 或 Git Bash 中执行
cd /d/Obsidian\ Vault

# 使用 filter-repo 提取
git filter-repo --path 10-Projects/ExoMind/ --force

# 验证提取结果
git log --oneline
# 应该只看到 ExoMind 相关的提交

# 创建 GitHub 仓库并推送
gh repo create exomind --public --source=. --push
# 或手动：
git remote add origin https://github.com/你的用户名/exomind.git
git push -u origin main
```

### 4.3 第三步：重建主仓库

```bash
# 回到上级目录
cd ..

# 重新克隆主仓库（干净版本）
git clone backup.bundle obsidian-vault-new
cd obsidian-vault-new

# 移除 ExoMind 目录（已被分离）
rm -rf 10-Projects/ExoMind
git add .
git commit -m "chore: 移除 ExoMind 目录（已独立为 submodule）"

# 添加 ExoMind 为 submodule
git submodule add https://github.com/你的用户名/exomind.git 10-Projects/ExoMind
git commit -m "chore: 添加 ExoMind submodule"

# 推送到远程
git push origin main
```

### 4.4 第四步：验证设置

```bash
# 验证 submodule
git submodule status
# 应该显示：<hash> 10-Projects/ExoMind (remotes/origin/main)

# 更新 submodule
git submodule update --init --recursive
```

---

## 五、同步策略

### 5.1 独立开发模式

如果 ExoMind 独立开发后不需要频繁同步到主仓库：

```bash
# 在主仓库中
cd 10-Projects/ExoMind
git fetch origin
git merge origin/main  # 或 rebase
```

### 5.2 双向同步模式

如果需要保持同步（谨慎使用）：

```bash
# 在 ExoMind 独立仓库中
# 添加主仓库为 remote
git remote add main ../obsidian-vault-main
git fetch main

# 同步特定目录
git merge main -- 10-Projects/ExoMind/
```

### 5.3 使用 GitHub Actions 自动同步

创建 `.github/workflows/sync.yml`：

```yaml
name: Sync to Main Vault
on:
  push:
    branches: [main]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: 你的用户名/obsidian-vault
          token: ${{ secrets.PAT }}

      - name: Pull latest main
        run: |
          git pull origin main
          git submodule update --init --recursive

      - name: Push to main vault
        run: |
          git config --global user.name "GitHub Actions"
          git config --global user.email "actions@github.com"
          git add .
          git commit -m "sync: 更新 submodule $(git rev-parse HEAD:10-Projects/ExoMind)"
          git push
```

---

## 六、文件结构变化

### 6.1 分离前

```
Obsidian Vault/                    # 主仓库
├── 10-Projects/
│   └── ExoMind/                   # ExoMind 项目
│       ├── ExoBuffer/
│       ├── implementation/
│       └── whitepaper/
├── 20-Areas/
└── OneNote/
```

### 6.2 分离后（Submodule 模式）

```
obsidian-vault-main/               # 主仓库
├── 10-Projects/
│   └── ExoMind/                   # Submodule
│       ├── ExoBuffer/             # 链接到 exomind 仓库
│       ├── implementation/
│       └── whitepaper/
├── 20-Areas/
└── OneNote/

exomind/                           # 独立仓库
├── ExoBuffer/
├── implementation/
└── whitepaper/
```

### 6.3 分离后（完全独立模式）

```
obsidian-vault-main/               # 主仓库
├── 10-Projects/
│   └── ExoMind -> ../exomind/     # 符号链接 或
│       # 或完全移除此目录
├── 20-Areas/
└── OneNote/

exomind/                           # 独立仓库
├── ExoBuffer/
├── implementation/
└── whitepaper/
```

---

## 七、注意事项

### 7.1 风险提示

| 风险 | 应对措施 |
|-----|---------|
| 历史丢失 | 备份！备份！备份！ |
| 远程仓库冲突 | 先在 GitHub 创建空仓库 |
| submodule 更新问题 | 定期 `git submodule update` |
| 路径变更导致的问题 | 更新所有引用路径 |

### 7.2 常见问题

**Q: 会丢失提交历史吗？**
A: 使用 `filter-repo` 不会丢失，但会重写 commit hash。建议先备份。

**Q: 可以恢复吗？**
A: 只有备份可以恢复。分离操作是不可逆的。

**Q: Windows 上能用吗？**
A: `filter-repo` 在 Windows 上需要 WSL 或 Git Bash。建议在 WSL 中执行。

**Q: GitHub Actions 还能用吗？**
A: 需要更新 Actions 中的路径引用。

---

## 八、推荐配置

### 8.1 主仓库 `.gitmodules`

```ini
[submodule "10-Projects/ExoMind"]
    path = 10-Projects/ExoMind
    url = https://github.com/你的用户名/exomind.git
    branch = main
```

### 8.2 ExoMind 仓库 `.git/config`

```ini
[remote "origin"]
    url = https://github.com/你的用户名/exomind.git
    fetch = +refs/heads/*:refs/remotes/origin/*
```

---

## 九、下一步建议

1. **评估分离必要性**
   - ExoMind 是否需要独立发布版本？
   - 是否需要独立 CI/CD？
   - 是否需要多人协作？

2. **选择方案**
   - 长期独立 → `filter-repo`
   - 临时测试 → `subtree`
   - 保持单仓库 → 不分离

3. **执行分离**
   - 备份
   - 执行分离
   - 验证功能
   - 更新工作流

---

**文档作者**：Claude Code
**文档版本**：v1.0
**最后更新**：2026年1月9日
