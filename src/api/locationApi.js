const DEFAULT_GEOCODING_URL = 'https://photon.komoot.io'
const INDIA_BBOX = '68.1,6.5,97.4,35.7'
const searchCache = new Map()

function getBaseUrl() {
  return import.meta.env.VITE_GEOCODING_API_BASE_URL || DEFAULT_GEOCODING_URL
}

function cleanPostcode(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length === 6 ? digits : ''
}

function uniqueParts(parts) {
  return parts.filter(
    (part, index) =>
      part &&
      parts.findIndex((candidate) => candidate?.toLowerCase() === part.toLowerCase()) === index,
  )
}

function normalizeFeature(feature) {
  const properties = feature?.properties || {}
  const coordinates = feature?.geometry?.coordinates || []
  const longitude = Number(coordinates[0])
  const latitude = Number(coordinates[1])

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

  const name =
    properties.name ||
    properties.district ||
    properties.city ||
    properties.county ||
    'Selected area'
  const locality =
    properties.city ||
    properties.district ||
    properties.county ||
    properties.state
  const postcode = cleanPostcode(properties.postcode)
  const labelParts = uniqueParts([name, locality, properties.state])
  const detailParts = uniqueParts([locality, properties.state, postcode])

  return {
    id: `${properties.osm_type || 'place'}-${properties.osm_id || `${latitude}-${longitude}`}`,
    name,
    label: labelParts.join(', '),
    detail: detailParts.join(' · '),
    postcode,
    latitude,
    longitude,
    countryCode: String(properties.countrycode || '').toUpperCase(),
  }
}

async function requestJson(url, { signal } = {}) {
  let response
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error('The location service could not be reached.')
  }

  if (!response.ok) {
    throw new Error(`The location service returned ${response.status}.`)
  }

  return response.json()
}

export async function searchPlaces(searchText, { signal } = {}) {
  const query = searchText.trim()
  if (query.length < 3) return []

  const cacheKey = query.toLowerCase()
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey)

  const url = new URL('/api/', getBaseUrl())
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '8')
  url.searchParams.set('lang', 'en')
  url.searchParams.set('bbox', INDIA_BBOX)

  const payload = await requestJson(url, { signal })
  const places = (Array.isArray(payload?.features) ? payload.features : [])
    .map(normalizeFeature)
    .filter((place) => place && (!place.countryCode || place.countryCode === 'IN'))
    .slice(0, 5)

  searchCache.set(cacheKey, places)
  return places
}

export async function reverseGeocode(latitude, longitude, { signal } = {}) {
  const url = new URL('/reverse', getBaseUrl())
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))
  url.searchParams.set('lang', 'en')

  const payload = await requestJson(url, { signal })
  const place = (Array.isArray(payload?.features) ? payload.features : [])
    .map(normalizeFeature)
    .find(Boolean)

  if (!place) throw new Error('No area name was found for this location.')
  return place
}
