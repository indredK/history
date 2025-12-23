#!/bin/bash

# Interactive script selector with arrow key navigation
# 中国历史全景项目交互式脚本选择器 (方向键导航)

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Terminal control sequences
CURSOR_UP='\033[1A'
CURSOR_DOWN='\033[1B'
CLEAR_LINE='\033[2K'
SAVE_CURSOR='\033[s'
RESTORE_CURSOR='\033[u'
HIDE_CURSOR='\033[?25l'
SHOW_CURSOR='\033[?25h'

# Script definitions
declare -a SCRIPT_NAMES=(
    "🚀 启动完整开发环境 (前端+后端) / Start Full Dev Environment"
    "🎨 仅启动前端开发服务器 / Frontend Dev Server Only"
    "📦 仅启动后端开发服务器 / Backend Dev Server Only"
    "🔨 构建整个项目 / Build Entire Project"
    "🎨 仅构建前端 / Build Frontend Only"
    "📦 仅构建后端 / Build Backend Only"
    "🚀 启动生产环境后端 / Start Production Backend"
    "👀 预览前端构建结果 / Preview Frontend Build"
    "🔍 检查代码规范 / Lint Code"
    "🔧 自动修复代码规范问题 / Auto Fix Lint Issues"
    "📝 TypeScript 类型检查 / TypeScript Type Check"
    "🌱 填充数据库种子数据 / Seed Database"
    "🔄 重置数据库并填充数据 / Reset Database"
    "🧹 清理所有依赖和构建文件 / Clean All"
    "🔄 清理并重新安装所有依赖 / Clean & Reinstall"
    "📦 安装所有依赖 / Install All Dependencies"
    "✅ 验证部署状态 / Verify Deployment"
    "🚪 退出 / Exit"
)

declare -a SCRIPT_COMMANDS=(
    "bun run dev:full"
    "bun run dev:frontend"
    "bun run dev:backend"
    "bun run build"
    "bun run build:frontend"
    "bun run build:backend"
    "bun run start:prod"
    "bun run preview"
    "bun run lint"
    "bun run lint:fix"
    "bun run type-check"
    "bun run db:seed"
    "bun run db:reset"
    "bun run clean"
    "bun run clean:install"
    "bun run install:all"
    "./scripts/verify-deploy.sh"
    "exit"
)

declare -a SCRIPT_COLORS=(
    "$GREEN"
    "$GREEN"
    "$GREEN"
    "$BLUE"
    "$BLUE"
    "$BLUE"
    "$PURPLE"
    "$PURPLE"
    "$CYAN"
    "$CYAN"
    "$CYAN"
    "$YELLOW"
    "$YELLOW"
    "$RED"
    "$RED"
    "$RED"
    "$GREEN"
    "$RED"
)

# Global variables
CURRENT_SELECTION=0
TOTAL_OPTIONS=${#SCRIPT_NAMES[@]}

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}"
}

# Function to print header
print_header() {
    clear
    echo ""
    print_color $CYAN "🏛️  中国历史全景项目 - 脚本选择器"
    echo ""
    print_color $CYAN "   Chinese Historical Panorama - Script Selector"
    echo ""
    echo ""
    print_color $WHITE "使用 ↑↓ 方向键选择，Enter 确认，q 退出"
    echo ""
    print_color $WHITE "Use ↑↓ arrow keys to select, Enter to confirm, q to quit"
    echo ""
    echo ""
}

# Function to draw menu
draw_menu() {
    local start_line=$1
    
    for i in "${!SCRIPT_NAMES[@]}"; do
        if [ $i -eq $CURRENT_SELECTION ]; then
            # Highlighted selection
            print_color $WHITE "  ▶ "
            print_color "${SCRIPT_COLORS[$i]}" "${SCRIPT_NAMES[$i]}"
            print_color $WHITE " ◀"
        else
            # Normal option
            print_color $WHITE "    "
            print_color "${SCRIPT_COLORS[$i]}" "${SCRIPT_NAMES[$i]}"
        fi
        echo ""
    done
}

# Function to handle key input
read_key() {
    local key
    read -rsn1 key
    
    case $key in
        $'\x1b')  # ESC sequence
            read -rsn2 key
            case $key in
                '[A') echo "UP" ;;
                '[B') echo "DOWN" ;;
                *) echo "OTHER" ;;
            esac
            ;;
        '') echo "ENTER" ;;  # Enter key
        'q'|'Q') echo "QUIT" ;;
        *) echo "OTHER" ;;
    esac
}

# Function to move cursor up
move_up() {
    if [ $CURRENT_SELECTION -gt 0 ]; then
        CURRENT_SELECTION=$((CURRENT_SELECTION - 1))
    else
        CURRENT_SELECTION=$((TOTAL_OPTIONS - 1))
    fi
}

# Function to move cursor down
move_down() {
    if [ $CURRENT_SELECTION -lt $((TOTAL_OPTIONS - 1)) ]; then
        CURRENT_SELECTION=$((CURRENT_SELECTION + 1))
    else
        CURRENT_SELECTION=0
    fi
}

# Function to execute selected script
execute_script() {
    local selection=$1
    local command="${SCRIPT_COMMANDS[$selection]}"
    
    printf "${SHOW_CURSOR}"
    clear
    
    if [ "$command" = "exit" ]; then
        print_color $RED "👋 再见! / Goodbye!"
        echo ""
        exit 0
    fi
    
    print_color $GREEN "执行中 / Executing: "
    print_color $WHITE "$command"
    echo ""
    echo ""
    
    # Execute the command
    if eval "$command"; then
        echo ""
        print_color $GREEN "✅ 脚本执行完成! / Script completed successfully!"
    else
        echo ""
        print_color $RED "❌ 脚本执行失败! / Script execution failed!"
    fi
    
    echo ""
    print_color $YELLOW "按任意键继续... / Press any key to continue..."
    read -rsn1
}

# Function to cleanup on exit
cleanup() {
    printf "${SHOW_CURSOR}"
    clear
    print_color $RED "👋 再见! / Goodbye!"
    echo ""
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Main function
main() {
    printf "${HIDE_CURSOR}"
    
    while true; do
        print_header
        draw_menu
        
        key=$(read_key)
        
        case $key in
            "UP")
                move_up
                ;;
            "DOWN")
                move_down
                ;;
            "ENTER")
                execute_script $CURRENT_SELECTION
                ;;
            "QUIT")
                cleanup
                ;;
        esac
    done
}

# Run main function
main