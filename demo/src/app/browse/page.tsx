'use client'

import { useState, useEffect } from 'react'
import { generateCodeTEIURI } from '@/lib/codetei'

interface CodeWork {
  id: string
  title: string
  author: string
  sourceCode: string
  sha3Hash: string
  codeteiXml: string
  createdAt: string
  _count: {
    explanations: number
    executions: number
  }
}

export default function BrowsePage() {
  const [codeWorks, setCodeWorks] = useState<CodeWork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCodeWorks()
  }, [])

  const fetchCodeWorks = async () => {
    try {
      const response = await fetch('/api/code-works')
      if (response.ok) {
        const data = await response.json()
        setCodeWorks(data)
      }
    } catch (error) {
      console.error('Error fetching code works:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewXML = (work: CodeWork) => {
    const blob = new Blob([work.codeteiXml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto p-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading code works...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
          </div>
          <h1 className="text-3xl font-bold text-black">Browse Code Works</h1>
        </div>

        {codeWorks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">No Code Works Yet</h2>
            <p className="text-gray-700 mb-8">Start by registering your first code work</p>
            <a
              href="/register"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors font-medium"
            >
              Register First Code Work
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {codeWorks.map((work) => (
              <div key={work.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-black mb-2">{work.title}</h2>
                    <p className="text-gray-700 text-lg mb-2">by {work.author}</p>
                    <p className="text-sm text-gray-600">
                      Registered on {new Date(work.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white border border-gray-200 rounded-md p-3 mb-2">
                      <div className="text-sm font-bold text-gray-900 mb-1">Annotations</div>
                      <div className="text-lg font-bold text-gray-800">{work._count.explanations}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-md p-3">
                      <div className="text-sm font-bold text-gray-900 mb-1">Executions</div>
                      <div className="text-lg font-bold text-gray-800">{work._count.executions}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-900 mb-2">CodeTEI URI</p>
                  <code className="text-gray-800 text-sm bg-white border border-gray-200 p-3 rounded-md block break-all font-mono">
                    {generateCodeTEIURI(work.sha3Hash)}
                  </code>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-900 mb-2">Source Code Preview</p>
                  <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                    <pre className="p-4 text-sm text-gray-900 overflow-auto max-h-32 font-mono">
                      {work.sourceCode.length > 200 
                        ? work.sourceCode.substring(0, 200) + '...' 
                        : work.sourceCode}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`/work/${work.sha3Hash}`}
                    className="bg-gray-800 text-white px-6 py-3 rounded-md text-sm hover:bg-gray-900 transition-colors font-medium"
                  >
                    View & Annotate
                  </a>
                  <button
                    onClick={() => viewXML(work)}
                    className="bg-gray-600 text-white px-6 py-3 rounded-md text-sm hover:bg-gray-700 transition-colors font-medium"
                  >
                    View XML
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}