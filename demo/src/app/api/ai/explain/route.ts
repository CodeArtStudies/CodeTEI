import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Parse request body once and store it
  const requestData = await request.json()
  const { sourceCode, type, lineNumber, lineContent } = requestData

  try {
    if (!process.env.OPENAI_API_KEY) {
      // Return mock explanation if no API key is set
      const mockExplanation = generateMockExplanation(type, lineNumber, lineContent, sourceCode)
      return NextResponse.json({ 
        explanation: mockExplanation, 
        mock: true,
        message: 'No OpenAI API key configured. Using demo explanation.'
      })
    }

    // Prepare the prompt based on type
    let prompt = ''
    if (type === 'work') {
      prompt = `Analyze this code poetry. Provide one concise explanation in English and Japanese separated by " / ". Focus on the main technical function and poetic meaning. Do not use labels:

${sourceCode}`
    } else if (type === 'line') {
      prompt = `Explain this line from code poetry. Provide one concise explanation in English and Japanese separated by " / ". Focus on the specific technical role and poetic significance. Do not use labels:

Line ${lineNumber}: ${lineContent}

Context:
${sourceCode}`
    }
    
    console.log('Sending prompt to GPT-5:', prompt)

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log('OpenAI API response:', JSON.stringify(data, null, 2))
    
    const explanation = data.choices[0]?.message?.content?.trim()

    if (!explanation) {
      console.error('No explanation in response:', data)
      throw new Error(`No explanation received from AI. Response: ${JSON.stringify(data)}`)
    }

    return NextResponse.json({ 
      explanation,
      model: 'gpt-4o',
      mock: false
    })

  } catch (error) {
    console.error('Error generating explanation:', error)
    
    // Fall back to mock explanation on error
    const mockExplanation = generateMockExplanation(type, lineNumber, lineContent, sourceCode)
    
    return NextResponse.json({ 
      explanation: mockExplanation, 
      mock: true,
      error: 'Using mock explanation due to API error'
    })
  }
}

function generateMockExplanation(
  type: string, 
  lineNumber?: number, 
  lineContent?: string, 
  sourceCode?: string
): string {
  if (type === 'work') {
    const lineCount = sourceCode?.split('\n').length || 0
    const hasFunction = sourceCode?.includes('function') || sourceCode?.includes('def ')
    const hasClass = sourceCode?.includes('class ')
    
    if (hasClass) {
      return `This ${lineCount}-line code defines a class structure that encapsulates data and behavior. It demonstrates object-oriented programming principles with methods and properties working together.`
    } else if (hasFunction) {
      return `This ${lineCount}-line code implements a function that processes input and produces output. It demonstrates procedural programming concepts with structured logic flow.`
    } else {
      return `This ${lineCount}-line code snippet performs specific computational tasks. It showcases programming fundamentals including variable manipulation and control structures.`
    }
  } else if (type === 'line' && lineNumber) {
    if (lineContent?.includes('return')) {
      return `Line ${lineNumber} returns a value from the current function, passing the result back to the caller for further processing.`
    } else if (lineContent?.includes('if ') || lineContent?.includes('else')) {
      return `Line ${lineNumber} contains conditional logic that controls program flow based on specific criteria or boolean conditions.`
    } else if (lineContent?.includes('for ') || lineContent?.includes('while ')) {
      return `Line ${lineNumber} initiates a loop structure that repeats execution of code blocks until certain conditions are met.`
    } else if (lineContent?.includes('=') && !lineContent?.includes('==')) {
      return `Line ${lineNumber} assigns a value to a variable, storing data for later use in the program execution.`
    } else {
      return `Line ${lineNumber} executes a specific operation that contributes to the overall functionality of the code structure.`
    }
  }
  
  return 'This code demonstrates programming concepts and computational logic.'
}