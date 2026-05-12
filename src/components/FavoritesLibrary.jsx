import { useFavorites } from '../context/FavoritesContext'
import { useApp } from '../context/AppContext'
import RecipeCard from './RecipeCard'

export default function FavoritesLibrary() {
  const { favorites, loadError } = useFavorites()
  const { navigateTo } = useApp()

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mt-4">
        <p className="text-red-700">Could not load favorites from storage. Please check your browser's localStorage settings.</p>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🤍</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No saved recipes yet</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Search for recipes and tap the heart icon to save them here.
        </p>
        <button
          onClick={() => navigateTo('search')}
          className="mt-6 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
        >
          Find recipes
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {favorites.length} saved recipe{favorites.length !== 1 ? 's' : ''}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            score={null}
            onClick={() => navigateTo('detail', { recipeId: recipe.id, fromSearch: false })}
          />
        ))}
      </div>
    </div>
  )
}
