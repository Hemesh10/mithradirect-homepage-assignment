import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useHomeDiscovery } from './useHomeDiscovery'
import { fetchHomeDiscovery } from '../api/homeApi'

vi.mock('../api/homeApi', () => ({
  fetchHomeDiscovery: vi.fn(),
}))

const query = {
  serviceArea: '502103',
  latitude: 18.100525,
  longitude: 78.848279,
}

describe('useHomeDiscovery', () => {
  beforeEach(() => {
    fetchHomeDiscovery.mockReset()
  })

  it('moves from loading to a successful data state', async () => {
    fetchHomeDiscovery.mockResolvedValue({ summary: { vendorCount: 2 } })

    const { result } = renderHook(() => useHomeDiscovery(query))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data.summary.vendorCount).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it('retains existing data while a refresh is in flight', async () => {
    let resolveRefresh
    fetchHomeDiscovery
      .mockResolvedValueOnce({ summary: { vendorCount: 2 } })
      .mockImplementationOnce(
        () => new Promise((resolve) => {
          resolveRefresh = resolve
        }),
      )

    const { result } = renderHook(() => useHomeDiscovery(query))
    await waitFor(() => expect(result.current.data).not.toBeNull())

    act(() => result.current.refresh())
    await waitFor(() => expect(result.current.isRefreshing).toBe(true))
    expect(result.current.data.summary.vendorCount).toBe(2)

    await act(async () => resolveRefresh({ summary: { vendorCount: 3 } }))
    await waitFor(() => expect(result.current.isRefreshing).toBe(false))
    expect(result.current.data.summary.vendorCount).toBe(3)
  })

  it('aborts the previous request when the location changes', async () => {
    const signals = []
    fetchHomeDiscovery.mockImplementation(
      (_query, { signal }) =>
        new Promise((resolve, reject) => {
          signals.push(signal)
          signal.addEventListener('abort', () => {
            const error = new Error('aborted')
            error.name = 'AbortError'
            reject(error)
          })
        }),
    )

    const { rerender } = renderHook(
      ({ activeQuery }) => useHomeDiscovery(activeQuery),
      { initialProps: { activeQuery: query } },
    )

    rerender({ activeQuery: { ...query, serviceArea: '500001' } })
    expect(signals[0].aborted).toBe(true)
  })
})
