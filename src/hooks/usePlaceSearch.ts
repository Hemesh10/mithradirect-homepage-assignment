import { useEffect, useRef, useState } from 'react'
import { searchPlaces } from '../api/locationApi'
import type { LocationPlace } from '../api/locationApi'

export function usePlaceSearch(searchText: string, enabled = true) {
  const [suggestions, setSuggestions] = useState<LocationPlace[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(0)

  useEffect(() => {
    const query = searchText.trim()
    const currentRequest = ++requestId.current

    if (!enabled || query.length < 3) {
      setSuggestions([])
      setIsSearching(false)
      setError('')
      return undefined
    }

    setSuggestions([])
    setIsSearching(true)
    setError('')

    const timer = window.setTimeout(() => {
      searchPlaces(query)
        .then((places) => {
          if (currentRequest !== requestId.current) return
          setSuggestions(places)
        })
        .catch((searchError: unknown) => {
          if (currentRequest !== requestId.current) return
          setSuggestions([])
          const userMessage = typeof searchError === 'object' &&
            searchError !== null &&
            'userMessage' in searchError
            ? String(searchError.userMessage)
            : ''
          setError(
            userMessage ||
            'Location search is temporarily unavailable.',
          )
        })
        .finally(() => {
          if (currentRequest === requestId.current) setIsSearching(false)
        })
    }, 400)

    return () => window.clearTimeout(timer)
  }, [enabled, searchText])

  return { suggestions, isSearching, error }
}
