#!/usr/bin/env sh
# new-game.sh — scaffold a new game's design doc.
#
# Creates games/<name>/, copies the design template into it as <name>.md,
# and fills the "## Title" heading with the game name.
#
# usage: ./new-game.sh <game-name>

set -eu

if [ "$#" -lt 1 ] || [ -z "$1" ]; then
  echo "usage: $0 <game-name>" >&2
  exit 1
fi

NAME="$1"

# resolve paths relative to this script so it runs from any working directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GAMES_DIR="$SCRIPT_DIR/games"
TEMPLATE="$GAMES_DIR/game-making-template.md"
DEST_DIR="$GAMES_DIR/$NAME"
DEST_FILE="$DEST_DIR/$NAME.md"

if [ ! -f "$TEMPLATE" ]; then
  echo "error: template not found at $TEMPLATE" >&2
  exit 1
fi

if [ -e "$DEST_DIR" ]; then
  echo "error: games/$NAME already exists" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
cp "$TEMPLATE" "$DEST_FILE"

# insert the game name right under the "## Title" heading
awk -v name="$NAME" '
  { print }
  /^## Title$/ { print ""; print name }
' "$DEST_FILE" > "$DEST_FILE.tmp" && mv "$DEST_FILE.tmp" "$DEST_FILE"

echo "created games/$NAME/$NAME.md"
