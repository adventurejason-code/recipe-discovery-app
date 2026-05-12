import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useBudget } from '../context/BudgetContext'
import { useFavorites } from '../context/FavoritesContext'
import { getRecipeInfo } from '../services/spoonacular'

const DISPLAY_NUTRIENTS = [
  'Calories', 'Fat', 'Saturated Fat', 'Carbohydrates', 'Sugar',
  'Fiber', 'Protein', 'Sodium', 'Cholesterol',
]

function NutritionPanel({ nutrients }) {
  if (!nutrients || nutrients.length === 0) return null

  const listed = DISPLAY_NUTRIENTS
    .map(name => nutrients.find(n => n.name === name))
    .filter(Boolean)

  const remaining = nutrients.filter(n => !DISPLAY_NUTRIENTS.includes(n.name))

  const all = [...listed, ...remaining]

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-800 mb-3">Nutrition</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {all.map(n => (
          <div key={n.name} className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">{n.name}</p>
            <p className="text-sm font-semibold text-gray-800">
              {typeof n.amount === 'number' ? `${Math.round(n.amount * 10) / 10}` : n.amount}
              {n.unit ? ` ${n.unit}` : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RecipeDetail() {
  const { apiKey, viewParams, navigateTo } = useApp()
  const { consumeCall, exhaustBudget, remaining } = useBudget()
  const { isFavorited, saveFavorite, removeFavorite, getFavorite } = useFavorites()

  const { recipeId, fromSearch } = viewParams
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!recipeId) return

    // Load from favorites if available (no API call)
    const saved = getFavorite(recipeId)
    if (saved) {
      setRecipe(saved)
      setLoading(false)
      return
    }

    // Budget check before making the call
    if (remaining <= 0) {
      setError('Daily API limit reached. Cannot load recipe details.')
      setLoading(false)
      return
    }

    const allowed = consumeCall()
    if (!allowed) {
      setError('Daily API limit reached. Cannot load recipe details.')
      setLoading(false)
      return
    }

    getRecipeInfo(apiKey, recipeId)
      .then(data => {
        setRecipe(data)
        setLoading(false)
      })
      .catch(err => {
        if (err.status === 402) exhaustBudget()
        setError("Couldn't load this recipe. Please try again.")
        setLoading(false)
      })
  }, [recipeId])

  function goBack() {
    if (fromSearch) {
      navigateTo('results')
    } else {
      navigateTo('favorites')
    }
  }

  const saved = recipe ? isFavorited(recipe.id) : false

  function toggleFavorite() {
    if (!recipe) return
    if (saved) {
      removeFavorite(recipe.id)
    } else {
      saveFavorite(recipe)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-spin">⟳</div>
          <p className="text-gray-500">Loading recipe…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <button onClick={goBack} className="text-sm text-amber-600 hover:text-amber-800 font-medium mb-6 flex items-center gap-1">
          ← Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!recipe) return null

  const nutrients = recipe.nutrition?.nutrients ?? []
  const instructions = recipe.analyzedInstructions?.[0]?.steps ?? []
  const ingredients = recipe.extendedIngredients ?? []

  return (
    <div className="max-w-2xl mx-auto py-2">
      <button onClick={goBack} className="text-sm text-amber-600 hover:text-amber-800 font-medium mb-5 flex items-center gap-1">
        ← Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title} className="w-full h-56 object-cover" />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{recipe.title}</h1>
            <button
              type="button"
              onClick={toggleFavorite}
              className={`flex-shrink-0 text-2xl transition-transform active:scale-90 ${saved ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'}`}
              title={saved ? 'Remove from Favorites' : 'Save to Favorites'}
            >
              {saved ? '♥' : '♡'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {recipe.readyInMinutes && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                ⏱ {recipe.readyInMinutes} min
              </span>
            )}
            {recipe.servings && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                🍽 {recipe.servings} servings
              </span>
            )}
            {recipe.vegetarian && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Vegetarian</span>}
            {recipe.vegan && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Vegan</span>}
            {recipe.glutenFree && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Gluten Free</span>}
            {recipe.dairyFree && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Dairy Free</span>}
          </div>
        </div>
      </div>

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Ingredients</h3>
          <ul className="space-y-1.5">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                <span>
                  {ing.measures?.metric
                    ? `${Math.round(ing.measures.metric.amount * 100) / 100} ${ing.measures.metric.unitShort} `
                    : ing.original
                      ? ''
                      : ''}
                  <span className="font-medium">{ing.name}</span>
                  {ing.measures?.metric && ing.name && ing.original && ing.original !== ing.name
                    ? ''
                    : ing.original && !ing.measures?.metric
                      ? ` — ${ing.original}`
                      : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions */}
      {instructions.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Instructions</h3>
          <ol className="space-y-4">
            {instructions.map(step => (
              <li key={step.number} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {step.number}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{step.step}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : recipe.instructions ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Instructions</h3>
          <p className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
        </div>
      ) : null}

      {/* Nutrition */}
      {nutrients.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
          <NutritionPanel nutrients={nutrients} />
        </div>
      )}

      {/* Save button (bottom) */}
      <button
        type="button"
        onClick={toggleFavorite}
        className={`w-full py-3 rounded-xl font-semibold transition-colors ${
          saved
            ? 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'
            : 'bg-amber-500 hover:bg-amber-600 text-white'
        }`}
      >
        {saved ? '♥ Saved to Favorites' : '♡ Save to Favorites'}
      </button>
    </div>
  )
}
