'use client'

import { useState } from 'react'
import { generateCodeTEIXML, generateSHA3Hash, generateCodeTEIURI, parseCodeTEIXML, type CodeWorkInput } from '@/lib/codetei'

export default function RegisterPage() {
  const [formData, setFormData] = useState<CodeWorkInput>({
    title: '',
    author: '',
    sourceCode: '',
    language: 'text'
  })
  const [codeteiXML, setCodeteiXML] = useState('')
  const [hash, setHash] = useState('')
  const [uri, setURI] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof CodeWorkInput, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    // Generate hash and URI immediately when source code is entered
    if (field === 'sourceCode' && value) {
      const newHash = generateSHA3Hash(value)
      setHash(newHash)
      setURI(generateCodeTEIURI(newHash))
      
      // Generate XML immediately when source code is entered
      const xml = generateCodeTEIXML(newFormData)
      setCodeteiXML(xml)
    } else if (field === 'sourceCode' && !value) {
      setHash('')
      setURI('')
      setCodeteiXML('')
    } else if (newFormData.sourceCode) {
      // Update XML when other fields change (if source code exists)
      const xml = generateCodeTEIXML(newFormData)
      setCodeteiXML(xml)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (!content) return

      // Try to parse as CodeTEI XML
      const parsed = parseCodeTEIXML(content)
      if (parsed) {
        setFormData(parsed)
        setCodeteiXML(content)
        const newHash = generateSHA3Hash(parsed.sourceCode)
        setHash(newHash)
        setURI(generateCodeTEIURI(newHash))
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/code-works', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sha3Hash: hash,
          codeteiXml: codeteiXML
        }),
      })

      if (response.ok) {
        alert('Code work registered successfully!')
        // Reset form
        setFormData({ title: '', author: '', sourceCode: '', language: 'text' })
        setCodeteiXML('')
        setHash('')
        setURI('')
      } else {
        throw new Error('Failed to register code work')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to register code work. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadXML = () => {
    if (!codeteiXML) return
    
    const blob = new Blob([codeteiXML], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formData.title.replace(/[^a-zA-Z0-9]/g, '_') || 'code_work'}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          <h1 className="text-3xl font-bold text-black">Register Code Work</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-6">Work Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">
                    Work Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter work title (optional)..."
                  />
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-bold text-gray-900 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter author name (optional)..."
                  />
                </div>

                <div>
                  <label htmlFor="sourceCode" className="block text-sm font-bold text-gray-900 mb-2">
                    Source Code
                  </label>
                  <textarea
                    id="sourceCode"
                    value={formData.sourceCode}
                    onChange={(e) => handleInputChange('sourceCode', e.target.value)}
                    className="w-full h-64 border border-gray-300 rounded-md px-4 py-3 font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter your source code here..."
                    required
                  />
                </div>

                {uri && (
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <p className="text-sm font-bold text-gray-900 mb-2">CodeTEI URI</p>
                    <code className="text-gray-800 text-sm break-all font-mono bg-gray-100 p-2 rounded block">{uri}</code>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.sourceCode}
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-md hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? 'Registering...' : 'Register Code Work'}
                </button>
              </form>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-black mb-4">Upload CodeTEI XML</h3>
              <p className="text-gray-700 text-sm mb-4">Or upload an existing CodeTEI XML file</p>
              <input
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">CodeTEI XML Preview</h3>
                {codeteiXML && (
                  <button
                    onClick={downloadXML}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                  >
                    Download XML
                  </button>
                )}
              </div>
              <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
                <pre className="p-4 h-96 overflow-auto text-xs text-gray-900 font-mono">
                  {codeteiXML || 'CodeTEI XML will appear here as you enter source code...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}