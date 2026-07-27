const UPSTREAM_HOME_API_URL =
  'https://subscriptionapp-wgf8.onrender.com/api/v1/home'

const serviceAreaPattern = /^\d{6}$/

function jsonError(status: number, message: string) {
  return Response.json(
    {
      success: false,
      failure_reason: message,
      user_message: message,
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  )
}

function validCoordinate(value: string | null, minimum: number, maximum: number) {
  if (value === null || value.trim() === '') return false
  const number = Number(value)
  return Number.isFinite(number) && number >= minimum && number <= maximum
}

const homeProxy = {
  async fetch(request: Request) {
    if (request.method !== 'GET') {
      const response = jsonError(405, 'Only GET requests are supported.')
      response.headers.set('Allow', 'GET')
      return response
    }

    const requestUrl = new URL(request.url)
    const serviceArea = requestUrl.searchParams.get('service_area')
    const latitude = requestUrl.searchParams.get('latitude')
    const longitude = requestUrl.searchParams.get('longitude')

    if (
      !serviceAreaPattern.test(serviceArea || '') ||
      !validCoordinate(latitude, -90, 90) ||
      !validCoordinate(longitude, -180, 180)
    ) {
      return jsonError(
        400,
        'Provide a six-digit service area and valid latitude and longitude.',
      )
    }

    const upstreamUrl = new URL(UPSTREAM_HOME_API_URL)
    upstreamUrl.searchParams.set('service_area', serviceArea!)
    upstreamUrl.searchParams.set('latitude', latitude!)
    upstreamUrl.searchParams.set('longitude', longitude!)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      const body = await upstreamResponse.text()

      return new Response(body, {
        status: upstreamResponse.status,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type':
            upstreamResponse.headers.get('content-type') ||
            'application/json; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    } catch {
      return jsonError(
        502,
        'The neighbourhood service could not be reached. Please try again.',
      )
    } finally {
      clearTimeout(timeoutId)
    }
  },
}

export default homeProxy
