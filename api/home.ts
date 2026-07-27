import type { IncomingMessage, ServerResponse } from 'node:http'

const UPSTREAM_HOME_API_URL =
  'https://subscriptionapp-wgf8.onrender.com/api/v1/home'

const SERVICE_AREA_PATTERN = /^\d{6}$/
const UPSTREAM_TIMEOUT_MS = 15000

type ProxyRequest = IncomingMessage & { query?: Record<string, string | string[]> }

function sendJson(
  response: ServerResponse,
  status: number,
  payload: unknown,
) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.end(JSON.stringify(payload))
}

function sendError(response: ServerResponse, status: number, message: string) {
  sendJson(response, status, {
    success: false,
    failure_reason: message,
    user_message: message,
  })
}

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function validCoordinate(
  value: string | null,
  minimum: number,
  maximum: number,
) {
  if (value === null || value.trim() === '') return false
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
}

export default async function handler(
  request: ProxyRequest,
  response: ServerResponse,
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    sendError(response, 405, 'Only GET requests are supported.')
    return
  }

  // Vercel populates `query`; fall back to parsing the URL so the same handler
  // works under `vercel dev` and any plain Node host.
  const query =
    request.query ??
    Object.fromEntries(
      new URL(request.url || '', 'http://localhost').searchParams,
    )

  const serviceArea = firstValue(query.service_area)
  const latitude = firstValue(query.latitude)
  const longitude = firstValue(query.longitude)

  if (
    !SERVICE_AREA_PATTERN.test(serviceArea || '') ||
    !validCoordinate(latitude, -90, 90) ||
    !validCoordinate(longitude, -180, 180)
  ) {
    sendError(
      response,
      400,
      'Provide a six-digit service area and valid latitude and longitude.',
    )
    return
  }

  const upstreamUrl = new URL(UPSTREAM_HOME_API_URL)
  upstreamUrl.searchParams.set('service_area', serviceArea as string)
  upstreamUrl.searchParams.set('latitude', latitude as string)
  upstreamUrl.searchParams.set('longitude', longitude as string)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

  try {
    // Server-to-server: no browser Origin header is sent, so the upstream
    // CORS allowlist never applies to this request.
    const upstreamResponse = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    const body = await upstreamResponse.text()

    response.statusCode = upstreamResponse.status
    response.setHeader(
      'Content-Type',
      upstreamResponse.headers.get('content-type') ||
        'application/json; charset=utf-8',
    )
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.end(body)
  } catch {
    sendError(
      response,
      502,
      'The neighbourhood service could not be reached. Please try again.',
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
