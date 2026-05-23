#!/bin/bash

# 文档整理脚本
# 用途：将根目录的 Markdown 文件移动到合适的子目录

set -e

echo "📁 开始整理 ChinaHuiB2B 项目文档..."

# 确保目录存在
mkdir -p docs/{archive/2026-Q2,guides,reports,specs,deployment,features}

# 定义移动规则
move_to_guides() {
    local files=("$@")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            mv "$file" docs/guides/
            echo "  ✅ 移动指南: $file → docs/guides/"
        fi
    done
}

move_to_reports() {
    local files=("$@")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            mv "$file" docs/reports/
            echo "  ✅ 移动报告: $file → docs/reports/"
        fi
    done
}

move_to_specs() {
    local files=("$@")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            mv "$file" docs/specs/
            echo "  ✅ 移动规范: $file → docs/specs/"
        fi
    done
}

move_to_deployment() {
    local files=("$@")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            mv "$file" docs/deployment/
            echo "  ✅ 移动部署文档: $file → docs/deployment/"
        fi
    done
}

move_to_features() {
    local files=("$@")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            mv "$file" docs/features/
            echo "  ✅ 移动功能文档: $file → docs/features/"
        fi
    done
}

move_to_archive() {
    local files=("$@")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            mv "$file" docs/archive/2026-Q2/
            echo "  📦 归档: $file → docs/archive/2026-Q2/"
        fi
    done
}

echo ""
echo "📋 分类移动文档..."
echo ""

# 指南类文档
echo "📖 移动指南文档..."
move_to_guides \
    "AI_EXHIBITION_MANAGER_GUIDE.md" \
    "MONITORING_GUIDE.md" \
    "HOW_TO_ASSIGN_TASK_TO_OPENCLAW.md" \
    "SELLER_PORTAL_IMPLEMENTATION.md" \
    "COMPLETE_PRODUCT_MANAGEMENT.md" \
    "MIGRATION_TO_SPACES.md" \
    "PERFORMANCE_MONITORING_SETUP.md" \
    "AI_CHAT_INTEGRATION_SPEC.md" \
    "SELLER_DASHBOARD_I18N_PROGRESS.md" \
    "QUICKSTART.md" \
    "DEPLOYMENT.md" \
    "DEPLOYMENT_CHECKLIST.md" \
    "PRODUCTION_DEPLOYMENT_GUIDE.md" \
    "QUICK_DEPLOY.md" \
    "CICD_GUIDE.md" \
    "TESTING_GUIDE.md" \
    "SECURITY_GUIDE.md" \
    "RATE_LIMITING_GUIDE.md" \
    "REDIS_CACHE_GUIDE.md" \
    "DATABASE_OPTIMIZATION_GUIDE.md" \
    "FRONTEND_PERFORMANCE_GUIDE.md" \
    "MULTILANGUAGE_GUIDE.md" \
    "I18N_IMPLEMENTATION.md" \
    "PAYMENT_SYSTEM_GUIDE.md" \
    "FILE_UPLOAD_GUIDE.md" \
    "CONTACT_INFO_QUICK_START.md" \
    "AI_AGENT_QUICKSTART.md" \
    "PHASE4_QUICK_START.md" \
    "SITEMAP_SUBMISSION_GUIDE.md" \
    "CLEAR_CDN_CACHE_GUIDE.md" \
    "MANUAL_CLOUDFLARE_SETUP.md" \
    "DNS_FIX_GUIDE.md" \
    "QUICK_FIX.md" \
    "FIX_DNS_NOW.md" \
    "CDN_STATUS_AND_NEXT_STEPS.md" \
    "CLOUDFLARE_CDN_SETUP.md" \
    "CLOUDFLARE_QUICK_FIX.md" \
    "NETWORK_SPLIT_GUIDE.md" \
    "ADMIN_CREDENTIALS.md" \
    "README_AI_FEATURES.md" \
    "AI_RULES.md"

# 报告类文档
echo ""
echo "📊 移动报告文档..."
move_to_reports \
    "BACKUP_CLEANUP_REPORT.md" \
    "FINAL_OPTIMIZATION_REPORT.md" \
    "PHASE4_COMPREHENSIVE_REPORT.md" \
    "SEO_CONFIGURATION_VERIFIED.md" \
    "OPTIMIZATION_PROGRESS_DAY1.md" \
    "OPTIMIZATION_PROGRESS_REPORT.md" \
    "COMPLETION_REPORT.md" \
    "FINAL_COMPLETION_REPORT.md" \
    "PROJECT_COMPLETION_SUMMARY.md" \
    "PROJECT_STATUS.md" \
    "DEPLOYMENT_STATUS.md" \
    "DEPLOYMENT_STATUS_REPORT.md" \
    "DEPLOYMENT_STATUS_SUMMARY.md" \
    "SERVER_STATUS_REPORT.md" \
    "SERVER_OPTIMIZATION_STATUS.md" \
    "ENVIRONMENT_CHECK_REPORT.md" \
    "ENVIRONMENT_CHECK_UPDATE.md" \
    "OPENCLAW_FIX_REPORT.md" \
    "SELLER_PORTAL_FIX_REPORT.md" \
    "BUGFIX_SELLER_DASHBOARD_404.md" \
    "BUGFIX_SELLER_SETTINGS_404.md" \
    "SELLER_SETTINGS_PERSISTENCE_FIX.md" \
    "CDN_DIAGNOSIS_AND_FIX.md" \
    "PHASE1_COMPLETION_REPORT.md" \
    "PHASE2_FINAL_REPORT.md" \
    "PHASE2_PROGRESS_REPORT.md" \
    "PHASE3_COMPLETION_REPORT.md" \
    "PHASE3_FINAL_COMPLETION.md" \
    "PHASE3_PROGRESS_REPORT.md" \
    "PHASE4_FINAL_REPORT.md" \
    "PHASE4_PROGRESS_REPORT.md" \
    "PHASE5_AI_SYSTEM_100_PERCENT_COMPLETE.md" \
    "PRODUCTION_DEPLOYMENT_REPORT.md" \
    "UNIT_TESTS_COMPLETION_REPORT.md" \
    "AI_AGENT_SIMULATION_TEST_REPORT.md" \
    "AI_CRAWLER_COMPLETION_REPORT.md"

# 规范类文档
echo ""
echo "📐 移动规范文档..."
move_to_specs \
    "AI_BUSINESS_ASSISTANT_SPEC.md" \
    "AI_CHAT_HOSTING_SPEC.md" \
    "AI_FULL_PARTICIPATION_SPEC.md" \
    "AI_HUMAN_UNIFIED_IDENTITY_SYSTEM.md" \
    "CHINAHUIB2B_AI_FIRST_OPTIMIZATION_PLAN.md" \
    "COMPREHENSIVE_OPTIMIZATION_PLAN.md" \
    "DEEP_OPTIMIZATION_PLAN.md" \
    "OPTIMIZATION_PHASE2_PLAN.md" \
    "AI_FIRST_OPTIMIZATION_TASKS.md" \
    "AI_IMPLEMENTATION_PROGRESS.md" \
    "TASKS_FOR_OPENCLAW.md" \
    "TASKS_FOR_OPENCLAW_FINAL.md" \
    "TASK_FOR_OPENCLAW.md" \
    "TASK_FOR_OPENCLAW_ENABLE_CDN.md" \
    "MESSAGE_TO_OPENCLAW.md" \
    "OPENCLAW_TASK_BRIEF.md" \
    "OPENCLAW_TASK_LIST.md" \
    "AI_SEO_TASK_DIVISION.md" \
    "MULTI_PLATFORM_AI_SEO_PLAN.md" \
    "AI_SEO_IMPLEMENTATION_GUIDE.md" \
    "AI_SEO_DEPLOYMENT_SUCCESS.md"

# 部署相关
echo ""
echo "🚀 移动部署文档..."
move_to_deployment \
    "DEPLOYMENT_DEV_MODE.md" \
    "TODAY_QUICK_WINS.md" \
    "FINAL_ACTION_GUIDE.md" \
    "FIX_COMPLETED_2026-05-21.md" \
    "DEPLOYMENT_COMPLETE_2026-05-21.md" \
    "CLOUDFLARE_DEPLOYMENT_STATUS.md"

# 功能特性文档
echo ""
echo "✨ 移动功能文档..."
move_to_features \
    "SELLER_DASHBOARD_ENHANCEMENTS.md" \
    "STORE_PROFILE_COMPLETE.md" \
    "STORE_PAGE_COMPLETE.md" \
    "PRODUCT_API_COMPLETE.md" \
    "PRODUCT_FORMS_COMPLETE.md" \
    "FILE_UPLOAD_COMPLETE.md" \
    "CHAT_INTEGRATION_COMPLETE.md" \
    "CHAT_INTEGRATION_GUIDE.md" \
    "CHAT_SYSTEM_SECURITY.md" \
    "CHAT_AI_BLOCKING_COMPLETE.md" \
    "CONTACT_INFO_FEATURE_COMPLETE.md" \
    "ANNOUNCEMENT_AND_DISCLAIMER_COMPLETE.md" \
    "BROCHURE_MANAGER_COMPLETE.md" \
    "AI_RECOMMENDATION_COMPLETE.md" \
    "AI_RECOMMENDATION_INTEGRATION_GUIDE.md" \
    "AI_BUSINESS_ASSISTANT_COMPLETE.md" \
    "AI_AGENT_INTEGRATION_GUIDE.md" \
    "AI_AGENT_DEVELOPER_GUIDE.md" \
    "AI_AGENT_PLATFORM_DEPLOYMENT_COMPLETE.md" \
    "AI_AGENT_PLATFORM_FINAL_ENHANCEMENT.md" \
    "AI_AGENT_PLATFORM_STRATEGIC_RELEASE.md" \
    "AI_CRAWLER_OPTIMIZATION.md" \
    "AI_FULL_PARTICIPATION_TODO.md" \
    "ISR_EXTENSION_COMPLETION.md" \
    "ISR_OPTIMIZATION_REPORT.md" \
    "SELLER_DASHBOARD_GLOBAL_I18N.md" \
    "SELLER_DASHBOARD_I18N_COMPLETE.md" \
    "SELLER_DASHBOARD_I18N_FIX.md" \
    "USER_MENU_AND_SELLER_DASHBOARD_I18N.md" \
    "LOGIN_PAGE_MULTILINGUAL_UPDATE.md" \
    "I18N_COMPLETION_GUIDE.md" \
    "SEO_TDK_SETUP_COMPLETE.md" \
    "ALIPAY_PAYMENT_INTEGRATION.md" \
    "AB_TESTING_GUIDE.md" \
    "LOCAL_STORAGE_IMPLEMENTATION.md" \
    "NETWORK_CONFIG_COMPLETE.md" \
    "SELLER_PORTAL_GLOBAL_FIX.md" \
    "SELLER_DASHBOARD_PROGRESS.md" \
    "PROGRESS_UPDATE_SESSION2.md" \
    "PHASE2_DAY1_DAY2_COMPLETION.md" \
    "PHASE2_DAY3_COMPLETION.md" \
    "PHASE4_100_PERCENT_COMPLETE.md" \
    "FINAL_SUMMARY.md" \
    "AGENTS.md" \
    "CLAUDE.md" \
    "UPLOAD-PAYMENT-PROOF.sh" \
    "setup-network-split.sh" \
    "setup-spaces-helper.sh" \
    "setup-uploads-dir.sh" \
    "create-admin.sh" \
    "deploy-dev-mode.sh" \
    "deploy-payment.sh" \
    "deploy-prepare-server.sh" \
    "deploy-quick.sh" \
    "deploy-seller-enhancements.sh" \
    "deploy-seo.sh" \
    "deploy-tdk-admin.sh" \
    "quick-start.sh" \
    "test-local.sh" \
    "check-dns-and-server.sh" \
    "clean-old-backups.sh" \
    "clear-cdn-cache.sh" \
    "purge-cdn-cache.sh" \
    "quick-fix.sh" \
    "upload-payment-proof.sh" \
    "backup-script.sh"

# 剩余的所有其他 .md 文件归档
echo ""
echo "📦 归档剩余文档..."
find . -maxdepth 1 -name "*.md" \
    -not -name "README.md" \
    -not -name "INSPECTION_AND_OPTIMIZATION_REPORT.md" \
    -type f | while read file; do
    filename=$(basename "$file")
    mv "$file" docs/archive/2026-Q2/
    echo "  📦 归档: $filename → docs/archive/2026-Q2/"
done

echo ""
echo "✅ 文档整理完成！"
echo ""
echo "📊 统计信息："
echo "  - 指南文档: $(ls docs/guides/ 2>/dev/null | wc -l) 个"
echo "  - 报告文档: $(ls docs/reports/ 2>/dev/null | wc -l) 个"
echo "  - 规范文档: $(ls docs/specs/ 2>/dev/null | wc -l) 个"
echo "  - 部署文档: $(ls docs/deployment/ 2>/dev/null | wc -l) 个"
echo "  - 功能文档: $(ls docs/features/ 2>/dev/null | wc -l) 个"
echo "  - 归档文档: $(ls docs/archive/2026-Q2/ 2>/dev/null | wc -l) 个"
echo ""
echo "💡 提示："
echo "  - 查看指南: ls docs/guides/"
echo "  - 查看报告: ls docs/reports/"
echo "  - 查看规范: ls docs/specs/"
echo "  - 根目录保留: README.md, INSPECTION_AND_OPTIMIZATION_REPORT.md"
