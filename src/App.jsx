import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { BudgetProvider } from './context/BudgetContext'
import { FavoritesProvider } from './context/FavoritesContext'
import ApiKeyPrompt from './components/ApiKeyPrompt'
import BudgetBanner from './components/BudgetBanner'
import SearchForm from './components/SearchForm'
import SearchResults from './components/SearchResults'
import RecipeDetail from './components/RecipeDetail'
import FavoritesLibrary from './components/FavoritesLibrary'
import PriorityRankModal from './components/PriorityRankModal'
import { useBudget } from './context/BudgetContext'
import { complexSearch } from './services/spoonacular'
import { computeScores } from './utils/scoring'

function Nav() {
  const { view, navigateTo } = useApp()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigateTo('search')}
          className="text-lg font-bold text-amber-600 hover:text-amber-700 flex items-center gap-2"
        >
          🍽️ Recipe Discovery
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => navigateTo('search')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'search' || view === 'results'
                ? 'bg-amber-100 text-amber-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => navigateTo('favorites')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'favorites'
                ? 'bg-amber-100 text-amber-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Favorites
          </button>
        </div>
      </div>
    </nav>
  )
}

function MainContent() {
  const { apiKey, view, viewParams, navigateTo } = useApp()
  const { consumeCall, exhaustBudget, remaining } = useBudget()

  const [searchResults, setSearchResults] = useState([])
  const [scoredResults, setScoredResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [resultsBroadened, setResultsBroadened] = useState(false)
  const [searchedWithIngredients, setSearchedWithIngredients] = useState(false)

  // State for priority rank modal
  const [pendingSearch, setPendingSearch] = useState(null)

  async function executeSearch(searchParams, preferredTargets, ranking) {
    setSearchLoading(true)
    setSearchError(null)
    setResultsBroadened(false)

    const hasIngredients = Boolean(searchParams.ingredients)
    setSearchedWithIngredients(hasIngredients)

    try {
      // Primary search: rank by most of the user's ingredients used first
      const primaryParams = { ...searchParams, sort: 'max-used-ingredients' }
      let results = await complexSearch(apiKey, primaryParams)

      // Fallback: if zero results, retry with a plain text query from ingredients
      // and no other filters so we always surface something relevant
      if (results.length === 0 && hasIngredients) {
        const allowed = consumeCall()
        if (allowed) {
          const fallbackQuery = searchParams.ingredients.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()
          results = await complexSearch(apiKey, { query: fallbackQuery, sort: 'popularity' })
          if (results.length > 0) setResultsBroadened(true)
        }
      }

      setSearchResults(results)

      const preferredKeys = Object.keys(preferredTargets)
      if (preferredKeys.length > 0 && ranking) {
        const scored = computeScores(results, preferredTargets, ranking)
        setScoredResults(scored)
      } else {
        setScoredResults(null)
      }

      navigateTo('results')
    } catch (err) {
      if (err.status === 402) exhaustBudget()
      setSearchError(err.status === 402
        ? 'Spoonacular quota exceeded. Search will resume tomorrow.'
        : 'Search failed. Please check your API key and try again.')
    } finally {
      setSearchLoading(false)
    }
  }

  function handleSearch(searchParams, preferredTargets) {
    if (remaining <= 0) return

    const preferredKeys = Object.keys(preferredTargets)

    if (preferredKeys.length > 1) {
      // Need ranking — show modal
      setPendingSearch({ searchParams, preferredTargets })
      return
    }

    // 0 or 1 preferred target — no ranking needed, go straight to search
    const allowed = consumeCall()
    if (!allowed) return

    const ranking = preferredKeys.length === 1 ? preferredKeys : []
    executeSearch(searchParams, preferredTargets, ranking)
  }

  function handleRankingConfirmed(ranking) {
    const { searchParams, preferredTargets } = pendingSearch
    setPendingSearch(null)

    const allowed = consumeCall()
    if (!allowed) return

    executeSearch(searchParams, preferredTargets, ranking)
  }

  if (!apiKey) return <ApiKeyPrompt />

  return (
    <>
      {pendingSearch && (
        <PriorityRankModal
          preferredKeys={Object.keys(pendingSearch.preferredTargets)}
          onConfirm={handleRankingConfirmed}
          onCancel={() => setPendingSearch(null)}
        />
      )}

      <Nav />
      <BudgetBanner />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {searchLoading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">Searching for recipes…</p>
          </div>
        )}

        {!searchLoading && searchError && view === 'results' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-4 text-center">
            <p className="text-red-700 font-medium">{searchError}</p>
            <button
              onClick={() => { setSearchError(null); navigateTo('search') }}
              className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
            >
              Back to search
            </button>
          </div>
        )}

        {/* SearchForm stays mounted so its state survives view changes */}
        <div className={searchLoading || searchError || (view !== 'search') ? 'hidden' : ''}>
          <SearchForm onSearch={handleSearch} />
        </div>

        {!searchLoading && !searchError && (
          <>
            {view === 'results' && (
              <SearchResults
                results={searchResults}
                scoredResults={scoredResults}
                broadened={resultsBroadened}
                searchedWithIngredients={searchedWithIngredients}
                onNewSearch={() => navigateTo('search')}
              />
            )}
            {view === 'detail' && <RecipeDetail />}
            {view === 'favorites' && <FavoritesLibrary />}
          </>
        )}
      </main>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BudgetProvider>
        <FavoritesProvider>
          <div className="min-h-screen bg-gray-50">
            <MainContent />
          </div>
        </FavoritesProvider>
      </BudgetProvider>
    </AppProvider>
  )
}
