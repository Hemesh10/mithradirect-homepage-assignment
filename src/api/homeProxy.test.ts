// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'
// @ts-expect-error - the proxy ships as plain JS so Vercel's builder never
// compiles it with the project's TypeScript. See api/home.js.
import handler from '../../api/home.js'
import { homeFixture } from '../test/homeFixture'

const VALID_QUERY = {
  service_area: '502103',
  latitude: '18.100525',
  longitude: '78.848279',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * Minimal req/res pair matching what Vercel's Node runtime passes in. The
 * handler only uses `statusCode`, `setHeader`, and `end`, so a plain stub
 * avoids depending on Node type definitions.
 */
function invoke(query: Record<string, string>, method = 'GET') {
  const request = { method, query }
  const chunks: string[] = []
  const headers: Record<string, string> = {}
  const response = {
    statusCode: 0,
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value
    },
    end(chunk?: string) {
      if (chunk) chunks.push(chunk)
    },
  }

  return {
    async run() {
      await handler(request, response)
      return {
        status: response.statusCode,
        headers,
        body: chunks.join(''),
        json: () => JSON.parse(chunks.join('')),
      }
    },
  }
}

describe('home API proxy', () => {
  it('forwards a validated query upstream without a browser Origin header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(homeFixture), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await invoke(VALID_QUERY).run()
    const [upstreamUrl, options] = fetchMock.mock.calls[0]

    expect(result.status).toBe(200)
    expect(result.json()).toEqual(homeFixture)
    expect(upstreamUrl.origin).toBe('https://subscriptionapp-wgf8.onrender.com')
    expect(upstreamUrl.pathname).toBe('/api/v1/home')
    expect(upstreamUrl.searchParams.get('service_area')).toBe('502103')
    expect(upstreamUrl.searchParams.get('latitude')).toBe('18.100525')
    expect(options.headers).not.toHaveProperty('Origin')
  })

  it('rejects invalid input before contacting the upstream API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const badServiceArea = await invoke({
      ...VALID_QUERY,
      service_area: 'abc',
    }).run()
    const badLatitude = await invoke({ ...VALID_QUERY, latitude: '999' }).run()

    expect(badServiceArea.status).toBe(400)
    expect(badLatitude.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects unsupported methods', async () => {
    const result = await invoke(VALID_QUERY, 'POST').run()

    expect(result.status).toBe(405)
    expect(result.headers.allow).toBe('GET')
    expect(result.json().user_message).toMatch(/only get/i)
  })

  it('passes an upstream failure status through to the client', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ success: false, user_message: 'No such area.' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    const result = await invoke(VALID_QUERY).run()

    expect(result.status).toBe(404)
    expect(result.json().user_message).toBe('No such area.')
  })

  it('returns a safe gateway error when the upstream request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))

    const result = await invoke(VALID_QUERY).run()

    expect(result.status).toBe(502)
    expect(result.json().user_message).toMatch(/could not be reached/i)
  })
})
