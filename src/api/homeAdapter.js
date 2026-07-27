const fallbackColors = ['green', 'coral', 'yellow', 'purple', 'blue']

/**
 * @typedef {Object} HomeQuery
 * @property {string} serviceArea
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef {Object} Vendor
 * @property {number} id
 * @property {number} vendorId
 * @property {string} name
 * @property {string} status
 * @property {string|null} bannerUrl
 * @property {string|null} thumbnailUrl
 * @property {string} initials
 * @property {string} fallbackColor
 * @property {Product[]} products
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {number} vendorId
 * @property {string} name
 * @property {string|null} imageUrl
 * @property {boolean} usePlaceholder
 * @property {Vendor|null} vendor
 */

/**
 * @typedef {Object} HomeDiscoveryData
 * @property {Vendor[]} featuredVendors
 * @property {Vendor[]} vendors
 * @property {Product[]} products
 * @property {unknown[]} offers
 * @property {string} resultSource
 * @property {{vendorCount: number, productCount: number}} summary
 */

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanDisplayString(value) {
  return cleanString(value).replace(/[—–]/g, '-')
}

function imageUrl(value) {
  const cleaned = cleanString(value)
  return cleaned || null
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function initials(name) {
  const words = name
    .replace(/\([^)]*\)/g, '')
    .split(/[\s—–-]+/)
    .filter(Boolean)

  if (!words.length) return 'MD'
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function normalizeVendor(rawVendor, index) {
  const name = cleanDisplayString(rawVendor?.business_name) || 'Local business'
  const vendorId = toNumber(rawVendor?.vendor_id ?? rawVendor?.id)

  return {
    id: toNumber(rawVendor?.id ?? vendorId),
    vendorId,
    name,
    status: cleanString(rawVendor?.status) || 'UNKNOWN',
    bannerUrl: imageUrl(rawVendor?.banner_image),
    thumbnailUrl: imageUrl(rawVendor?.thumbnail_image),
    initials: initials(name),
    fallbackColor: fallbackColors[index % fallbackColors.length],
    products: [],
  }
}

function assertPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new TypeError('The home response is not an object.')
  }

  const data = payload.data
  if (!data || typeof data !== 'object') {
    throw new TypeError('The home response does not contain a data object.')
  }

  for (const field of ['new_vendors', 'top_products', 'carousal']) {
    if (!Array.isArray(data[field])) {
      throw new TypeError(`The home response field "${field}" is not an array.`)
    }
  }

  return data
}

/**
 * Converts the backend response into stable, presentation-ready home data.
 * Raw backend naming and inconsistent field types are contained here.
 *
 * @param {unknown} payload
 * @returns {HomeDiscoveryData}
 */
export function normalizeHomeResponse(payload) {
  const data = assertPayload(payload)
  const vendors = data.new_vendors.map(normalizeVendor)
  const vendorMap = new Map(vendors.map((vendor) => [vendor.vendorId, vendor]))

  const products = data.top_products.map((rawProduct, index) => {
    const vendorId = toNumber(rawProduct?.vendor_id)
    const url = imageUrl(rawProduct?.image_path)
    const vendor = vendorMap.get(vendorId) ?? null
    const name = cleanDisplayString(rawProduct?.name) || 'Local product'

    return {
      id: toNumber(rawProduct?.id),
      vendorId,
      name,
      imageUrl: url,
      usePlaceholder: !url,
      fallbackColor: fallbackColors[index % fallbackColors.length],
      vendor,
    }
  })

  for (const vendor of vendors) {
    vendor.products = products.filter((product) => product.vendorId === vendor.vendorId)
  }

  const featuredVendors = data.carousal.map((rawVendor, index) => {
    const normalized = normalizeVendor(rawVendor, index)
    const knownVendor = vendorMap.get(normalized.vendorId)
    return knownVendor
      ? {
          ...knownVendor,
          bannerUrl: normalized.bannerUrl ?? knownVendor.bannerUrl,
          thumbnailUrl: normalized.thumbnailUrl ?? knownVendor.thumbnailUrl,
        }
      : normalized
  })

  return {
    featuredVendors,
    vendors,
    products,
    offers: Array.isArray(data.offers) ? data.offers : [],
    resultSource: cleanString(data.result_source) || 'UNKNOWN',
    summary: {
      vendorCount: vendors.length,
      productCount: products.length,
    },
  }
}
