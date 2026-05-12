import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function ApiKeyPrompt() {
  const { setApiKey } = useApp()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) {
      setError('Please enter your Spoonacular API key.')
      return
    }
    setApiKey(trimmed)
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-800">Recipe Discovery</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Enter your Spoonacular API key to get started. It will be stored locally in your browser.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Spoonacular API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError('') }}
              placeholder="Enter your API key"
              autoComplete="off"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Get Started
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Your key is stored only in your browser's localStorage and never sent to any server.
        </p>
      </div>
    </div>
  )
}
