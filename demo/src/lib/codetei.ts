import CryptoJS from 'crypto-js';

export interface CodeWorkInput {
  title: string;
  author: string;
  sourceCode: string;
  language?: string;
}

export function generateSHA3Hash(sourceCode: string): string {
  return CryptoJS.SHA3(sourceCode, { outputLength: 256 }).toString();
}

export function generateCodeTEIURI(hash: string): string {
  return `codetei://sha3-256-${hash}`;
}

export function generateCodeTEIXML(input: CodeWorkInput): string {
  const { title, author, sourceCode, language = 'text' } = input;
  const hash = generateSHA3Hash(sourceCode);
  const lines = sourceCode.split('\n');
  
  const currentDate = new Date().toISOString();
  const shortDate = currentDate.split('T')[0];
  
  // Generate line elements with proper indentation preserved
  const codeLines = lines.map((line, index) => {
    const lineNumber = index + 1;
    const lineId = `l${lineNumber}`;
    // Escape XML special characters
    const escapedLine = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    
    // Handle empty lines - preserve them as self-closing tags
    if (line.trim() === '') {
      return `        <code:line xml:id="${lineId}" n="${lineNumber}"/>`;
    }
    
    return `        <code:line xml:id="${lineId}" n="${lineNumber}">${escapedLine}</code:line>`;
  }).join('\n');

  // Handle optional title and author
  const titleElement = title ? `<title>${escapeXML(title)}</title>` : '<title>Untitled Code Work</title>';
  const authorElement = author ? `<author xml:id="auth0">${escapeXML(author)}</author>` : '<author xml:id="auth0">Unknown</author>';
  const changeWho = author ? '#auth0' : '#auth0';

  return `<?xml version="1.0" encoding="UTF-8"?>
<TEI xml:id="work-${hash.substring(0, 8)}"
     xmlns="http://www.tei-c.org/ns/1.0"
     xmlns:code="http://codetei.org/ns/code"
     xmlns:meta="http://codetei.org/ns/meta">

  <!-- teiHeader -->
  <teiHeader>
    <fileDesc>
      <titleStmt>
        ${titleElement}
        ${authorElement}
      </titleStmt>
      <publicationStmt>
        <p>Created ${shortDate} via CodeTEI Corpus Site.</p>
      </publicationStmt>
      <sourceDesc>
        <p>Born-digital work registered via CodeTEI Corpus Site.</p>
      </sourceDesc>
    </fileDesc>
    <encodingDesc>
      <schemaSpec ident="CodeTEI-v0.2"/>
    </encodingDesc>
    <revisionDesc>
      <change who="${changeWho}" when="${currentDate}">initial registration</change>
    </revisionDesc>
  </teiHeader>

  <!-- Code text -->
  <text>
    <body>
      <code:block xml:id="main-block" type="code" lang="${language}">
${codeLines}
      </code:block>
    </body>
  </text>

  <!-- standOff for future annotations -->
  <standOff>
    <!-- Meta-annotations will be added here -->
  </standOff>
</TEI>`;
}

function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function parseCodeTEIXML(xml: string): CodeWorkInput | null {
  try {
    // Simple regex-based parsing for demo purposes
    const titleMatch = xml.match(/<title>([^<]+)<\/title>/);
    const authorMatch = xml.match(/<author[^>]*>([^<]+)<\/author>/);
    
    // Extract source code from code:line elements
    const lineMatches = xml.match(/<code:line[^>]*>([^<]*)<\/code:line>/g) || [];
    const lines = lineMatches.map(lineXML => {
      const contentMatch = lineXML.match(/>([^<]*)</);
      if (!contentMatch) return '';
      // Unescape XML entities
      return contentMatch[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
    });
    
    const langMatch = xml.match(/lang="([^"]+)"/);
    
    if (!titleMatch || !authorMatch) return null;
    
    return {
      title: titleMatch[1],
      author: authorMatch[1],
      sourceCode: lines.join('\n'),
      language: langMatch?.[1] || 'text'
    };
  } catch (error) {
    console.error('Failed to parse CodeTEI XML:', error);
    return null;
  }
}