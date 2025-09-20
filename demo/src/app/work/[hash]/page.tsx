'use client'

import { useState, useEffect } from 'react'
import { generateCodeTEIURI, generateCompleteCodeTEIXML } from '@/lib/codetei'

interface Explanation {
  id: string
  type: string
  lineNumber?: number
  content: string
  agent: string
  model?: string
  confidence?: number
  understanding?: number
  question?: string
  createdAt: string
}

interface Execution {
  id: string
  type: string
  containerInfo?: string
  chainName?: string
  txId?: string
  status: string
  notes?: string
  executedAt: string
}

interface CodeWork {
  id: string
  title: string
  author: string
  sourceCode: string
  sha3Hash: string
  codeteiXml: string
  createdAt: string
  explanations: Explanation[]
  executions: Execution[]
}

export default function WorkDetailPage({ params }: { params: Promise<{ hash: string }> }) {
  const [work, setWork] = useState<CodeWork | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [generatingExplanation, setGeneratingExplanation] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<{
    content: string
    type: 'work' | 'line'
    lineNumber?: number
    model?: string
    mock?: boolean
    message?: string
  } | null>(null)
  const [userExplanation, setUserExplanation] = useState('')
  const [showExecutionForm, setShowExecutionForm] = useState(false)
  const [executionForm, setExecutionForm] = useState({
    type: 'container',
    status: 'success',
    containerInfo: '',
    chainName: '',
    txId: '',
    notes: ''
  })

  useEffect(() => {
    const loadWork = async () => {
      const resolvedParams = await params
      fetchWork(resolvedParams.hash)
    }
    loadWork()
  }, [params])

  const fetchWork = async (hash: string) => {
    try {
      const response = await fetch(`/api/code-works/${hash}`)
      if (response.ok) {
        const data = await response.json()
        setWork(data)
      }
    } catch (error) {
      console.error('Error fetching work:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateExplanation = async (type: 'work' | 'line', lineNumber?: number) => {
    if (!work) return
    
    setGeneratingExplanation(true)
    try {
      // Get AI explanation
      const codeLines = work.sourceCode.split('\n')
      const lineContent = lineNumber ? codeLines[lineNumber - 1] : undefined
      
      const aiResponse = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCode: work.sourceCode,
          type,
          lineNumber,
          lineContent,
        }),
      })

      if (!aiResponse.ok) {
        throw new Error('Failed to get AI explanation')
      }

      const { explanation, model, mock, message } = await aiResponse.json()

      // Set AI explanation for preview
      setAiExplanation({
        content: explanation,
        type,
        lineNumber,
        model: model || 'gpt-4o',
        mock: mock || false,
        message: message
      })
      
      // Clear user explanation
      setUserExplanation('')
    } catch (error) {
      console.error('Error generating explanation:', error)
      alert('Failed to generate explanation. Please try again.')
    } finally {
      setGeneratingExplanation(false)
    }
  }

  const submitExplanation = async () => {
    if (!work || !aiExplanation) return
    
    try {
      const resolvedParams = await params
      const response = await fetch('/api/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: aiExplanation.type,
          lineNumber: aiExplanation.lineNumber,
          content: userExplanation || aiExplanation.content,
          agent: aiExplanation.model === 'human' ? 'human' : (aiExplanation.mock ? 'ai' : 'chatgpt'),
          model: aiExplanation.model === 'human' ? 'human' : aiExplanation.model,
          confidence: aiExplanation.model === 'human' ? 1.0 : (aiExplanation.mock ? 0.5 : 0.8),
          codeWorkId: work.id,
        }),
      })

      if (response.ok) {
        // Clear the explanation preview
        setAiExplanation(null)
        setUserExplanation('')
        await fetchWork(resolvedParams.hash) // Refresh to show new explanation
      }
    } catch (error) {
      console.error('Error submitting explanation:', error)
      alert('Failed to submit explanation. Please try again.')
    }
  }

  const deleteExplanation = async (explanationId: string) => {
    if (!confirm('Are you sure you want to delete this explanation?')) {
      return
    }

    try {
      const response = await fetch(`/api/explanations/${explanationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const resolvedParams = await params
        await fetchWork(resolvedParams.hash) // Refresh to show updated explanations
      } else {
        throw new Error('Failed to delete explanation')
      }
    } catch (error) {
      console.error('Error deleting explanation:', error)
      alert('Failed to delete explanation. Please try again.')
    }
  }

  const addExecution = async () => {
    if (!work) return

    try {
      const response = await fetch('/api/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: executionForm.type,
          status: executionForm.status,
          containerInfo: executionForm.containerInfo || undefined,
          chainName: executionForm.chainName || undefined,
          txId: executionForm.txId || undefined,
          notes: executionForm.notes || undefined,
          codeWorkId: work.id,
        }),
      })

      if (response.ok) {
        setShowExecutionForm(false)
        setExecutionForm({
          type: 'container',
          status: 'success',
          containerInfo: '',
          chainName: '',
          txId: '',
          notes: ''
        })
        const resolvedParams = await params
        await fetchWork(resolvedParams.hash) // Refresh to show updated executions
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(`Failed to add execution: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error adding execution:', error)
      alert('Failed to add execution. Please try again.')
    }
  }

  const deleteExecution = async (executionId: string) => {
    if (!confirm('Are you sure you want to delete this execution record?')) {
      return
    }

    try {
      const response = await fetch(`/api/executions/${executionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const resolvedParams = await params
        await fetchWork(resolvedParams.hash) // Refresh to show updated executions
      } else {
        throw new Error('Failed to delete execution')
      }
    } catch (error) {
      console.error('Error deleting execution:', error)
      alert('Failed to delete execution. Please try again.')
    }
  }


  const downloadXML = () => {
    if (!work) return
    
    // Generate complete CodeTEI XML with all annotations
    const completeXML = generateCompleteCodeTEIXML({
      id: work.id,
      title: work.title,
      author: work.author,
      sourceCode: work.sourceCode,
      language: 'text',
      sha3Hash: work.sha3Hash,
      explanations: work.explanations,
      executions: work.executions
    })
    
    const blob = new Blob([completeXML], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Work not found</div>
          <a href="/browse" className="text-gray-700 hover:text-gray-900">← Back to Browse</a>
        </div>
      </div>
    )
  }

  const codeLines = work.sourceCode.split('\n')

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <a href="/browse" className="text-gray-700 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-black">{work.title}</h1>
          <p className="text-gray-700 text-lg">by {work.author}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Code Section */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">Source Code</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => generateExplanation('work')}
                  disabled={generatingExplanation}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:bg-gray-400"
                >
                  {generatingExplanation ? 'Generating...' : 'AI Explain'}
                </button>
                <button
                  onClick={() => setAiExplanation({ content: '', type: 'work', model: 'human' })}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Human Explain
                </button>
                <button
                  onClick={downloadXML}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  View XML
                </button>
              </div>
            </div>

            {/* Explanation Preview */}
            {aiExplanation && aiExplanation.type === 'work' && (
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                {aiExplanation.model !== 'human' && aiExplanation.content && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      AI Generated {aiExplanation.mock ? '(Demo Mode - No API Key)' : ''}:
                    </p>
                    <p className="text-gray-900 bg-white border border-gray-200 rounded p-3 text-sm">
                      {aiExplanation.content}
                    </p>
                    {aiExplanation.mock && (
                      <p className="text-xs text-gray-500 mt-2">
                        💡 {aiExplanation.message || 'To use real ChatGPT explanations, set OPENAI_API_KEY in your environment variables.'}
                      </p>
                    )}
                  </div>
                )}
                {aiExplanation.model === 'human' && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Your Explanation:</p>
                    <textarea
                      id="userExplanation"
                      value={userExplanation}
                      onChange={(e) => setUserExplanation(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your explanation..."
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={submitExplanation}
                    className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900"
                  >
                    Submit Explanation
                  </button>
                  <button
                    onClick={() => {
                      setAiExplanation(null)
                      setUserExplanation('')
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <pre className="bg-gray-50 text-gray-900 p-4 text-sm overflow-auto">
                {codeLines.map((line, index) => {
                  const lineNumber = index + 1
                  const hasExplanation = work.explanations.some(e => e.lineNumber === lineNumber)

                  return (
                    <div
                      key={lineNumber}
                      className={`flex cursor-pointer hover:bg-gray-100 ${
                        selectedLine === lineNumber ? 'bg-gray-200' : ''
                      }`}
                      onClick={() => setSelectedLine(selectedLine === lineNumber ? null : lineNumber)}
                    >
                      <span className="text-gray-500 w-8 text-right mr-4 select-none font-mono">
                        {lineNumber}
                      </span>
                      <span className="flex-1 font-mono text-gray-900">{line}</span>
                    </div>
                  )
                })}
              </pre>
            </div>

            {selectedLine && (
              <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded">
                <p className="text-sm font-medium mb-2 text-gray-900">Line {selectedLine} selected</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateExplanation('line', selectedLine)}
                    disabled={generatingExplanation}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:bg-gray-400"
                  >
                    {generatingExplanation ? 'Generating...' : 'AI Explain'}
                  </button>
                  <button
                    onClick={() => setAiExplanation({ content: '', type: 'line', lineNumber: selectedLine, model: 'human' })}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Human Explain
                  </button>
                </div>
              </div>
            )}

            {/* Line Explanation Preview */}
            {aiExplanation && aiExplanation.type === 'line' && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                {aiExplanation.model !== 'human' && aiExplanation.content && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      AI Generated for Line {aiExplanation.lineNumber} {aiExplanation.mock ? '(Demo Mode - No API Key)' : ''}:
                    </p>
                    <p className="text-gray-900 bg-white border border-gray-200 rounded p-3 text-sm">
                      {aiExplanation.content}
                    </p>
                    {aiExplanation.mock && (
                      <p className="text-xs text-gray-500 mt-2">
                        💡 {aiExplanation.message || 'To use real ChatGPT explanations, set OPENAI_API_KEY in your environment variables.'}
                      </p>
                    )}
                  </div>
                )}
                {aiExplanation.model === 'human' && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Your Explanation:</p>
                    <textarea
                      id="userLineExplanation"
                      value={userExplanation}
                      onChange={(e) => setUserExplanation(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your explanation..."
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={submitExplanation}
                    className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900"
                  >
                    Submit Explanation
                  </button>
                  <button
                    onClick={() => {
                      setAiExplanation(null)
                      setUserExplanation('')
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-medium text-gray-900 mb-2">CodeTEI URI:</p>
              <code className="text-gray-800 text-sm bg-gray-100 p-3 rounded block break-all font-mono border border-gray-200">
                {generateCodeTEIURI(work.sha3Hash)}
              </code>
            </div>
          </div>

          {/* Annotations & Executions Sidebar */}
          <div className="space-y-6">
            {/* Work Explanations */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-black">Work Explanations</h3>
              <div className="space-y-3">
                {work.explanations
                  .filter(e => e.type === 'work')
                  .map((explanation) => (
                    <div key={explanation.id} className={`border rounded p-3 ${
                      explanation.agent === 'human' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          explanation.agent === 'human' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                        }`}>
                          {explanation.agent === 'human' ? 'Human' : 'AI'}
                        </span>
                        <button
                          onClick={() => deleteExplanation(explanation.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          title="Delete explanation"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm mb-2 text-gray-900">{explanation.content}</p>
                      <div className="text-xs text-gray-600">
                        {explanation.agent} - {new Date(explanation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Line Explanations */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-black">Line Explanations</h3>
              <div className="space-y-3">
                {work.explanations
                  .filter(e => e.type === 'line')
                  .map((explanation) => (
                    <div key={explanation.id} className={`border rounded p-3 ${
                      explanation.agent === 'human' ? 'border-green-200 bg-green-100' : 'border-gray-200 bg-gray-100'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">Line {explanation.lineNumber}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            explanation.agent === 'human' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                          }`}>
                            {explanation.agent === 'human' ? 'Human' : 'AI'}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteExplanation(explanation.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          title="Delete explanation"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm mb-2 text-gray-900">{explanation.content}</p>
                      <div className="text-xs text-gray-600">
                        {explanation.agent} - {new Date(explanation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Executions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-black">Execution Records</h3>
                <button
                  onClick={() => setShowExecutionForm(true)}
                  className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-900"
                >
                  Add Execution
                </button>
              </div>

              {showExecutionForm && (
                <div className="border border-gray-300 rounded p-4 mb-4 bg-white">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Add New Execution Record</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={executionForm.type}
                        onChange={(e) => setExecutionForm({...executionForm, type: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="container">Container</option>
                        <option value="blockchain">Blockchain</option>
                        <option value="local">Local</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={executionForm.status}
                        onChange={(e) => setExecutionForm({...executionForm, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    {executionForm.type === 'container' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Container Info</label>
                        <input
                          type="text"
                          value={executionForm.containerInfo}
                          onChange={(e) => setExecutionForm({...executionForm, containerInfo: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          placeholder="e.g., docker run python:3.9"
                        />
                      </div>
                    )}
                    {executionForm.type === 'blockchain' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chain Name</label>
                          <input
                            type="text"
                            value={executionForm.chainName}
                            onChange={(e) => setExecutionForm({...executionForm, chainName: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            placeholder="e.g., Ethereum Mainnet"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                          <input
                            type="text"
                            value={executionForm.txId}
                            onChange={(e) => setExecutionForm({...executionForm, txId: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            placeholder="0x..."
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={executionForm.notes}
                        onChange={(e) => setExecutionForm({...executionForm, notes: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        rows={3}
                        placeholder="Execution details, results, etc."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addExecution}
                        className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900"
                      >
                        Add Execution
                      </button>
                      <button
                        onClick={() => setShowExecutionForm(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {work.executions.map((execution) => (
                  <div key={execution.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium capitalize text-gray-900">{execution.type}</span>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          execution.status === 'success'
                            ? 'bg-gray-300 text-gray-900'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {execution.status}
                        </span>
                        <button
                          onClick={() => deleteExecution(execution.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          title="Delete execution"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {execution.containerInfo && (
                      <p className="text-xs text-gray-700">Container: {execution.containerInfo}</p>
                    )}
                    {execution.chainName && (
                      <p className="text-xs text-gray-700">
                        Chain: {execution.chainName} | TX: {execution.txId}
                      </p>
                    )}
                    {execution.notes && (
                      <p className="text-sm mt-2 text-gray-900">{execution.notes}</p>
                    )}
                    <div className="text-xs text-gray-600 mt-2">
                      {new Date(execution.executedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
