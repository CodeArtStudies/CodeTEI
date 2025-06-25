# CodeTEI: A TEI Extension for Executable Poetry

CodeTEI extends TEI P5 to preserve, cite, and analyze **executable poetry** — works where source code itself constitutes the poem, and execution forms part of the meaning.

## Background

Digital humanities increasingly engages with multimodal artifacts. Executable poetry pushes this further: the source code *is* the poem, and its execution constitutes part of the meaning. Scholars need a unified model that preserves:

1. **Precise line-level citations** (`codetei://sha3-256-<digest>#<lineID>`)
2. **Reproducible runtime environments** (containerized + blockchain)  
3. **Execution results as textual continuation**

## Features

- **Line-centered model**: Every newline becomes `<code:line>` with stable IDs
- **Execution integration**: `<meta:run>` records blockchain transactions and containerized runs
- **Multi-agent annotation**: Human, AI, and system-generated notes in unified schema
- **Stable citations**: Cryptographic hashes ensure persistent addressability

## Quick Start

```bash
# Install dependencies
brew install jing-trang xsltproc saxon

# Clone TEI Stylesheets
git clone https://github.com/TEIC/Stylesheets.git /tmp/tei-stylesheets

# Generate schema from ODD
bash tools/build-schema.sh

# Validate examples
bash tools/validate.sh

# Generate HTML viewer
xsltproc tools/xslt/viewer.xsl examples/recursivePoem.xml > demo.html
open demo.html
```

## Examples

- **[recursivePoem.xml](examples/recursivePoem.xml)** - Python executable poetry with AI literary analysis
- **[onchainHaiku.xml](examples/onchainHaiku.xml)** - Solidity blockchain poetry with transaction history
- **[callBell.xml](examples/callBell.xml)** - Basic syntax demonstration

## Research Context

CodeTEI bridges several research lineages:

- **Critical Code Studies (CCS)** + **Electronic Literature Collection (ELC)**: Line-level citation and interpretation
- **Software Heritage** + **ReproZip**: Reproducible execution environments  
- **TEI Digital Humanities**: Scholarly text encoding standards

Unlike existing approaches that treat runtime as paratext, CodeTEI makes execution results a direct continuation of the main text.

## Schema

- **ODD Specification**: [schema/CodeTEI-v0.2.odd](schema/CodeTEI-v0.2.odd)
- **Generated RNG**: [schema/CodeTEI-v0.2.rng](schema/CodeTEI-v0.2.rng)
- **Build Process**: Saxon XSLT + TEI Stylesheets

## Citation

```
Arakawa, Z. (2025). CodeTEI: A TEI Extension and PoC System for Executable Poetry. 
[Conference presentation]. GitHub: https://github.com/CodeArtStudies/CodeTEI
```

## License

Open source under [LICENSE](LICENSE). All resources released under open license for academic use.
