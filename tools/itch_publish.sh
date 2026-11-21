#!/usr/bin/env bash
# Baut das itch-Paket und lädt es in den Kanal html5 von timludovic/tramsim.
#   bash tools/itch_publish.sh            # pusht
#   bash tools/itch_publish.sh --dry-run  # nur bauen
set -euo pipefail
cd "$(dirname "$0")/.."

python3 tools/itch_build.py

if [ "${1:-}" = "--dry-run" ]; then
  echo "nur gebaut, kein Upload"
  exit 0
fi

KEY="${BUTLER_API_KEY:-${Itch_Api_Key:-}}"
if [ -z "$KEY" ]; then
  echo "Kein API-Key gefunden (BUTLER_API_KEY oder Itch_Api_Key)." >&2
  exit 1
fi

BUTLER_API_KEY="$KEY" "$HOME/bin/butler" push dist/itch timludovic/tramsim:html5 "$@"
