import { normalizeHomeResponse } from './homeAdapter'

const DEFAULT_HOME_API_URL =
  'https://subscriptionapp-wgf8.onrender.com/api/v1/home'

export class HomeApiError extends Error {
  constructor(message, { status = 0, userMessage = '' } = {}) {
    super(message)
    this.name = 'HomeApiError'
    this.status = status
    this.userMessage = userMessage
  }
}

/**
 * @param {import('./homeAdapter').HomeQuery} query
 * @param {{signal?: AbortSignal}} options
 */
export async function fetchHomeDiscovery(query, { signal } = {}) {
  const endpoint = import.meta.env.VITE_HOME_API_BASE_URL || DEFAULT_HOME_API_URL
  const url = new URL(endpoint)
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
    if (error?.name === 'AbortError') throw error
    throw new HomeApiError('The neighbourhood service could not be reached.', {
      userMessage: 'We couldn’t reach the neighbourhood service. Check your connection and try again.',
    })
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new HomeApiError('The neighbourhood service returned invalid JSON.', {
      status: response.status,
      userMessage: 'The neighbourhood service sent an unexpected response. Please try again.',
    })
  }

  if (!response.ok || payload?.success === false) {
    throw new HomeApiError(
      payload?.failure_reason || `The neighbourhood request failed with status ${response.status}.`,
      {
        status: response.status,
        userMessage:
          payload?.user_message ||
          'We couldn’t load this neighbourhood right now. Please check the location and try again.',
      },
    )
  }

  try {
    return normalizeHomeResponse(payload)
  } catch (error) {
    throw new HomeApiError(error.message, {
      status: response.status,
      userMessage: 'Neighbourhood data is temporarily unavailable. Please try again.',
    })
  }
}
