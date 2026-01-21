# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: ExoMind-Team

**ExoMind Team Vault** - Team collaborative knowledge base for ExoMind project. This is a Git submodule that integrates into the personal vault (ExoMind-Obsidian-HailayLin).

### Core Purpose
- Team collaboration assets (projects, meetings, logs)
- Shared knowledge沉淀 (architecture, technical designs)
- Collective project development

---

## Directory Structure

```
ExoMind-Team/
├── Projects/                    # Team projects core directory
│   ├── ExoMind/                 # ExoMind 外心系统主项目
│   │   ├── 架构设计-*.md         # Architecture design docs
│   │   ├── 需求规格说明书-*.md    # SRS (Software Requirements Spec)
│   │   ├── MVP需求文档.md        # MVP requirements
│   │   ├── ExoBuffer/           # ← Submodule: ExoBuffer-Connector
│   │   └── whitepaper/          # Whitepaper
│   ├── ExoBuffer/               # ExoBuffer buffer project
│   │   ├── README.md            # Project overview
│   │   ├── AGENTS.md            # Agent instructions
│   │   ├── GEMINI.md            # Gemini CLI guidance
│   │   ├── scout_converter.py   # Core protein script
│   │   ├── xhs-scraper/         # Xiaohongshu scraper module
│   │   ├── 10-exobuffer-3review-opus/  # Opus review agent
│   │   ├── Scout测试案例/        # Scout test cases
│   │   └── ExoBuffer项目日志.md  # Project log
│   ├── obsidian-exomind-timer/  # Obsidian timer plugin (submodule)
│   │   ├── src/                 # TypeScript source
│   │   ├── styles/              # CSS styles
│   │   ├── manifest.json        # Plugin manifest
│   │   ├── package.json         # npm package config
│   │   └── README.md
│   ├── AGI-Car-V3/              # Hardware project (K230/ESP32s3)
│   ├── 计算机生命/               # Computer Life project
│   ├── NARS/                    # NARS cognitive architecture
│   └── Multi-Agent-CLI-Manager-Research/
├── Meetings/                    # Meeting records
│   ├── 2026-01-15 下午讨论图集/   # Design discussion gallery
│   ├── 内部会议/                 # Internal meetings
│   └── 组会与汇报/               # Team meetings & reports
├── Logs/                        # Team project logs
├── agents/                      # Team agents (Claude Code skills)
│   ├── 01-时间块整理/            # Time block organizer
│   ├── 02-集体劳动提交/           # Team contribution submitter
│   └── 12-录音整理提示词/         # Audio transcription prompts
├── .gitmodules                  # Nested submodules
└── README.md
```

---

## Git Submodules

| Submodule | Path | Remote | Purpose |
|-----------|------|--------|---------|
| **ExoBuffer-Connector** | `Projects/ExoMind/ExoBuffer/ExoBuffer-Connector` | `exomind-team/ExoBuffer-Connector` | Message queue connector |
| **obsidian-exomind-timer** | `Projects/obsidian-exomind-timer` | `exomind-team/obsidian-exomind-timer` | Obsidian timer plugin |

### Working with Submodules
```bash
# Update all submodules
git submodule update --init --recursive

# Update specific submodule
cd Projects/ExoMind/ExoBuffer/ExoBuffer-Connector
git pull origin main

# Commit submodule changes in parent repo
cd /path/to/parent/repo
git add ExoMind-Team
git commit -m "chore: update ExoMind-Team submodule"
```

---

## Key Projects

### ExoBuffer (Active Development)
External buffer system for Scout agent. Core files:
- `scout_converter.py` - Protein script for information extraction
- `xhs-scraper/` - Xiaohongshu (小红书) content scraper
- `ExoBuffer项目日志.md` - Development log

### obsidian-exomind-timer (Plugin Development)
Obsidian plugin for time tracking. Tech stack:
- TypeScript + esbuild + Vitest
- See `README.md` for dev commands

### ExoMind (Architecture Design)
Main system architecture with SRS documents:
- `架构设计-20260120.md` - Latest architecture
- `需求规格说明书-SRS-01~04.md` - Detailed requirements
- `MVP需求文档.md` - Minimum viable product

---

## Team Workflow

### For Personal Vault Integration
1. Push changes to this repo's remote
2. Personal vault runs `git submodule update` to sync
3. Or `cd ExoMind-Team && git pull` directly

### Collaboration Rules
- **No personal content**: Don't commit personal notes here
- **Use wikilinks**: `[[wikilink]]` for cross-vault references
- **Update submodules**: Before commit, check submodule status
- **Atomic commits**: Clear messages with Co-Authored-By for AI work

---

## Development Tools

### Claude Code Skills (agents/)
Each agent directory contains skill files for team operations:
- Time block organization
- Meeting transcription
- Team contribution tracking

### External Tools Referenced
- **LeanSpec**: Specification management (used in parent vault)
- **MiniMax API**: Used for ExoBuffer processing
- **Gemini CLI**: Alternative AI processing (see `GEMINI.md`)

---

## Important Links

- Team repo: https://github.com/exomind-team/exomind-team
- Obsidian Timer Plugin: https://github.com/exomind-team/obsidian-exomind-timer
- ExoBuffer Connector: https://github.com/exomind-team/ExoBuffer-Connector

---

## Safety Notes

- This is a collaborative vault, not a personal one
- Changes here affect all team members
- Test in personal vault before pushing to team remote
