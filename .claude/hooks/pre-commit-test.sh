#!/bin/bash
# PreToolUse hook: 在 git commit 前运行单元测试
# exit 0 = 放行, exit 2 = 拦截

set -o pipefail
cd /Users/renlong/每日开销

OUTPUT=$(npx vitest run --reporter=verbose 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  # 测试失败 → 阻止提交
  printf '{"hookSpecificOutput":{"permissionDecision":"deny"},"systemMessage":"❌ 单元测试未通过，commit 被拦截。请修复测试后重试。"}'
  echo "$OUTPUT" >&2
  exit 2
fi

# 测试通过 → 放行
echo "$OUTPUT"
exit 0
