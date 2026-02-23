#!/bin/bash
# Image Optimization Script
# Usage: bash optimize-images.sh
# Requires: ffmpeg, imagemagick (optional)

SEQUENCE_DIR="./sequence"
OUTPUT_DIR="./sequence-optimized"

echo "🖼️  Starting image optimization..."
echo "This will create WebP versions and optimize JPEGs"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Count files
TOTAL=$(find "$SEQUENCE_DIR" -name "frame_*.jpg" | wc -l)
CURRENT=0

# Process each image
for image in "$SEQUENCE_DIR"/frame_*.jpg; do
    FILENAME=$(basename "$image")
    ((CURRENT++))
    
    echo "[$CURRENT/$TOTAL] Processing: $FILENAME"
    
    # Original JPEG
    # Compress slightly more
    ffmpeg -i "$image" -q:v 8 -y "$OUTPUT_DIR/$FILENAME" 2>/dev/null
    
    # WebP version (optional, requires libwebp)
    WEBP_NAME="${FILENAME%.*}.webp"
    ffmpeg -i "$image" -quality 85 -y "$OUTPUT_DIR/$WEBP_NAME" 2>/dev/null || true
    
done

echo ""
echo "✅ Optimization complete!"
echo ""
echo "Statistics:"
ORIGINAL_SIZE=$(du -sh "$SEQUENCE_DIR" | cut -f1)
OPTIMIZED_SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)

echo "Original:  $ORIGINAL_SIZE"
echo "Optimized: $OPTIMIZED_SIZE"
echo ""
echo "Next steps:"
echo "1. Backup current sequence: mv sequence sequence-backup"
echo "2. Replace: mv sequence-optimized sequence"
echo "3. Update script.js if needed (WebP fallback)"
