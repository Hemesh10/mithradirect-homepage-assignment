import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchHomeDiscovery, HomeApiError } from './homeApi'
import { homeFixture } from '../test/homeFixture'

const query = {
  serviceArea: '502103',
  latitude: 18.100525,
  longitude: 78.848279,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchHomeDiscovery', () => {
  it('sends the expected query and normalizes a successful response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => homeFixture,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchHomeDiscovery(query)
    const requestedUrl = new URL(fetchMock.mock.calls[0][0])

    expect(requestedUrl.searchParams.get('service_area')).toBe('502103')
    expect(requestedUrl.searchParams.get('latitude')).toBe('18.100525')
    expect(result.summary.vendorCount).toBe(2)
  })

  it('preserves the API user message for structured failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          user_message: 'Please check the input request and try again.',
          failure_reason: 'Invalid latitude value.',
        }),
      }),
    )

    await expect(fetchHomeDiscovery(query)).rejects.toMatchObject({
      status: 400,
      userMessage: 'Please check the input request and try again.',
    })
  })

  it('maps network and malformed JSON failures to user-safe errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    await expect(fetchHomeDiscovery(query)).rejects.toBeInstanceOf(HomeApiError)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('bad json')
        },
      }),
    )
    await expect(fetchHomeDiscovery(query)).rejects.toMatchObject({
      userMessage: expect.stringContaining('unexpected response'),
    })
  })
})
