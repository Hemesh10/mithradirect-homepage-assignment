// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'
import homeProxy from '../../api/home'
import { homeFixture } from '../test/homeFixture'

const requestUrl =
  'https://mithra.test/api/home?service_area=502103&latitude=18.100525&longitude=78.848279'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('home API proxy', () => {
  it('forwards validated location queries without forwarding the browser origin', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(homeFixture), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await homeProxy.fetch(new Request(requestUrl))
    const [upstreamUrl, options] = fetchMock.mock.calls[0]

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(homeFixture)
    expect(upstreamUrl).toBeInstanceOf(URL)
    expect(upstreamUrl.origin).toBe('https://subscriptionapp-wgf8.onrender.com')
    expect(upstreamUrl.searchParams.get('service_area')).toBe('502103')
    expect(options.headers).toEqual({ Accept: 'application/json' })
    expect(options.headers).not.toHaveProperty('Origin')
  })

  it('rejects invalid location input before contacting the upstream API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await homeProxy.fetch(
      new Request(
        'https://mithra.test/api/home?service_area=invalid&latitude=100&longitude=78',
      ),
    )

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects unsupported methods', async () => {
    const response = await homeProxy.fetch(
      new Request(requestUrl, { method: 'POST' }),
    )

    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('GET')
  })

  it('returns a safe gateway error when the upstream request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))

    const response = await homeProxy.fetch(new Request(requestUrl))
    const payload = await response.json()

    expect(response.status).toBe(502)
    expect(payload.user_message).toMatch(/could not be reached/i)
  })
})
