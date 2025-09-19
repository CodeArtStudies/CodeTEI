export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">CodeTEI Corpus</h1>
          <p className="text-gray-700 text-lg">Manage and annotate source code works with CodeTEI XML</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4">Register Code Work</h2>
              <p className="text-gray-700 mb-6">Register source code as CodeTEI XML with automatic hash generation</p>
              <a href="/register" className="inline-block bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors">
                Register Code Work
              </a>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4">Browse Code Works</h2>
              <p className="text-gray-700 mb-6">View and annotate registered code works with AI explanations</p>
              <a href="/browse" className="inline-block bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors">
                Browse Code Works
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}