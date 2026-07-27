import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { searchPlaces } from '../api/locationApi'
import { usePlaceSearch } from './usePlaceSearch'
import type { LocationPlace } from '../api/locationApi'

vi.mock('../api/locationApi', () => ({
  searchPlaces: vi.fn(),
}))

const searchPlacesMock = vi.mocked(searchPlaces)

function place(id: string): LocationPlace {
  return {
    id,
    placeId: id,
    name: id,
    label: id,
    detail: '',
    postcode: '502103',
    latitude: 18.1,
    longitude: 78.8,
    countryCode: 'IN',
    locationType: 'APPROXIMATE',
  }
}

describe('usePlaceSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    searchPlacesMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits 400ms before searching', async () => {
    searchPlacesMock.mockResolvedValue([place('result-1')])
    const { result } = renderHook(() => usePlaceSearch('Siddipet', true))

    expect(searchPlacesMock).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTimeAsync(399))
    expect(searchPlacesMock).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTimeAsync(1))

    expect(result.current.suggestions).toEqual([place('result-1')])
  })

  it('ignores a late response from an older search', async () => {
    let resolveFirst: ((places: LocationPlace[]) => void) | undefined
    searchPlacesMock
      .mockImplementationOnce(() => new Promise<LocationPlace[]>((resolve) => {
        resolveFirst = resolve
      }))
      .mockResolvedValueOnce([place('new-result')])
    const { result, rerender } = renderHook(
      ({ query }) => usePlaceSearch(query, true),
      { initialProps: { query: 'Siddipet' } },
    )

    await act(async () => vi.advanceTimersByTimeAsync(400))
    rerender({ query: 'Hyderabad' })
    await act(async () => vi.advanceTimersByTimeAsync(400))
    await act(async () => resolveFirst?.([place('old-result')]))

    expect(result.current.suggestions).toEqual([place('new-result')])
  })

  it('surfaces the location service user message', async () => {
    searchPlacesMock.mockRejectedValue({
      userMessage: 'Google location search is not enabled for this website.',
    })
    const { result } = renderHook(() => usePlaceSearch('Siddipet denied', true))

    await act(async () => vi.advanceTimersByTimeAsync(400))

    expect(result.current.error).toMatch(/not enabled/i)
  })
})
