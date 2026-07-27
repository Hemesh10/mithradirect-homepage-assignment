import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchHomeDiscovery } from '../api/homeApi'

export function useHomeDiscovery(query) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
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
        setError(nextError)
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
