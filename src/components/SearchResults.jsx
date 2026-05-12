import RecipeCard from './RecipeCard'
import { useApp } from '../context/AppContext'

export default function SearchResults({ results, scoredResults, broadened, searchedWithIngredients, onNewSearch }) {
  const { navigateTo } = useApp()

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h2>
        <p className="text-gray-500 max-w-sm mx-auto text-sm">
          Try removing a dietary restriction, widening a nutritional range, or reducing the number of required ingredients.
        </p>
        <button
          onClick={onNewSearch}
          className="mt-6 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
        >
          Modify search
        </button>
      </div>
    )
  }

  // scoredResults is [{recipe, score}] if preferred targets exist, else null
  const items = scoredResults
    ? scoredResults
    : results.map(r => ({ recipe: r, score: null }))

  return (
    <div>
      {broadened && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          No exact matches for your ingredients — showing the closest alternatives we could find.
        </div>
      )}
      {!broadened && searchedWithIngredients && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          Results may not use all your ingredients. Sorted from most to fewest of your ingredients used.
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {items.length} recipe{items.length !== 1 ? 's' : ''} found
        </h2>
        <button
          onClick={onNewSearch}
          className="text-sm text-amber-600 hover:text-amber-800 font-medium transition-colors"
        >
          ← New search
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ recipe, score }) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            score={score}
            onClick={() => navigateTo('detail', { recipeId: recipe.id, fromSearch: true })}
          />
        ))}
      </div>
    </div>
  )
}
