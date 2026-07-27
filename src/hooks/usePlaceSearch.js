import { useEffect, useState } from 'react'
import { searchPlaces } from '../api/locationApi'

export function usePlaceSearch(searchText, enabled = true) {
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const query = searchText.trim()
    if (!enabled || query.length < 3) {
      setSuggestions([])
      setIsSearching(false)
      setError('')
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setIsSearching(true)
      setError('')

      searchPlaces(query, { signal: controller.signal })
        .then(setSuggestions)
        .catch((searchError) => {
          if (searchError?.name === 'AbortError') return
          setSuggestions([])
          setError('Area search is temporarily unavailable.')
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false)
        })
    }, 650)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [enabled, searchText])

  return { suggestions, isSearching, error }
}
