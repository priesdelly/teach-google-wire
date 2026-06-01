#!/usr/bin/env bash
# Pack the CourseKit starter kit (engine + theme + runnable starter course) into a zip.
# Extract it and `examples/starter/en/` runs as-is; copy starter/ out to begin a new course.
set -euo pipefail

cd "$(dirname "$0")"
OUT="${1:-coursekit-starter-kit.zip}"
ITEMS=(core themes examples/starter)

rm -f "$OUT"
zip -r -q "$OUT" "${ITEMS[@]}" -x '*/.DS_Store' '*.DS_Store'
echo "Created $OUT ($(du -h "$OUT" | cut -f1)) — $(unzip -l "$OUT" | tail -1 | awk '{print $2}') files"
