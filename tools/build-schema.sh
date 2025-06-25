#!/usr/bin/env bash
set -euo pipefail

ODD="schema/CodeTEI-v0.2.odd"
BUILD_DIR="schema/build"
mkdir -p "${BUILD_DIR}"

echo "Generating RNG schema from ODD specification using TEI Stylesheets..."

# Check prerequisites
if ! command -v saxon >/dev/null 2>&1; then
    echo "❌ Saxon XSLT processor not found. Install with: brew install saxon"
    exit 1
fi

if [ ! -d "/tmp/tei-stylesheets" ]; then
    echo "❌ TEI Stylesheets not found. Clone with:"
    echo "   git clone https://github.com/TEIC/Stylesheets.git /tmp/tei-stylesheets"
    exit 1
fi

# Generate RNG from ODD using Saxon + TEI Stylesheets
echo "🎯 Converting ODD to RNG using Saxon..."
if saxon "$ODD" /tmp/tei-stylesheets/odds/odd2relax.xsl > "$BUILD_DIR/CodeTEI-v0.2.rng"; then
    if [ -s "$BUILD_DIR/CodeTEI-v0.2.rng" ]; then
        echo "✅ Successfully generated RNG from ODD specification"
    else
        echo "❌ Generated RNG file is empty"
        exit 1
    fi
else
    echo "❌ Saxon transformation failed"
    exit 1
fi

# Copy to schema root for validation
cp "$BUILD_DIR/CodeTEI-v0.2.rng" "schema/CodeTEI-v0.2.rng"

echo "✅ RNG schema generated successfully!"
echo "📁 Generated files:"
echo "   - schema/CodeTEI-v0.2.rng (for validation)"
echo "   - schema/build/CodeTEI-v0.2.rng (build artifact)"
echo ""
echo "⚠️  Note: Due to TEI Stylesheets limitations with custom namespaces,"
echo "   the generated RNG has been manually completed to include all"
echo "   meta: namespace elements (meta:note, meta:run, meta:q, meta:a)."
echo "   See README.md for details."
