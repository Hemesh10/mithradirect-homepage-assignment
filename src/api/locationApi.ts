const GOOGLE_MAPS_SCRIPT_ID = 'mithra-google-maps'
const GOOGLE_MAPS_CALLBACK = '__mithraGoogleMapsReady'
const INDIA_COUNTRY_CODE = 'IN'
const GEOCODING_V4_BASE_URL = 'https://geocode.googleapis.com/v4/geocode/location'
const searchCache = new Map<string, LocationPlace[]>()

type LocationErrorCode =
  | 'CONFIG_ERROR'
  | 'LOAD_ERROR'
  | 'ZERO_RESULTS'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR'
  | 'ERROR'
  | 'NO_POSTCODE'

interface GoogleAddressComponent {
  types?: string[]
  longText?: string
  shortText?: string
  long_name?: string
  short_name?: string
}

interface GoogleLocation {
  lat?: number | (() => number)
  lng?: number | (() => number)
  latitude?: number
  longitude?: number
}

interface GoogleResult {
  id?: string
  placeId?: string
  place_id?: string
  displayName?: string | { text?: string }
  formattedAddress?: string
  formatted_address?: string
  addressComponents?: GoogleAddressComponent[]
  address_components?: GoogleAddressComponent[]
  location?: GoogleLocation
  geometry?: {
    location?: GoogleLocation
    location_type?: string
  }
  granularity?: string
}

interface PlaceSearchResponse {
  places?: GoogleResult[]
}

interface PlacesLibrary {
  Place: {
    searchByText(request: {
      textQuery: string
      fields: string[]
      language: string
      region: string
      maxResultCount: number
    }): Promise<PlaceSearchResponse>
  }
}

interface GoogleMapsApi {
  importLibrary(name: 'places'): Promise<PlacesLibrary>
}

interface GoogleMapsGlobal {
  maps?: GoogleMapsApi
}

declare global {
  interface Window {
    google?: GoogleMapsGlobal
    __mithraGoogleMapsReady?: () => void
  }
}

export interface LocationPlace {
  id: string
  placeId: string
  name: string
  label: string
  detail: string
  postcode: string
  latitude: number
  longitude: number
  countryCode: string
  locationType: string
}

let mapsPromise: Promise<GoogleMapsApi> | null = null
let placesLibraryPromise: Promise<PlacesLibrary> | null = null

export class LocationServiceError extends Error {
  code: LocationErrorCode
  userMessage: string

  constructor(
    message: string,
    {
      code = 'UNKNOWN_ERROR',
      userMessage = '',
    }: { code?: LocationErrorCode, userMessage?: string } = {},
  ) {
    super(message)
    this.name = 'LocationServiceError'
    this.code = code
    this.userMessage = userMessage
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return String(error || '')
}

function locationError(
  code: LocationErrorCode,
  cause?: unknown,
): LocationServiceError {
  const messages: Record<LocationErrorCode, string> = {
    CONFIG_ERROR: 'Location search has not been configured yet.',
    LOAD_ERROR: 'Google Maps could not be loaded. Check your connection and try again.',
    ZERO_RESULTS: 'No matching Indian addresses were found.',
    OVER_QUERY_LIMIT: 'Location search is temporarily busy. Please try again shortly.',
    REQUEST_DENIED: 'Google rejected this location request. Check the demo key and enabled APIs.',
    INVALID_REQUEST: 'That location search could not be understood.',
    UNKNOWN_ERROR: 'Google location search had a temporary problem. Please try again.',
    ERROR: 'Google location search timed out. Please try again.',
    NO_POSTCODE: 'Choose a more specific address that includes a six-digit pincode.',
  }
  return new LocationServiceError(
    errorMessage(cause) || code,
    {
      code,
      userMessage: messages[code],
    },
  )
}

function getApiKey() {
  return String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim()
}

function googleStatus(error: unknown): LocationErrorCode {
  const record = typeof error === 'object' && error !== null
    ? error as Record<string, unknown>
    : null
  const candidate = record?.status || record?.code || record?.message || error
  const status = String(candidate || 'UNKNOWN_ERROR').toUpperCase()
  return status.includes('ZERO_RESULTS') ? 'ZERO_RESULTS'
    : status.includes('OVER_QUERY_LIMIT') || status.includes('RESOURCE_EXHAUSTED')
      ? 'OVER_QUERY_LIMIT'
      : status.includes('REQUEST_DENIED') ||
          status.includes('PERMISSION_DENIED') ||
          status.includes('API_KEY')
        ? 'REQUEST_DENIED'
        : status.includes('INVALID_REQUEST') || status.includes('INVALID_ARGUMENT')
          ? 'INVALID_REQUEST'
          : status.includes('UNKNOWN_ERROR') ? 'UNKNOWN_ERROR'
            : status === 'ERROR' ||
                status.includes('TIMEOUT') ||
                status.includes('DEADLINE_EXCEEDED')
              ? 'ERROR'
              : 'UNKNOWN_ERROR'
}

export function loadGoogleMaps(): Promise<GoogleMapsApi> {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps)
  if (mapsPromise) return mapsPromise

  const apiKey = getApiKey()
  if (!apiKey) return Promise.reject(locationError('CONFIG_ERROR'))

  mapsPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID)
    let timeoutId: number

    window.__mithraGoogleMapsReady = () => {
      window.clearTimeout(timeoutId)
      delete window.__mithraGoogleMapsReady
      if (window.google?.maps?.importLibrary) {
        resolve(window.google.maps)
      } else {
        mapsPromise = null
        reject(locationError('LOAD_ERROR'))
      }
    }

    const onError = () => {
      window.clearTimeout(timeoutId)
      delete window.__mithraGoogleMapsReady
      document.getElementById(GOOGLE_MAPS_SCRIPT_ID)?.remove()
      mapsPromise = null
      reject(locationError('LOAD_ERROR'))
    }
    timeoutId = window.setTimeout(onError, 12000)

    if (existingScript) {
      existingScript.addEventListener('error', onError, { once: true })
      return
    }

    const url = new URL('https://maps.googleapis.com/maps/api/js')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('loading', 'async')
    url.searchParams.set('libraries', 'places')
    url.searchParams.set('language', 'en')
    url.searchParams.set('region', INDIA_COUNTRY_CODE)
    url.searchParams.set('auth_referrer_policy', 'origin')
    url.searchParams.set('callback', GOOGLE_MAPS_CALLBACK)
    url.searchParams.set('v', 'weekly')

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = url.toString()
    script.async = true
    script.defer = true
    script.addEventListener('error', onError, { once: true })
    document.head.append(script)
  })

  return mapsPromise
}

export async function warmLocationService(): Promise<void> {
  try {
    await loadGoogleMaps()
  } catch {
    // Search and current-location controls surface configuration or loading errors.
  }
}

async function getPlacesLibrary(): Promise<PlacesLibrary> {
  if (!placesLibraryPromise) {
    placesLibraryPromise = loadGoogleMaps()
      .then((maps) => maps.importLibrary('places'))
      .catch((error) => {
        placesLibraryPromise = null
        throw error
      })
  }
  return placesLibraryPromise
}

function cleanPostcode(value: unknown): string {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length === 6 ? digits : ''
}

function uniqueParts(parts: string[]): string[] {
  return parts.filter(
    (part, index) =>
      part &&
      parts.findIndex((candidate) => candidate?.toLowerCase() === part.toLowerCase()) === index,
  )
}

function component(
  result: GoogleResult,
  ...types: string[]
): GoogleAddressComponent | null {
  const components = result?.addressComponents || result?.address_components || []
  for (const type of types) {
    const match = components.find((item) => item.types?.includes(type))
    if (match) return match
  }
  return null
}

function componentText(item: GoogleAddressComponent | null, short = false): string {
  if (!item) return ''
  return short
    ? item.shortText || item.short_name || ''
    : item.longText || item.long_name || ''
}

function coordinate(
  location: GoogleLocation | undefined,
  key: 'lat' | 'lng',
): number {
  const alternateKey = key === 'lat' ? 'latitude' : 'longitude'
  const value = location?.[key] ?? location?.[alternateKey]
  return Number(typeof value === 'function' ? value.call(location) : value)
}

export function normalizeGoogleResult(result: GoogleResult): LocationPlace | null {
  const location = result?.location || result?.geometry?.location
  const latitude = coordinate(location, 'lat')
  const longitude = coordinate(location, 'lng')
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

  const country = component(result, 'country')
  const countryCode = String(componentText(country, true)).toUpperCase()
  if (countryCode && countryCode !== INDIA_COUNTRY_CODE) return null

  const postcode = cleanPostcode(componentText(component(result, 'postal_code')))
  const locality = componentText(component(
    result,
    'sublocality_level_1',
    'sublocality',
    'locality',
    'administrative_area_level_2',
  ))
  const city = componentText(component(result, 'locality', 'administrative_area_level_2'))
  const state = componentText(component(result, 'administrative_area_level_1'))
  const componentName = componentText(component(
    result,
    'premise',
    'point_of_interest',
    'establishment',
    'route',
    'sublocality_level_1',
    'sublocality',
    'locality',
    'administrative_area_level_2',
  ))
  const displayName = typeof result.displayName === 'string'
    ? result.displayName
    : result.displayName?.text
  const name = displayName || componentName || 'Selected area'
  const detail = uniqueParts([locality, city, state, postcode]).join(', ')
  const placeId = result.id || result.placeId || result.place_id || ''

  return {
    id: placeId || `${latitude}-${longitude}`,
    placeId,
    name,
    label: result.formattedAddress ||
      result.formatted_address ||
      uniqueParts([name, city, state]).join(', '),
    detail,
    postcode,
    latitude,
    longitude,
    countryCode: countryCode || INDIA_COUNTRY_CODE,
    locationType: result.granularity || result.geometry?.location_type || 'APPROXIMATE',
  }
}

async function searchByText(query: string): Promise<GoogleResult[]> {
  try {
    const { Place } = await getPlacesLibrary()
    const response = await Place.searchByText({
      textQuery: query,
      fields: [
        'id',
        'displayName',
        'formattedAddress',
        'location',
        'addressComponents',
      ],
      language: 'en',
      region: INDIA_COUNTRY_CODE.toLowerCase(),
      maxResultCount: 5,
    })
    return Array.isArray(response?.places) ? response.places : []
  } catch (error) {
    if (error instanceof LocationServiceError) throw error
    throw locationError(googleStatus(error), error)
  }
}

export async function searchPlaces(searchText: string): Promise<LocationPlace[]> {
  const query = String(searchText || '').trim()
  if (query.length < 3) return []

  const cacheKey = query.toLocaleLowerCase('en-IN')
  const cachedPlaces = searchCache.get(cacheKey)
  if (cachedPlaces) return cachedPlaces

  const results = await searchByText(query)
  const places = results
    .map(normalizeGoogleResult)
    .filter((place): place is LocationPlace => place !== null)
    .slice(0, 5)

  if (!places.length) throw locationError('ZERO_RESULTS')
  searchCache.set(cacheKey, places)
  return places
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<LocationPlace> {
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw locationError('INVALID_REQUEST')
  }

  const apiKey = getApiKey()
  if (!apiKey) throw locationError('CONFIG_ERROR')

  const url = new URL(`${GEOCODING_V4_BASE_URL}/${lat},${lng}`)
  url.searchParams.set('key', apiKey)

  let response
  let payload: unknown
  try {
    response = await fetch(url)
    payload = await response.json()
  } catch (error) {
    throw locationError('UNKNOWN_ERROR', error)
  }

  const payloadRecord = typeof payload === 'object' && payload !== null
    ? payload as Record<string, unknown>
    : null
  if (!response.ok || payloadRecord?.error) {
    const error = payloadRecord?.error || { status: response.status }
    throw locationError(googleStatus(error), error)
  }

  const results = Array.isArray(payloadRecord?.results)
    ? payloadRecord.results as GoogleResult[]
    : []
  const places = results
    .map(normalizeGoogleResult)
    .filter((place): place is LocationPlace => place !== null)
  const place = places.find((candidate) => candidate.postcode)

  if (!place) throw locationError(places.length ? 'NO_POSTCODE' : 'ZERO_RESULTS')
  return place
}
