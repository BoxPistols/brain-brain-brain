#!/bin/bash
# main ブランチへの直接 push をブロックする PreToolUse Hook
# exit 2 = ブロック, exit 0 = 許可

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qE 'git push.*(origin )?(main|master)'; then
  echo "main への直接 push はブロックされました。ブランチを作成して PR 経由でマージしてください。" >&2
  exit 2
fi

exit 0
