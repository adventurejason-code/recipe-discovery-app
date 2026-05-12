import { createContext, useContext, useState, useCallback } from 'react'
import { storageGet, storageSet } from '../utils/storage'

const KEY = 'recipe_favorites'

function loadFavorites() {
  const data = storageGet(KEY)
  return Array.isArray(data) ? data : []
}

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => loadFavorites())
  const [loadError, setLoadError] = useState(false)

  const isFavorited = useCallback(
    (id) => favorites.some((r) => r.id === id),
    [favorites]
  )

  const saveFavorite = useCallback(
    (recipe) => {
      setFavorites((prev) => {
        if (prev.some((r) => r.id === recipe.id)) return prev
        const next = [...prev, recipe]
        storageSet(KEY, next)
        return next
      })
    },
    []
  )

  const removeFavorite = useCallback(
    (id) => {
      setFavorites((prev) => {
        const next = prev.filter((r) => r.id !== id)
        storageSet(KEY, next)
        return next
      })
    },
    []
  )

  const getFavorite = useCallback(
    (id) => favorites.find((r) => r.id === id) ?? null,
    [favorites]
  )

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorited, saveFavorite, removeFavorite, getFavorite, loadError }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
