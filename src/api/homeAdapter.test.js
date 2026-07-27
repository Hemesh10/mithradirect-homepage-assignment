import { describe, expect, it } from 'vitest'
import { normalizeHomeResponse } from './homeAdapter'
import { homeFixture } from '../test/homeFixture'

describe('normalizeHomeResponse', () => {
  it('normalizes backend naming, IDs, whitespace, and missing images', () => {
    const result = normalizeHomeResponse(homeFixture)

    expect(result.resultSource).toBe('GEO_BASED')
    expect(result.featuredVendors).toHaveLength(2)
    expect(result.vendors[0]).toMatchObject({
      vendorId: 124,
      name: 'Kammani - Authentic Telangana Snacks',
      bannerUrl: null,
      thumbnailUrl: null,
    })
    expect(result.vendors[1].name).toBe('Straight From The Farm (SFTF)')
    expect(result.products[0].vendorId).toBe(124)
  })

  it('joins products to their vendors and derives live counts', () => {
    const result = normalizeHomeResponse(homeFixture)

    expect(result.products[0].vendor?.name).toBe('Kammani - Authentic Telangana Snacks')
    expect(result.vendors[0].products.map((product) => product.name)).toEqual([
      'Sarvapindi',
      'Vadas',
    ])
    expect(result.summary).toEqual({ vendorCount: 2, productCount: 3 })
  })

  it('preserves every valid API image URL even when URLs are reused', () => {
    const result = normalizeHomeResponse(homeFixture)

    expect(result.products[0].usePlaceholder).toBe(false)
    expect(result.products[1].usePlaceholder).toBe(false)
    expect(result.products[2].usePlaceholder).toBe(false)
  })

  it('normalizes offer details without inventing missing fields', () => {
    const payload = {
      ...homeFixture,
      data: {
        ...homeFixture.data,
        offers: [
          {
            id: 14,
            offer_title: 'Fresh dairy week',
            discount_percentage: 10,
            offer_code: 'FRESH10',
            expiry_date: '2026-08-15',
            business_name: 'Neighbourhood Dairy',
            vendor_id: 123,
            product_id: 248,
          },
        ],
      },
    }
    const result = normalizeHomeResponse(payload)

    expect(result.offers[0]).toMatchObject({
      id: 14,
      title: 'Fresh dairy week',
      discountLabel: '10% off',
      code: 'FRESH10',
      expiresAt: '2026-08-15',
      vendorName: 'Neighbourhood Dairy',
      vendorId: 123,
      productId: 248,
    })
    expect(result.offers[0].description).toBe('')
    expect(result.offers[0].vendor?.name).toBe('Straight From The Farm (SFTF)')
    expect(result.offers[0].product?.name).toBe('Desi Cow Milk (A2)')
  })

  it('rejects malformed payloads before they reach the UI', () => {
    expect(() => normalizeHomeResponse({ success: true, data: {} })).toThrow(
      'new_vendors',
    )
    expect(() => normalizeHomeResponse(null)).toThrow('not an object')
  })
})
