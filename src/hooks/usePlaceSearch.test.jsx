import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { searchPlaces } from '../api/locationApi'
import { usePlaceSearch } from './usePlaceSearch'

vi.mock('../api/locationApi', () => ({
  searchPlaces: vi.fn(),
}))

describe('usePlaceSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    searchPlaces.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits 400ms before searching', async () => {
    searchPlaces.mockResolvedValue([{ id: 'result-1' }])
    const { result } = renderHook(() => usePlaceSearch('Siddipet', true))

    expect(searchPlaces).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTimeAsync(399))
    expect(searchPlaces).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTimeAsync(1))

    expect(result.current.suggestions).toEqual([{ id: 'result-1' }])
  })

  it('ignores a late response from an older search', async () => {
    let resolveFirst
    searchPlaces
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveFirst = resolve
      }))
      .mockResolvedValueOnce([{ id: 'new-result' }])
    const { result, rerender } = renderHook(
      ({ query }) => usePlaceSearch(query, true),
      { initialProps: { query: 'Siddipet' } },
    )

    await act(async () => vi.advanceTimersByTimeAsync(400))
    rerender({ query: 'Hyderabad' })
    await act(async () => vi.advanceTimersByTimeAsync(400))
    await act(async () => resolveFirst([{ id: 'old-result' }]))

    expect(result.current.suggestions).toEqual([{ id: 'new-result' }])
  })

  it('surfaces the location service user message', async () => {
    searchPlaces.mockRejectedValue({
      userMessage: 'Google location search is not enabled for this website.',
    })
    const { result } = renderHook(() => usePlaceSearch('Siddipet denied', true))

    await act(async () => vi.advanceTimersByTimeAsync(400))

    expect(result.current.error).toMatch(/not enabled/i)
  })
})
