import { useFavorites } from '../context/FavoritesContext'

function ScoreIndicator({ score }) {
  if (score === null) return null
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? 'text-green-600 bg-green-50' : pct >= 50 ? 'text-amber-600 bg-amber-50' : 'text-gray-500 bg-gray-50'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {pct}% match
    </span>
  )
}

function getCalories(recipe) {
  if (recipe.nutrition?.nutrients) {
    return recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount ?? null
  }
  return recipe.calories ?? null
}

function getDietTags(recipe) {
  const tags = []
  if (recipe.vegetarian) tags.push('vegetarian')
  if (recipe.vegan) tags.push('vegan')
  if (recipe.glutenFree) tags.push('gluten free')
  if (recipe.dairyFree) tags.push('dairy free')
  return tags.slice(0, 3)
}

export default function RecipeCard({ recipe, score = null, onClick }) {
  const { isFavorited } = useFavorites()
  const cal = getCalories(recipe)
  const tags = getDietTags(recipe)
  const saved = isFavorited(recipe.id)

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left hover:shadow-md hover:border-amber-200 transition-all group w-full"
    >
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-40 bg-amber-50 flex items-center justify-center text-4xl">🍽️</div>
      )}

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{recipe.title}</h3>
          {saved && <span className="text-amber-500 flex-shrink-0" title="Saved to Favorites">♥</span>}
        </div>

        <div className="flex flex-wrap gap-1 items-center">
          {typeof recipe.usedIngredientCount === 'number' && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {recipe.usedIngredientCount} ingredient{recipe.usedIngredientCount !== 1 ? 's' : ''} matched
            </span>
          )}
          {cal !== null && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {Math.round(cal)} kcal
            </span>
          )}
          <ScoreIndicator score={score} />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
