import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchHomeDiscovery } from '../api/homeApi'
import type { HomeDiscoveryData, HomeQuery } from '../api/homeAdapter'

export interface HomeDiscoveryState {
  data: HomeDiscoveryData | null
  error: DiscoveryRequestError | null
  refresh: () => void
  isLoading: boolean
  isRefreshing: boolean
}

export interface DiscoveryRequestError extends Error {
  userMessage?: string
}

export function useHomeDiscovery(query: HomeQuery): HomeDiscoveryState {
  const [data, setData] = useState<HomeDiscoveryData | null>(null)
  const [error, setError] = useState<DiscoveryRequestError | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const [isFetching, setIsFetching] = useState(true)
  const requestId = useRef(0)

  const refresh = useCallback(() => {
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const currentRequest = ++requestId.current

    setIsFetching(true)
    setError(null)

    fetchHomeDiscovery(query, { signal: controller.signal })
      .then((nextData) => {
        if (currentRequest !== requestId.current) return
        setData(nextData)
      })
      .catch((nextError) => {
        if (nextError?.name === 'AbortError' || currentRequest !== requestId.current) return
        setError(nextError instanceof Error ? nextError : new Error(String(nextError)))
      })
      .finally(() => {
        if (currentRequest === requestId.current) setIsFetching(false)
      })

    return () => controller.abort()
  }, [query.latitude, query.longitude, query.serviceArea, requestVersion])

  return {
    data,
    error,
    refresh,
    isLoading: isFetching && !data,
    isRefreshing: isFetching && Boolean(data),
  }
}
