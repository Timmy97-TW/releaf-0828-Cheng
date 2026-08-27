#!/bin/zsh
# import-photo.sh SOURCE DEST_NAME [MAX_PX]
# Converts (HEIC/JPG/PNG) -> JPEG, strips to sRGB, caps the long edge, writes into assets/img.
set -e
SRC="$1"; NAME="$2"; MAX="${3:-1600}"
DIR="${0:A:h}/../assets/img"
sips -s format jpeg -s formatOptions 82 -Z "$MAX" "$SRC" --out "$DIR/$NAME" >/dev/null
echo "$DIR/$NAME  $(du -h "$DIR/$NAME" | cut -f1)  $(sips -g pixelWidth -g pixelHeight "$DIR/$NAME" | tail -2 | tr -d ' \n')"
