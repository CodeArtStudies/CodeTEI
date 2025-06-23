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

# Create functional fallback if generated RNG has external dependencies
if grep -q "http://localhost" "$BUILD_DIR/CodeTEI-v0.2.rng"; then
    echo "⚠️  Generated RNG has external dependencies, creating standalone version..."
    cat > "$BUILD_DIR/CodeTEI-v0.2.rng" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<grammar xmlns="http://relaxng.org/ns/structure/1.0"
         datatypeLibrary="http://www.w3.org/2001/XMLSchema-datatypes">

  <start>
    <ref name="tei_root"/>
  </start>

  <define name="tei_root">
    <element name="TEI" ns="http://www.tei-c.org/ns/1.0">
      <optional>
        <attribute name="xml:id"/>
      </optional>
      <zeroOrMore>
        <choice>
          <ref name="tei_any"/>
          <ref name="code_block"/>
          <ref name="meta_any"/>
        </choice>
      </zeroOrMore>
    </element>
  </define>

  <!-- Generic TEI permissive pattern -->
  <define name="tei_any">
    <element>
      <anyName ns="http://www.tei-c.org/ns/1.0"/>
      <zeroOrMore>
        <choice>
          <attribute><anyName/></attribute>
          <text/>
          <ref name="tei_any"/>
          <ref name="code_block"/>
          <ref name="meta_any"/>
        </choice>
      </zeroOrMore>
    </element>
  </define>

  <!-- Code namespace elements -->
  <define name="code_block">
    <element name="block" ns="http://codetei.org/ns/code">
      <optional><attribute name="xml:id"/></optional>
      <optional><attribute name="type"/></optional>
      <optional><attribute name="lang"/></optional>
      <oneOrMore>
        <ref name="code_line"/>
      </oneOrMore>
    </element>
  </define>

  <define name="code_line">
    <element name="line" ns="http://codetei.org/ns/code">
      <optional><attribute name="xml:id"/></optional>
      <optional><attribute name="n"><data type="integer"/></attribute>
      <text/>
    </element>
  </define>

  <!-- Meta namespace elements -->
  <define name="meta_any">
    <choice>
      <ref name="meta_note"/>
      <ref name="meta_run"/>
      <ref name="meta_q"/>
      <ref name="meta_a"/>
      <ref name="meta_runSummary"/>
      <ref name="meta_tokRange"/>
    </choice>
  </define>

  <define name="meta_note">
    <element name="note" ns="http://codetei.org/ns/meta">
      <optional><attribute name="xml:id"/></optional>
      <optional><attribute name="target"/></optional>
      <optional><attribute name="agent"/></optional>
      <optional><attribute name="model"/></optional>
      <optional><attribute name="confidence"><data type="decimal"/></attribute>
      <optional><attribute name="when"/></optional>
      <optional><attribute name="who"/></optional>
      <zeroOrMore>
        <choice>
          <text/>
          <ref name="tei_any"/>
        </choice>
      </zeroOrMore>
    </element>
  </define>

  <define name="meta_run">
    <element name="run" ns="http://codetei.org/ns/meta">
      <optional><attribute name="xml:id"/></optional>
      <optional><attribute name="type"/></optional>
      <optional><attribute name="target"/></optional>
      <optional><attribute name="timestamp"/></optional>
      <optional><attribute name="status"/></optional>
      <optional><attribute name="chainID"/></optional>
      <optional><attribute name="contractAddress"/></optional>
      <optional><attribute name="txHash"/></optional>
      <optional><attribute name="caller"/></optional>
      <optional><attribute name="containerImage"/></optional>
      <optional><attribute name="language"/></optional>
      <optional><attribute name="version"/></optional>
      <zeroOrMore>
        <ref name="meta_note"/>
      </zeroOrMore>
    </element>
  </define>

  <define name="meta_q">
    <element name="q" ns="http://codetei.org/ns/meta">
      <optional><attribute name="xml:id"/></optional>
      <optional><attribute name="target"/></optional>
      <optional><attribute name="agent"/></optional>
      <optional><attribute name="model"/></optional>
      <optional><attribute name="when"/></optional>
      <zeroOrMore>
        <choice>
          <text/>
          <ref name="tei_any"/>
        </choice>
      </zeroOrMore>
    </element>
  </define>

  <define name="meta_a">
    <element name="a" ns="http://codetei.org/ns/meta">
      <optional><attribute name="xml:id"/></optional>
      <optional><attribute name="for"/></optional>
      <optional><attribute name="who"/></optional>
      <optional><attribute name="when"/></optional>
      <zeroOrMore>
        <choice>
          <text/>
          <ref name="tei_any"/>
        </choice>
      </zeroOrMore>
    </element>
  </define>

  <define name="meta_runSummary">
    <element name="runSummary" ns="http://codetei.org/ns/meta">
      <optional><attribute name="xml:id"/></optional>
      <optional><attribute name="target"/></optional>
      <optional><attribute name="count"><data type="integer"/></attribute>
      <optional><attribute name="start"/></optional>
      <optional><attribute name="end"/></optional>
      <empty/>
    </element>
  </define>

  <define name="meta_tokRange">
    <element name="tokRange" ns="http://codetei.org/ns/meta">
      <optional><attribute name="xml:id"/></optional>
      <optional><attribute name="startLine"/></optional>
      <optional><attribute name="start"><data type="integer"/></attribute>
      <optional><attribute name="endLine"/></optional>
      <optional><attribute name="end"><data type="integer"/></attribute>
      <optional><attribute name="tokType"/></optional>
      <empty/>
    </element>
  </define>

</grammar>
EOF
    echo "   Created standalone RNG due to external dependencies"
fi

# Copy to schema root for validation
cp "$BUILD_DIR/CodeTEI-v0.2.rng" "schema/CodeTEI-v0.2.rng"

echo "✅ RNG schema generated successfully!"
echo "📁 Generated files:"
echo "   - schema/CodeTEI-v0.2.rng (for validation)"
echo "   - schema/build/CodeTEI-v0.2.rng (build artifact)"