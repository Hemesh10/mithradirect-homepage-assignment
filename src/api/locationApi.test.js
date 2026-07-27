import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LocationServiceError,
  normalizeGoogleResult,
  reverseGeocode,
  searchPlaces,
} from './locationApi'

const searchByTextMock = vi.fn()
const fetchMock = vi.fn()

function googleResult({
  placeId = 'siddipet-place',
  formattedAddress = 'Siddipet, Telangana 502103, India',
  latitude = 18.1017739,
  longitude = 78.8520128,
  postcode = '502103',
  countryCode = 'IN',
  locationType = 'APPROXIMATE',
} = {}) {
  return {
    id: placeId,
    placeId,
    displayName: 'Siddipet',
    formattedAddress,
    addressComponents: [
      { longText: 'Siddipet', shortText: 'Siddipet', types: ['locality'] },
      { longText: 'Telangana', shortText: 'TS', types: ['administrative_area_level_1'] },
      ...(postcode ? [{ longText: postcode, shortText: postcode, types: ['postal_code'] }] : []),
      { longText: 'India', shortText: countryCode, types: ['country'] },
    ],
    location: {
      lat: () => latitude,
      lng: () => longitude,
    },
    granularity: locationType,
  }
}

beforeEach(() => {
  searchByTextMock.mockReset()
  fetchMock.mockReset()
  global.fetch = fetchMock
  window.google = {
    maps: {
      importLibrary: vi.fn().mockResolvedValue({
        Place: class {
          static searchByText(request) {
            return searchByTextMock(request)
          }
        },
      }),
    },
  }
})

describe('Google location API', () => {
  it('normalizes address components, coordinates, and location accuracy', () => {
    const place = normalizeGoogleResult(googleResult({ locationType: 'ROOFTOP' }))

    expect(place).toMatchObject({
      id: 'siddipet-place',
      placeId: 'siddipet-place',
      name: 'Siddipet',
      label: 'Siddipet, Telangana 502103, India',
      postcode: '502103',
      latitude: 18.1017739,
      longitude: 78.8520128,
      countryCode: 'IN',
      locationType: 'ROOFTOP',
    })
  })

  it('searches with the new Place class and omits non-Indian results', async () => {
    searchByTextMock.mockResolvedValue({
      places: [
        googleResult({ placeId: 'india-result' }),
        googleResult({ placeId: 'other-result', countryCode: 'US' }),
      ],
    })

    const places = await searchPlaces('Siddipet google result test')

    expect(places).toHaveLength(1)
    expect(places[0].placeId).toBe('india-result')
    expect(searchByTextMock).toHaveBeenCalledWith(expect.objectContaining({
      textQuery: 'Siddipet google result test',
      fields: expect.arrayContaining(['addressComponents', 'location']),
      region: 'in',
      maxResultCount: 5,
    }))
  })

  it('reverse geocodes with Geocoding API v4 to the first result with a pincode', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        results: [
          googleResult({ placeId: 'broad-result', postcode: '' }),
          googleResult({ placeId: 'postal-result' }),
        ],
      }),
    })

    const place = await reverseGeocode(18.100525, 78.848279)

    expect(place.placeId).toBe('postal-result')
    expect(place.postcode).toBe('502103')
    const requestUrl = fetchMock.mock.calls[0][0]
    expect(requestUrl).toBeInstanceOf(URL)
    expect(requestUrl.origin).toBe('https://geocode.googleapis.com')
    expect(requestUrl.pathname).toBe('/v4/geocode/location/18.100525,78.848279')
    expect(requestUrl.searchParams.has('key')).toBe(true)
  })

  it('rejects reverse-geocoded results without a usable postcode', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        results: [googleResult({ postcode: '' })],
      }),
    })

    await expect(reverseGeocode(18.100525, 78.848279)).rejects.toMatchObject({
      code: 'NO_POSTCODE',
      userMessage: expect.stringMatching(/six-digit pincode/i),
    })
  })

  it('maps Geocoding v4 permission errors to an actionable location error', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({
        error: {
          code: 403,
          status: 'PERMISSION_DENIED',
          message: 'API key rejected',
        },
      }),
    })

    await expect(reverseGeocode(18.100525, 78.848279)).rejects.toMatchObject({
      code: 'REQUEST_DENIED',
      userMessage: expect.stringMatching(/demo key and enabled APIs/i),
    })
  })

  it('normalizes legacy address shapes for defensive compatibility', () => {
    const place = normalizeGoogleResult({
      place_id: 'legacy-result',
      formatted_address: 'Siddipet, Telangana 502103, India',
      address_components: [
        { long_name: 'Siddipet', short_name: 'Siddipet', types: ['locality'] },
        { long_name: '502103', short_name: '502103', types: ['postal_code'] },
        { long_name: 'India', short_name: 'IN', types: ['country'] },
      ],
      geometry: {
        location: { lat: 18.1017739, lng: 78.8520128 },
        location_type: 'ROOFTOP',
      },
    })

    expect(place).toMatchObject({
      placeId: 'legacy-result',
      postcode: '502103',
      countryCode: 'IN',
      locationType: 'ROOFTOP',
    })
  })

  it('maps Google quota failures to an actionable location error', async () => {
    searchByTextMock.mockRejectedValue({ code: 'RESOURCE_EXHAUSTED' })

    await expect(searchPlaces('Unique quota failure address')).rejects.toEqual(
      expect.objectContaining({
        name: 'LocationServiceError',
        code: 'OVER_QUERY_LIMIT',
        userMessage: expect.stringMatching(/temporarily busy/i),
      }),
    )
  })

  it('does not request incomplete search terms', async () => {
    await expect(searchPlaces('Si')).resolves.toEqual([])
    expect(searchByTextMock).not.toHaveBeenCalled()
  })

  it('exports a typed location-service error boundary', () => {
    const error = new LocationServiceError('Failure', {
      code: 'REQUEST_DENIED',
      userMessage: 'Not enabled',
    })

    expect(error).toMatchObject({
      name: 'LocationServiceError',
      code: 'REQUEST_DENIED',
      userMessage: 'Not enabled',
    })
  })
})
