import { afterEach, describe, expect, it, vi } from 'vitest'
import { reverseGeocode, searchPlaces } from './locationApi'

afterEach(() => {
  vi.unstubAllGlobals()
})

function responseWith(features) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ features }),
  }
}

const siddipetFeature = {
  geometry: { coordinates: [78.8520128, 18.1017739] },
  properties: {
    osm_type: 'N',
    osm_id: 123,
    name: 'Siddipet',
    city: 'Siddipet',
    state: 'Telangana',
    postcode: '502 103',
    countrycode: 'IN',
  },
}

describe('location API', () => {
  it('normalizes place-search results and six-digit postcodes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responseWith([siddipetFeature])))

    const places = await searchPlaces('Siddipet unique test')

    expect(places[0]).toMatchObject({
      name: 'Siddipet',
      label: 'Siddipet, Telangana',
      postcode: '502103',
      latitude: 18.1017739,
      longitude: 78.8520128,
    })
  })

  it('reverse geocodes coordinates into a displayable area', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responseWith([siddipetFeature])))

    const place = await reverseGeocode(18.100525, 78.848279)

    expect(place.detail).toContain('502103')
    expect(place.label).toContain('Siddipet')
  })

  it('does not request incomplete search terms', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchPlaces('Si')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
