#!/bin/bash

# 清理启动脚本 - 检查3000端口并确保只使用项目的环境变量

set -e

# 检查.env.local是否存在
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local 文件不存在"
    exit 1
fi

# 检查3000端口是否被占用
pids=$(lsof -ti:3000 2>/dev/null || true)
if [ ! -z "$pids" ]; then
    echo "🔍 检测到端口3000被占用，停止现有进程..."
    echo "$pids" | xargs kill -TERM 2>/dev/null || true
    sleep 2
    
    # 如果进程还在运行，强制杀死
    remaining_pids=$(lsof -ti:3000 2>/dev/null || true)
    if [ ! -z "$remaining_pids" ]; then
        echo "🗑️  强制停止进程: $remaining_pids"
        echo "$remaining_pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    echo "✅ 端口3000已清理"
fi

echo "🧹 使用项目环境变量启动..."

# 创建一个干净的环境，只包含必要的系统变量和项目环境变量
env -i \
    PATH="$PATH" \
    HOME="$HOME" \
    USER="$USER" \
    SHELL="$SHELL" \
    PWD="$PWD" \
    TERM="$TERM" \
    $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs) \
    "$@"