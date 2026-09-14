import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const FavoritesContext = createContext(null)
const STORAGE_KEY = 'ivy_favorites'

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
    catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggle = useCallback((listing) => {
    setFavorites(prev => {
      const id = listing.listing_id
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = listing
      return next
    })
  }, [])

  const isFavorite  = useCallback((id) => !!favorites[id], [favorites])
  const count       = Object.keys(favorites).length
  const list        = Object.values(favorites)

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite, count, list }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider')
  return ctx
}
