import CryptoJS from 'crypto-js';

export interface CodeWorkInput {
  title: string;
  author: string;
  sourceCode: string;
  language?: string;
}

export interface Explanation {
  id: string;
  type: string;
  lineNumber?: number;
  content: string;
  agent: string;
  model?: string;
  confidence?: number;
  understanding?: number;
  question?: string;
  createdAt: string;
}

export interface Execution {
  id: string;
  type: string;
  containerInfo?: string;
  chainName?: string;
  txId?: string;
  status: string;
  notes?: string;
  executedAt: string;
}

export interface CodeWorkWithAnnotations {
  id: string;
  title: string;
  author: string;
  sourceCode: string;
  language?: string;
  sha3Hash: string;
  explanations: Explanation[];
  executions: Execution[];
}

export function generateSHA3Hash(sourceCode: string): string {
  return CryptoJS.SHA3(sourceCode, { outputLength: 256 }).toString();
}

export function generateCodeTEIURI(hash: string): string {
  return `codetei://sha3-256-${hash}`;
}

export function generateCompleteCodeTEIXML(work: CodeWorkWithAnnotations): string {
  const { title, author, sourceCode, language = 'text', sha3Hash, explanations, executions } = work;
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

  // Generate explanations
  const workExplanations = explanations.filter(e => e.type === 'work');
  const lineExplanations = explanations.filter(e => e.type === 'line');
  
  const explanationElements = workExplanations.map((explanation, index) => {
    const agent = explanation.agent === 'human' ? 'human' : 'ai';
    const model = explanation.model ? ` model="${escapeXML(explanation.model)}"` : '';
    const confidence = explanation.confidence ? ` confidence="${explanation.confidence}"` : '';
    const understanding = explanation.understanding ? ` understanding="${explanation.understanding}"` : '';
    
    return `    <meta:note xml:id="exp-w-${index + 1}" type="explanation" agent="${agent}"${model}${confidence}${understanding}>
      <p>${escapeXML(explanation.content)}</p>
    </meta:note>`;
  }).join('\n');

  // Generate line-specific explanations
  const lineExplanationElements = lineExplanations.map((explanation, index) => {
    const agent = explanation.agent === 'human' ? 'human' : 'ai';
    const model = explanation.model ? ` model="${escapeXML(explanation.model)}"` : '';
    const confidence = explanation.confidence ? ` confidence="${explanation.confidence}"` : '';
    const understanding = explanation.understanding ? ` understanding="${explanation.understanding}"` : '';
    const lineRef = explanation.lineNumber ? ` target="#l${explanation.lineNumber}"` : '';
    
    return `    <meta:note xml:id="exp-l-${index + 1}" type="explanation" agent="${agent}"${model}${confidence}${understanding}${lineRef}>
      <p>${escapeXML(explanation.content)}</p>
    </meta:note>`;
  }).join('\n');

  // Generate execution records
  const executionElements = executions.map((execution, index) => {
    const containerInfo = execution.containerInfo ? ` container="${escapeXML(execution.containerInfo)}"` : '';
    const chainName = execution.chainName ? ` chain="${escapeXML(execution.chainName)}"` : '';
    const txId = execution.txId ? ` tx="${escapeXML(execution.txId)}"` : '';
    const notes = execution.notes ? `\n      <p>${escapeXML(execution.notes)}</p>` : '';
    
    return `    <meta:run xml:id="exec-${index + 1}" type="${execution.type}" status="${execution.status}"${containerInfo}${chainName}${txId}>
      <date when="${execution.executedAt}"/>${notes}
    </meta:run>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<TEI xml:id="work-${sha3Hash.substring(0, 8)}"
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

  <!-- standOff for annotations -->
  <standOff>
${explanationElements}
${lineExplanationElements}
${executionElements}
  </standOff>
</TEI>`;
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