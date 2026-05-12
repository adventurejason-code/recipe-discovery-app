import { createContext, useContext, useState, useCallback } from 'react'
import { storageGetString, storageSetString } from '../utils/storage'

// views: 'search' | 'results' | 'detail' | 'favorites'
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() =>
    import.meta.env.VITE_SPOONACULAR_API_KEY || storageGetString('spoonacular_api_key') || ''
  )
  const [view, setView] = useState('search')
  const [viewParams, setViewParams] = useState({})

  const setApiKey = useCallback((key) => {
    storageSetString('spoonacular_api_key', key)
    setApiKeyState(key)
  }, [])

  const navigateTo = useCallback((viewName, params = {}) => {
    setView(viewName)
    setViewParams(params)
  }, [])

  return (
    <AppContext.Provider value={{ apiKey, setApiKey, view, viewParams, navigateTo }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
