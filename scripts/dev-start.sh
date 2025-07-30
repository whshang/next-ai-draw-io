#!/bin/bash

# 智能开发启动脚本 - 根据环境选择合适的启动方式

set -e

# 检测是否在CI/部署环境中
if [ "$CI" = "true" ] || [ "$VERCEL" = "1" ] || [ "$NODE_ENV" = "production" ]; then
    echo "🚀 检测到部署环境，使用标准启动方式..."
    exec "$@"
    exit 0
fi

# 本地开发环境的处理
echo "🏠 本地开发环境检测..."

# 检查.env.local是否存在
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local 文件不存在，使用系统环境变量..."
    exec "$@"
    exit 0
fi

# 检查3000端口是否被占用（仅在开发模式下）
if [[ "$*" == *"dev"* ]]; then
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
fi

echo "🧹 使用项目环境变量启动..."

# 创建一个干净的环境，优先使用.env.local，然后是系统环境变量
env -i \
    PATH="$PATH" \
    HOME="$HOME" \
    USER="$USER" \
    SHELL="$SHELL" \
    PWD="$PWD" \
    TERM="$TERM" \
    NODE_ENV="${NODE_ENV:-development}" \
    $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs) \
    "$@"