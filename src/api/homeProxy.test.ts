// @vitest-environment node

import { ServerResponse } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from '../../api/home'
import { homeFixture } from '../test/homeFixture'

const VALID_QUERY = {
  service_area: '502103',
  latitude: '18.100525',
  longitude: '78.848279',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Minimal req/res pair matching what Vercel's Node runtime passes in. */
function invoke(
  query: Record<string, string>,
  method = 'GET',
) {
  const request = { method, query } as never
  const chunks: string[] = []
  const response = new ServerResponse({ method } as never)
  const done = new Promise<void>((resolve) => {
    response.end = ((chunk?: string) => {
      if (chunk) chunks.push(chunk)
      resolve()
      return response
    }) as never
  })

  return {
    response,
    async run() {
      await handler(request, response)
      await done
      return {
        status: response.statusCode,
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
