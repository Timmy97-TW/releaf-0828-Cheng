#!/bin/zsh
# Regenerates a .webp beside every .jpg in assets/img. index.html serves them
# through <picture>, with the JPEG as the fallback source, so both must exist.
# Run after adding or replacing a photograph.
set -e
DIR="${0:A:h}/../assets/img"
for f in "$DIR"/*.jpg; do
  cwebp -quiet -q 78 -m 6 "$f" -o "${f%.jpg}.webp"
done
echo "jpeg $(du -shc "$DIR"/*.jpg | tail -1 | cut -f1)  webp $(du -shc "$DIR"/*.webp | tail -1 | cut -f1)"
