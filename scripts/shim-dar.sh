#!/usr/bin/env bash

ABSDIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )" > /dev/null 2>&1 && pwd )"
DIST="$ABSDIR/../.daml/dist"

DAR_PATH=$(find "$DIST" -name "*.dar" | head -1)
DAR_NAME=$(basename "$DAR_PATH")

TMP=$(mktemp -d -t "$DAR_NAME")

unzip -d "$TMP" "$DAR_PATH"

cp -R "$ABSDIR/../build" "$TMP/ui"

(cd "$TMP" && zip -r "$DAR_NAME" ./*)

mv "$TMP/$DAR_NAME" "$DAR_PATH"

rm -rf "$TMP"

echo "Added UI to [$(realpath --relative-to="$ABSDIR/.." "$DAR_PATH")]"