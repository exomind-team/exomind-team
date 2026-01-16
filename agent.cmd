@REM claude 快速启动agent

@echo off

chcp 65001 >nul

if "%~1"=="" (
    echo 用法: agent ^<系统提示词文件^>
    echo 示例: agent h:\path\to\agent.md
    pause
    exit /b 1
)

claude --dangerously-skip-permissions --system-prompt-file "%~1"
