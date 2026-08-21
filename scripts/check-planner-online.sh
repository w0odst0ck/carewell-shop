#!/usr/bin/env bash
# check-planner-online.sh — planner.mojin.store 线上巡检（三连：前端/health/意图 API）
# 用法：check-planner-online.sh          # 全绿 exit 0；任一失败 exit 1（可挂 cron/巡检）
# 注：走系统代理（mihomo :7890）访问线上；Cloudflare 边缘可达性即「线上可用」
set -uo pipefail

BASE="https://planner.mojin.store"
export http_proxy="${http_proxy:-http://127.0.0.1:7890}" https_proxy="${https_proxy:-http://127.0.0.1:7890}"
FAILS=()

chk() { # chk <名称> <命令...>
  local name="$1"; shift
  if ! "$@" >/dev/null 2>&1; then FAILS+=("$name"); fi
}

chk "前端(/)"       curl -s -m 20 -o /dev/null -w "%{http_code}" "$BASE/" | grep -q 200
chk "health"        curl -s -m 20 -f "$BASE/health"
chk "意图API"       curl -s -m 30 -X POST "$BASE/commerce/intents" \
                       -H "Content-Type: application/json" \
                       -d '{"shopping_session_id":"online-check","buyer_id":"b","locale":"zh-CN","currency":"CNY","raw_query":"测试"}' \
                       -o /dev/null -w "%{http_code}" | grep -q 200

if [ ${#FAILS[@]} -eq 0 ]; then
  echo "✅ planner.mojin.store 线上正常"
  exit 0
fi
echo "❌ 线上异常项: ${FAILS[*]}"
exit 1
