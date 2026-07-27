import {
  normalizeHomeResponse,
  type HomeDiscoveryData,
  type HomeQuery,
} from './homeAdapter'

// Same-origin proxy by default: the upstream API's CORS allowlist only permits
// localhost, so browsers on a deployed origin are rejected. Override with
// VITE_HOME_API_BASE_URL to call an absolute URL directly.
const DEFAULT_HOME_API_URL = '/api/home'

export class HomeApiError extends Error {
  status: number
  userMessage: string

  constructor(
    message: string,
    { status = 0, userMessage = '' }: { status?: number, userMessage?: string } = {},
  ) {
    super(message)
    this.name = 'HomeApiError'
    this.status = status
    this.userMessage = userMessage
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function fetchHomeDiscovery(
  query: HomeQuery,
  { signal }: { signal?: AbortSignal } = {},
): Promise<HomeDiscoveryData> {
  const endpoint = import.meta.env.VITE_HOME_API_BASE_URL || DEFAULT_HOME_API_URL
  const url = new URL(endpoint, window.location.origin)
  url.searchParams.set('service_area', query.serviceArea)
  url.searchParams.set('latitude', String(query.latitude))
  url.searchParams.set('longitude', String(query.longitude))

  let response
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw new HomeApiError('The neighbourhood service could not be reached.', {
      userMessage: 'We couldn’t reach the neighbourhood service. Check your connection and try again.',
    })
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new HomeApiError('The neighbourhood service returned invalid JSON.', {
      status: response.status,
      userMessage: 'The neighbourhood service sent an unexpected response. Please try again.',
    })
  }

  if (!response.ok || (isRecord(payload) && payload.success === false)) {
    const failureReason = isRecord(payload) && typeof payload.failure_reason === 'string'
      ? payload.failure_reason
      : `The neighbourhood request failed with status ${response.status}.`
    const userMessage = isRecord(payload) && typeof payload.user_message === 'string'
      ? payload.user_message
      : 'We couldn’t load this neighbourhood right now. Please check the location and try again.'

    throw new HomeApiError(
      failureReason,
      {
        status: response.status,
        userMessage,
      },
    )
  }

  try {
    return normalizeHomeResponse(payload)
  } catch (error) {
    throw new HomeApiError(error instanceof Error ? error.message : String(error), {
      status: response.status,
      userMessage: 'Neighbourhood data is temporarily unavailable. Please try again.',
    })
  }
}
