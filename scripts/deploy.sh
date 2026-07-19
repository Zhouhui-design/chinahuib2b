#!/bin/bash

set -e

MAINTENANCE_NOTICE_ID=""

function create_maintenance_notice {
    echo "📢 创建维护通知..."
    if [ -z "$MAINTENANCE_TITLE" ]; then
        MAINTENANCE_TITLE="系统维护通知"
    fi
    
    if [ -z "$MAINTENANCE_CONTENT" ]; then
        MAINTENANCE_CONTENT="系统即将进行维护更新，请提前保存您的工作。预计维护时长约30分钟。"
    fi
    
    if [ -z "$MAINTENANCE_DURATION" ]; then
        MAINTENANCE_DURATION=30
    fi

    RESULT=$(npm run maintenance create "$MAINTENANCE_TITLE" "$MAINTENANCE_CONTENT" "$MAINTENANCE_DURATION" 2>&1)
    echo "$RESULT"
    
    MAINTENANCE_NOTICE_ID=$(echo "$RESULT" | grep -o 'ID: [a-zA-Z0-9]*' | awk '{print $2}')
    echo "✅ 维护通知创建成功，ID: $MAINTENANCE_NOTICE_ID"
    
    sleep 5
}

function start_maintenance {
    if [ -z "$MAINTENANCE_NOTICE_ID" ]; then
        echo "❌ 未找到维护通知ID"
        return 1
    fi
    
    echo "🔄 开始维护..."
    npm run maintenance start "$MAINTENANCE_NOTICE_ID"
    echo "✅ 维护状态已更新为进行中"
    
    sleep 3
}

function deploy {
    echo "🚀 开始部署..."
    
    echo "1️⃣ 拉取最新代码..."
    git pull origin main
    
    echo "2️⃣ 安装依赖..."
    npm install
    
    echo "3️⃣ 构建项目..."
    npm run build
    
    echo "4️⃣ 重启服务..."
    pm2 restart chinahuib2b || pm2 start npm --name chinahuib2b -- start
    
    echo "✅ 部署完成"
}

function complete_maintenance {
    if [ -z "$MAINTENANCE_NOTICE_ID" ]; then
        echo "❌ 未找到维护通知ID"
        return 1
    fi
    
    UPDATE_CONTENT="系统更新已完成！\n\n更新内容：\n- 修复已知问题\n- 优化系统性能\n- 提升用户体验\n\n感谢您的耐心等待！"
    
    if [ -n "$UPDATE_DETAILS" ]; then
        UPDATE_CONTENT="$UPDATE_DETAILS"
    fi
    
    echo "📤 完成维护并推送更新内容..."
    npm run maintenance complete "$MAINTENANCE_NOTICE_ID" "$UPDATE_CONTENT"
    echo "✅ 维护已完成，更新内容已推送"
}

function show_usage {
    echo "用法:"
    echo "  deploy.sh create <标题> <内容> [时长]"
    echo "  deploy.sh start <通知ID>"
    echo "  deploy.sh run <标题> <内容> [时长]"
    echo "  deploy.sh complete <通知ID> <更新内容>"
    echo "  deploy.sh deploy-only"
    echo ""
    echo "示例:"
    echo "  deploy.sh run '系统更新维护' '系统将进行例行维护更新' 30"
    echo "  deploy.sh complete '通知ID' '更新完成，新增功能X'"
}

case "$1" in
    create)
        MAINTENANCE_TITLE="$2"
        MAINTENANCE_CONTENT="$3"
        MAINTENANCE_DURATION="$4"
        create_maintenance_notice
        ;;
    start)
        MAINTENANCE_NOTICE_ID="$2"
        start_maintenance
        ;;
    complete)
        MAINTENANCE_NOTICE_ID="$2"
        UPDATE_DETAILS="$3"
        complete_maintenance
        ;;
    run)
        MAINTENANCE_TITLE="$2"
        MAINTENANCE_CONTENT="$3"
        MAINTENANCE_DURATION="$4"
        
        echo "======================================"
        echo "        自动化部署流程"
        echo "======================================"
        
        create_maintenance_notice
        start_maintenance
        deploy
        complete_maintenance
        
        echo ""
        echo "🎉 部署流程全部完成！"
        ;;
    deploy-only)
        deploy
        ;;
    *)
        show_usage
        exit 1
        ;;
esac