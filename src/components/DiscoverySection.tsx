import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from 'react'
import {
  ArrowRight,
  ArrowsClockwise,
  CaretLeft,
  CaretRight,
  CrosshairSimple,
  MagnifyingGlass,
  MapPin,
  SpinnerGap,
  X,
} from '@phosphor-icons/react'
import {
  BadgePercent,
  Check,
  Leaf,
  LocateFixed,
  SearchX,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-react'
import { useHomeDiscovery } from '../hooks/useHomeDiscovery'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import { reverseGeocode, warmLocationService } from '../api/locationApi'
import type { LocationPlace } from '../api/locationApi'
import type {
  HomeDiscoveryData,
  Offer,
  Product,
  Vendor,
} from '../api/homeAdapter'
import type { DiscoveryRequestError } from '../hooks/useHomeDiscovery'
import heroImage from '../assets/hyperlocal-platform-hero.webp'
import onlineOrderingHeroImage from '../assets/mithra-direct-online-ordering-hero.webp'

const defaultQuery = {
  serviceArea: '502103',
  latitude: 18.100525,
  longitude: 78.848279,
}

const defaultPlace = {
  id: 'default-siddipet',
  placeId: '',
  name: 'Siddipet',
  label: 'Siddipet, Telangana',
  detail: 'Telangana, 502103',
  postcode: '502103',
  latitude: defaultQuery.latitude,
  longitude: defaultQuery.longitude,
  countryCode: 'IN',
  locationType: 'APPROXIMATE',
} satisfies LocationPlace

const sampleOfferTemplates = [
  {
    id: 'sample-dairy',
    title: 'A little extra off a popular pick',
    description: 'A sample saving linked to a product available nearby.',
    discountLabel: '15% off',
    code: 'LOCAL15',
    expiresAt: '2027-03-31',
    fallbackColor: 'yellow',
    targetType: 'product',
    targetIndex: 0,
  },
  {
    id: 'sample-repeat',
    title: 'Build a better recurring routine',
    description: 'A sample subscription-style saving from a local business.',
    discountLabel: '18% off',
    code: 'REPEAT18',
    expiresAt: '2027-04-15',
    fallbackColor: 'green',
    targetType: 'product',
    targetIndex: 2,
  },
  {
    id: 'sample-weekend',
    title: 'Weekend neighbourhood basket',
    description: 'A sample store-wide offer for an easy weekend restock.',
    discountLabel: '10% off',
    code: 'WEEKEND10',
    expiresAt: '2027-04-30',
    fallbackColor: 'coral',
    targetType: 'vendor',
    targetIndex: 0,
  },
  {
    id: 'sample-try-local',
    title: 'Try something new nearby',
    description: 'A sample welcome coupon attached to a local product.',
    discountLabel: '12% off',
    code: 'TRYLOCAL12',
    expiresAt: '2027-05-10',
    fallbackColor: 'blue',
    targetType: 'product',
    targetIndex: 1,
  },
  {
    id: 'sample-midweek',
    title: 'Midweek essentials offer',
    description: 'A sample saving for a useful everyday local pick.',
    discountLabel: '14% off',
    code: 'MIDWEEK14',
    expiresAt: '2027-05-22',
    fallbackColor: 'purple',
    targetType: 'product',
    targetIndex: 2,
  },
  {
    id: 'sample-direct',
    title: 'More value from a trusted local shop',
    description: 'A sample business offer for shopping closer to home.',
    discountLabel: '8% off',
    code: 'DIRECT8',
    expiresAt: '2027-06-05',
    fallbackColor: 'green',
    targetType: 'vendor',
    targetIndex: 1,
  },
  {
    id: 'sample-fresh',
    title: 'A fresh start for your next order',
    description: 'A sample limited-time saving linked to a popular product.',
    discountLabel: '16% off',
    code: 'FRESH16',
    expiresAt: '2027-06-18',
    fallbackColor: 'yellow',
    targetType: 'product',
    targetIndex: 0,
  },
  {
    id: 'sample-nearby',
    title: 'A friendly saving from nearby',
    description: 'A sample coupon connected to a neighbourhood business.',
    discountLabel: '11% off',
    code: 'NEARBY11',
    expiresAt: '2027-06-30',
    fallbackColor: 'blue',
    targetType: 'vendor',
    targetIndex: 0,
  },
]

type PreviewType = 'vendor' | 'product'
type PreviewHandler = (
  item: Vendor | Product,
  type: PreviewType,
  trigger: HTMLElement,
) => void

type PreviewSelection =
  | { item: Vendor, type: 'vendor', trigger: HTMLElement }
  | { item: Product, type: 'product', trigger: HTMLElement }

function buildSampleOffers(data: HomeDiscoveryData): Offer[] {
  return sampleOfferTemplates.map((template) => {
    const { targetIndex, targetType, ...offer } = template
    const product = targetType === 'product' && data.products.length
      ? data.products[targetIndex % data.products.length]
      : null
    const vendor = targetType === 'vendor' && data.vendors.length
      ? data.vendors[targetIndex % data.vendors.length]
      : product?.vendor ?? null

    return {
      ...offer,
      product,
      vendor,
      productId: product?.id ?? 0,
      vendorId: vendor?.vendorId ?? 0,
      vendorName: vendor?.name || 'Sample nearby business',
    }
  })
}

function HighlightedText({ text, query }: { text: string, query: string }) {
  const value = String(text || '')
  const search = query.trim()
  if (!search) return value

  const index = value.toLocaleLowerCase('en-IN').indexOf(search.toLocaleLowerCase('en-IN'))
  if (index < 0) return value

  return (
    <>
      {value.slice(0, index)}
      <mark>{value.slice(index, index + search.length)}</mark>
      {value.slice(index + search.length)}
    </>
  )
}

function SafeImage({
  src,
  alt,
  className = '',
}: {
  src: string | null
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  if (!src || failed) return null

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

function BrandFallback({
  item,
  className = '',
  variant = 'compact',
}: {
  item: Vendor
  className?: string
  variant?: 'compact' | 'showcase'
}) {
  const isShowcase = variant === 'showcase'

  return (
    <div
      className={`brand-fallback brand-fallback--${item.fallbackColor} ${isShowcase ? 'brand-fallback--showcase' : ''} ${className}`}
      role="img"
      aria-label={item.name}
    >
      <span className="brand-fallback__dots" />
      {isShowcase ? (
        <div className="brand-fallback__showcase-copy">
          <span className="brand-fallback__label">Featured local business</span>
          <strong>{item.name}</strong>
        </div>
      ) : (
        <>
          <strong>{item.initials || item.name?.slice(0, 2).toUpperCase()}</strong>
          <small>Local goodness, made direct</small>
        </>
      )}
    </div>
  )
}

function MediaWithFallback({
  item,
  type = 'thumbnail',
  className = '',
}: {
  item: Vendor
  type?: 'banner' | 'thumbnail'
  className?: string
}) {
  const sources = type === 'banner'
    ? [item.bannerUrl, item.thumbnailUrl].filter((source): source is string => Boolean(source))
    : [item.thumbnailUrl].filter((source): source is string => Boolean(source))
  const [sourceIndex, setSourceIndex] = useState(0)
  const src = sources[sourceIndex]
  const isThumbnailFallback = type === 'banner' && src === item.thumbnailUrl

  useEffect(() => setSourceIndex(0), [item.bannerUrl, item.thumbnailUrl, type])

  if (!src) {
    return (
      <BrandFallback
        item={item}
        className={className}
        variant={type === 'banner' ? 'showcase' : 'compact'}
      />
    )
  }

  return (
    <img
      className={`${className} ${isThumbnailFallback ? 'media-with-fallback--thumbnail' : ''}`.trim()}
      src={src}
      alt={item.name}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setSourceIndex((index) => index + 1)}
    />
  )
}

function DiscoverySkeleton() {
  return (
    <div className="discovery-skeleton" aria-label="Loading neighbourhood businesses">
      <div className="skeleton-row">
        {[1, 2, 3, 4].map((item) => <div className="skeleton skeleton--vendor" key={item} />)}
      </div>
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((item) => <div className="skeleton skeleton--product" key={item} />)}
      </div>
    </div>
  )
}

function FeaturedCarouselSkeleton() {
  return (
    <div
      className="vendor-slider vendor-slider--loading"
      role="status"
      aria-busy="true"
      aria-label="Loading featured neighbourhood businesses"
    >
      <div className="vendor-slider__toolbar" aria-hidden="true">
        <span className="carousel-skeleton carousel-skeleton--label" />
        <div className="vendor-slider__actions">
          <span className="carousel-skeleton carousel-skeleton--control" />
          <span className="carousel-skeleton carousel-skeleton--control" />
        </div>
      </div>
      <div className="vendor-slider__track vendor-slider__track--skeleton" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <div className="vendor-showcase-card vendor-showcase-card--skeleton" key={item}>
            <span className="carousel-skeleton carousel-skeleton--card-media" />
            <div className="vendor-showcase-card__body">
              <span className="carousel-skeleton carousel-skeleton--card-title" />
              <span className="carousel-skeleton carousel-skeleton--card-meta" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeroStorefrontFallback() {
  return (
    <div className="vendor-slider-empty">
      <img
        src={heroImage}
        alt="A neighbourhood marketplace for local produce, dairy, bakery, pharmacy and tiffin businesses"
        width="1120"
        height="1400"
        loading="lazy"
        decoding="async"
      />
      <div>
        <h3>Local shopping starts here</h3>
        <p>Choose another area or refresh to find featured businesses nearby.</p>
      </div>
    </div>
  )
}

function FeaturedCarousel({
  vendors,
  onPreview,
}: {
  vendors: Vendor[]
  onPreview: PreviewHandler
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canMoveBack, setCanMoveBack] = useState(false)
  const [canMoveForward, setCanMoveForward] = useState(vendors.length > 1)

  const updateControls = () => {
    const track = trackRef.current
    if (!track) return
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth)
    setCanMoveBack(track.scrollLeft > 4)
    setCanMoveForward(track.scrollLeft < maximum - 4)
  }

  useEffect(() => {
    updateControls()
    window.addEventListener('resize', updateControls)
    return () => window.removeEventListener('resize', updateControls)
  }, [vendors.length])

  const move = (direction: number) => {
    const track = trackRef.current
    if (!track) return
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const distance = Math.max(300, track.clientWidth * 0.72) * direction
    if (typeof track.scrollBy === 'function') {
      track.scrollBy({
        left: distance,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    } else {
      track.scrollLeft += distance
      updateControls()
    }
  }

  return (
    <div
      className="vendor-slider"
      aria-roledescription="carousel"
      aria-label="Featured neighbourhood businesses"
    >
      <div className="vendor-slider__toolbar">
        <span>{vendors.length} featured {vendors.length === 1 ? 'business' : 'businesses'}</span>
        <div className="vendor-slider__actions">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous featured vendors"
            disabled={!canMoveBack}
          >
            <CaretLeft size={19} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next featured vendors"
            disabled={!canMoveForward}
          >
            <CaretRight size={19} />
          </button>
        </div>
      </div>
      <div
        className="vendor-slider__track"
        ref={trackRef}
        onScroll={updateControls}
        aria-label="Featured business cards"
      >
        {vendors.map((vendor) => (
          <button
            type="button"
            className="vendor-showcase-card"
            key={vendor.vendorId}
            onClick={(event) => onPreview(vendor, 'vendor', event.currentTarget)}
            aria-label={`Preview ${vendor.name}`}
          >
            <div className="vendor-showcase-card__media">
              <MediaWithFallback item={vendor} type="banner" />
            </div>
            <div className="vendor-showcase-card__body">
              <div>
                <h3>{vendor.name}</h3>
                <span>
                  {vendor.products.length
                    ? `${vendor.products.length} popular ${vendor.products.length === 1 ? 'pick' : 'picks'}`
                    : 'New to the neighbourhood'}
                </span>
              </div>
              <span className="vendor-showcase-card__link">
                View storefront <ArrowRight size={16} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function VendorCard({ vendor, onPreview }: { vendor: Vendor, onPreview: PreviewHandler }) {
  return (
    <button
      type="button"
      className="live-vendor-card"
      onClick={(event) => onPreview(vendor, 'vendor', event.currentTarget)}
      aria-label={`Preview ${vendor.name}`}
    >
      <div className="live-vendor-card__media">
        <MediaWithFallback item={vendor} />
        {vendor.status !== 'ACTIVE' && <span>{vendor.status}</span>}
      </div>
      <div className="live-vendor-card__copy">
        <strong>{vendor.name}</strong>
        <span>{vendor.products.length ? `${vendor.products.length} popular picks` : 'New to the neighbourhood'}</span>
      </div>
      <ArrowRight size={16} />
    </button>
  )
}

function ProductArtwork({ product, className = '' }: { product: Product, className?: string }) {
  if (product.usePlaceholder) {
    return (
      <div className={`product-artwork product-artwork--${product.fallbackColor} ${className}`} aria-hidden="true">
        <Leaf size={28} />
        <span>{product.name}</span>
      </div>
    )
  }

  return (
    <div className={`product-artwork ${className}`}>
      <SafeImage src={product.imageUrl} alt={product.name} />
      <div className="product-artwork__fallback" aria-hidden="true"><Leaf size={28} /></div>
    </div>
  )
}

function ProductCard({ product, onPreview }: { product: Product, onPreview: PreviewHandler }) {
  return (
    <button
      type="button"
      className="live-product-card"
      onClick={(event) => onPreview(product, 'product', event.currentTarget)}
      aria-label={`Preview ${product.name}`}
    >
      <ProductArtwork product={product} />
      <div className="live-product-card__copy">
        <span>{product.vendor?.name || 'Local business'}</span>
        <strong>{product.name}</strong>
        <small>Explore this local pick <ArrowRight size={13} /></small>
      </div>
    </button>
  )
}

function ProductSlider({
  products,
  onPreview,
}: {
  products: Product[]
  onPreview: PreviewHandler
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canMoveBack, setCanMoveBack] = useState(false)
  const [canMoveForward, setCanMoveForward] = useState(products.length > 1)

  const updateControls = () => {
    const track = trackRef.current
    if (!track) return
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth)
    setCanMoveBack(track.scrollLeft > 4)
    setCanMoveForward(track.scrollLeft < maximum - 4)
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateControls)
    window.addEventListener('resize', updateControls)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateControls)
    }
  }, [products.length])

  const move = (direction: number) => {
    const track = trackRef.current
    if (!track) return
    const distance = Math.max(240, track.clientWidth * 0.82) * direction
    if (typeof track.scrollBy === 'function') {
      track.scrollBy({ left: distance, behavior: 'smooth' })
    } else {
      track.scrollLeft += distance
      updateControls()
    }
  }

  return (
    <div className={`product-slider ${canMoveBack ? 'can-move-back' : ''} ${canMoveForward ? 'can-move-forward' : ''}`}>
      <div className="product-slider__toolbar">
        <span>{products.length} neighbourhood picks</span>
        <div className="product-slider__controls">
          <button type="button" onClick={() => move(-1)} disabled={!canMoveBack} aria-label="Previous popular products">
            <CaretLeft size={19} />
          </button>
          <button type="button" onClick={() => move(1)} disabled={!canMoveForward} aria-label="Next popular products">
            <CaretRight size={19} />
          </button>
        </div>
      </div>
      <div className="product-slider__viewport">
        <div
          className="product-slider__track"
          ref={trackRef}
          onScroll={updateControls}
          aria-label="Popular products"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onPreview={onPreview} />
          ))}
        </div>
      </div>
    </div>
  )
}

function formatOfferExpiry(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function OffersStrip({
  offers,
  isPreview = false,
  onPreview,
}: {
  offers: Offer[]
  isPreview?: boolean
  onPreview?: PreviewHandler
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canMoveBack, setCanMoveBack] = useState(false)
  const [canMoveForward, setCanMoveForward] = useState(offers.length > 1)
  const titleId = isPreview ? 'sample-offers-title' : 'offers-title'

  const updateControls = () => {
    const track = trackRef.current
    if (!track) return
    setCanMoveBack(track.scrollLeft > 4)
    setCanMoveForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 4)
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateControls)
    window.addEventListener('resize', updateControls)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateControls)
    }
  }, [offers.length])

  const move = (direction: number) => {
    const track = trackRef.current
    if (!track) return
    const distance = direction * Math.max(300, track.clientWidth * 0.78)
    if (typeof track.scrollBy === 'function') {
      track.scrollBy({ left: distance, behavior: 'smooth' })
    } else {
      track.scrollLeft += distance
      updateControls()
    }
  }

  return (
    <section className="offers-section" aria-labelledby={titleId}>
      <div className="discovery-section-heading">
        <div>
          <span className="discovery-kicker">
            {isPreview ? 'Sample data preview' : 'From nearby businesses'}
          </span>
          <h3 id={titleId}>
            {isPreview ? 'How local offers will look' : 'Offers near you'}
          </h3>
        </div>
        <div className="offers-section__meta">
          <span>
            {offers.length} {isPreview ? 'sample' : 'live'} {offers.length === 1 ? 'offer' : 'offers'}
          </span>
          <div className="offers-strip__controls" aria-label="Offer navigation">
            <button
              type="button"
              aria-label="Previous offers"
              disabled={!canMoveBack}
              onClick={() => move(-1)}
            >
              <CaretLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next offers"
              disabled={!canMoveForward}
              onClick={() => move(1)}
            >
              <CaretRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div
        className="offers-strip"
        ref={trackRef}
        onScroll={updateControls}
        aria-label={isPreview ? 'Sample local offers' : 'Local offers'}
        tabIndex={0}
      >
        {offers.map((offer) => {
          const linkedItem = offer.product || offer.vendor
          const linkedType = offer.product ? 'product' : 'vendor'
          const metaLabel = offer.code ? 'Code' : 'Ends'
          const metaValue = offer.code || formatOfferExpiry(offer.expiresAt)
          const Card: 'button' | 'article' = linkedItem ? 'button' : 'article'
          const cardProps: ButtonHTMLAttributes<HTMLButtonElement> = linkedItem
            ? {
                type: 'button',
                'aria-label': `Preview ${offer.title} for ${linkedItem.name}`,
                onClick: (event) => onPreview?.(linkedItem, linkedType, event.currentTarget),
              }
            : {}

          return (
            <Card
              className={`offer-card offer-card--${offer.fallbackColor} ${linkedItem ? 'offer-card--linked' : ''}`}
              key={offer.id}
              {...cardProps}
            >
              <span className="offer-card__topline">
                <BadgePercent size={19} aria-hidden="true" />
                <span>{offer.discountLabel || 'Local offer'}</span>
                {isPreview && <em>Sample</em>}
              </span>
              <strong className="offer-card__title">{offer.title}</strong>
              {offer.vendorName && <span className="offer-card__vendor">{offer.vendorName}</span>}
              {(metaValue || linkedItem) && (
                <span className="offer-card__footer">
                  {metaValue && (
                    <span className="offer-card__code">
                      <small>{metaLabel}</small>
                      <strong>{metaValue}</strong>
                    </span>
                  )}
                  {linkedItem && (
                    <span className="offer-card__link">
                      View {linkedType === 'product' ? 'product' : 'business'}
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  )}
                </span>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function OffersEmptyState({
  isPreviewOpen,
  onTogglePreview,
}: {
  isPreviewOpen: boolean
  onTogglePreview: () => void
}) {
  return (
    <aside className="offers-empty-state" aria-label="Local offers availability">
      <span className="offers-empty-state__icon"><BadgePercent size={22} aria-hidden="true" /></span>
      <div>
        <strong>Local offers will appear when businesses publish them.</strong>
        <p>Discounts and coupons are tied to nearby businesses.</p>
      </div>
      <div className="offers-empty-state__actions">
        <span className="offers-empty-state__status">Real offers only</span>
        <button
          type="button"
          aria-expanded={isPreviewOpen}
          aria-controls="sample-offers-preview"
          onClick={onTogglePreview}
        >
          {isPreviewOpen ? 'Hide sample offers' : 'Preview sample offers'}
        </button>
      </div>
    </aside>
  )
}

function PreviewDrawer({
  selection,
  onClose,
}: {
  selection: PreviewSelection | null
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!selection) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      selection.trigger?.focus()
    }
  }, [onClose, selection])

  if (!selection) return null

  const selectedVendor = selection.type === 'vendor' ? selection.item : null
  const selectedProduct = selection.type === 'product' ? selection.item : null
  const vendor = selectedVendor ?? selectedProduct?.vendor ?? null
  const products = selectedVendor?.products ?? []

  return (
    <div className="preview-drawer" role="presentation">
      <button className="preview-drawer__overlay" type="button" aria-label="Close preview" onClick={onClose} />
      <aside
        className="preview-drawer__panel"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
      >
        <div className="preview-drawer__topbar">
          <span><MapPin size={14} /> Neighbourhood preview</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close preview"><X size={20} /></button>
        </div>
        {selectedVendor ? (
          <>
            <div className="preview-drawer__banner"><MediaWithFallback item={selectedVendor} type="banner" /></div>
            <div className="preview-drawer__identity">
              <div className="preview-drawer__logo"><MediaWithFallback item={selectedVendor} /></div>
              <span className="preview-status"><Check size={12} /> {selectedVendor.status === 'ACTIVE' ? 'Available nearby' : selectedVendor.status}</span>
            </div>
            <h2 id="preview-title">{selectedVendor.name}</h2>
            <p>Explore a glimpse of this local business. Full storefront details, pricing and ordering will be available in the Mithra Direct experience.</p>
            <div className="preview-drawer__section">
              <div className="preview-drawer__heading"><strong>Popular picks</strong><span>{products.length}</span></div>
              {products.length ? (
                <div className="preview-product-list">
                  {products.map((product) => (
                    <div key={product.id}>
                      <ProductArtwork product={product} />
                      <div><strong>{product.name}</strong><span>From {selectedVendor.name}</span></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="preview-empty"><ShoppingBag size={18} /><span>Storefront preview coming soon.</span></div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="preview-product-hero"><ProductArtwork product={selectedProduct!} /></div>
            <span className="preview-status"><Sparkles size={12} /> Popular nearby</span>
            <h2 id="preview-title">{selectedProduct!.name}</h2>
            <p>This local pick is available from <strong>{vendor?.name || 'a neighbourhood business'}</strong>. Product details and ordering will be available in the full storefront.</p>
            {vendor && (
              <div className="preview-vendor-chip">
                <div><MediaWithFallback item={vendor} /></div>
                <span><small>Available from</small><strong>{vendor.name}</strong></span>
                <Store size={17} />
              </div>
            )}
          </>
        )}
        <a className="preview-drawer__cta" href="#waitlist" onClick={onClose}>
          Sign up <ArrowRight size={16} />
        </a>
        <small className="preview-drawer__note">Preview data does not include live pricing or availability.</small>
      </aside>
    </div>
  )
}

function DiscoveryError({
  error,
  onRetry,
}: {
  error: DiscoveryRequestError
  onRetry: () => void
}) {
  return (
    <div className="discovery-error" role="alert">
      <span><SearchX size={24} /></span>
      <div>
        <strong>We couldn’t open this neighbourhood.</strong>
        <p>{error?.userMessage || 'The local discovery service is temporarily unavailable.'}</p>
      </div>
      <button type="button" onClick={onRetry}><ArrowsClockwise size={15} /> Try again</button>
    </div>
  )
}

export default function DiscoverySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [query, setQuery] = useState(defaultQuery)
  const [activePlace, setActivePlace] = useState(defaultPlace)
  const [searchText, setSearchText] = useState(defaultPlace.label)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isApplyingPlace, setIsApplyingPlace] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle')
  const [selection, setSelection] = useState<PreviewSelection | null>(null)
  const [showSampleOffers, setShowSampleOffers] = useState(true)
  const { data, error, refresh, isLoading, isRefreshing } = useHomeDiscovery(query)
  const { suggestions, isSearching, error: searchError } = usePlaceSearch(
    searchText,
    searchOpen && isEditingLocation,
  )

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !window.IntersectionObserver) {
      warmLocationService()
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          warmLocationService()
          observer.disconnect()
        }
      },
      { rootMargin: '500px 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1)
  }, [suggestions])

  const applyPlace = (place: LocationPlace) => {
    setActivePlace(place)
    setSearchText(place.label)
    setQuery({
      serviceArea: place.postcode,
      latitude: place.latitude,
      longitude: place.longitude,
    })
    setLocationError('')
    setSearchOpen(false)
    setIsEditingLocation(false)
    setHighlightedIndex(-1)
  }

  const selectPlace = async (place: LocationPlace) => {
    if (isApplyingPlace) return
    setIsApplyingPlace(true)
    setLocationError('')

    try {
      let resolvedPlace = place
      if (!place.postcode) {
        const postcodePlace = await reverseGeocode(place.latitude, place.longitude)
        resolvedPlace = {
          ...place,
          postcode: postcodePlace.postcode,
          detail: place.detail || postcodePlace.detail,
        }
      }

      if (!resolvedPlace.postcode) {
        throw new Error('Choose a more specific address that includes a six-digit pincode.')
      }
      applyPlace(resolvedPlace)
    } catch (placeError) {
      const message = placeError instanceof Error ? placeError.message : ''
      const userMessage = typeof placeError === 'object' &&
        placeError !== null &&
        'userMessage' in placeError
        ? String(placeError.userMessage)
        : ''
      setLocationError(
        userMessage ||
        message ||
        'Choose a more specific address that includes a six-digit pincode.',
      )
    } finally {
      setIsApplyingPlace(false)
    }
  }

  const useCurrentLocation = () => {
    if (window.isSecureContext === false) {
      setLocationError('Current location requires a secure HTTPS connection.')
      return
    }
    if (!navigator.geolocation) {
      setLocationError('Current location is not supported in this browser.')
      return
    }

    setGeoStatus('loading')
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        try {
          const place = await reverseGeocode(latitude, longitude)
          applyPlace({
            ...place,
            latitude,
            longitude,
          })
          setGeoStatus('success')
        } catch (geocodeError) {
          const userMessage = typeof geocodeError === 'object' &&
            geocodeError !== null &&
            'userMessage' in geocodeError
            ? String(geocodeError.userMessage)
            : ''
          setLocationError(
            userMessage ||
            'We found your coordinates but could not resolve a matching address and pincode.',
          )
          setGeoStatus('error')
        }
      },
      (geoError) => {
        const messages: Record<number, string> = {
          1: 'Location permission was denied. Search for an area instead.',
          2: 'Your current location could not be determined.',
          3: 'Finding your location took too long. Please try again.',
        }
        setLocationError(messages[geoError.code] || 'Your current location could not be determined.')
        setGeoStatus('error')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
  }

  const openPreview: PreviewHandler = (item, type, trigger) => {
    if (type === 'vendor') {
      setSelection({ item: item as Vendor, type, trigger })
    } else {
      setSelection({ item: item as Product, type, trigger })
    }
  }
  const closePreview = () => setSelection(null)

  return (
    <section className="neighbourhood" id="top" aria-labelledby="discover-title" ref={sectionRef}>
      <div className="neighbourhood-hero">
        <div className="container neighbourhood-hero__grid">
          <div className="neighbourhood-hero__content">
            <span className="neighbourhood-hero__kicker">
              <Store size={17} aria-hidden="true" />
              Neighbourhood shopping, made direct
            </span>
            <h1 id="discover-title">
              Everything local,
              <span>closer to home.</span>
            </h1>
            <p>
              Shop trusted nearby businesses for fresh food, daily essentials and flexible repeat deliveries.
            </p>
            <div className="location-toolbar" id="discover">
              <label className="location-toolbar__label" htmlFor="delivery-area-search">
                <span>Choose your delivery area</span>
                <small>We’ll show businesses that can serve this location.</small>
              </label>
              <div className="location-toolbar__row">
                <div
                  className="location-search"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false)
                  }}
                >
                  <MapPin size={19} weight="fill" aria-hidden="true" />
                  <div className="location-search__field">
                    <input
                      id="delivery-area-search"
                      type="search"
                      value={searchText}
                      onFocus={() => setSearchOpen(true)}
                      onChange={(event) => {
                        setSearchText(event.target.value)
                        setSearchOpen(true)
                        setIsEditingLocation(true)
                        setHighlightedIndex(-1)
                        setLocationError('')
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowDown' && suggestions.length) {
                          event.preventDefault()
                          setHighlightedIndex((index) => (index + 1) % suggestions.length)
                        }
                        if (event.key === 'ArrowUp' && suggestions.length) {
                          event.preventDefault()
                          setHighlightedIndex((index) => (
                            index <= 0 ? suggestions.length - 1 : index - 1
                          ))
                        }
                        if (event.key === 'Enter' && highlightedIndex >= 0) {
                          event.preventDefault()
                          selectPlace(suggestions[highlightedIndex])
                        }
                        if (event.key === 'Escape') {
                          setSearchText(activePlace.label)
                          setSearchOpen(false)
                          setIsEditingLocation(false)
                          setHighlightedIndex(-1)
                        }
                      }}
                      role="combobox"
                      aria-label="Search for an area or place"
                      aria-expanded={searchOpen && isEditingLocation}
                      aria-controls="location-suggestions"
                      aria-autocomplete="list"
                      aria-activedescendant={
                        highlightedIndex >= 0 ? `location-option-${highlightedIndex}` : undefined
                      }
                      placeholder="Search area or place"
                    />
                    {!isEditingLocation && (
                      <span>
                        {activePlace.detail}
                        {activePlace.locationType === 'APPROXIMATE' ? ', area centre' : ''}
                      </span>
                    )}
                  </div>
                  {isSearching || isApplyingPlace
                    ? <SpinnerGap className="is-spinning location-search__status" size={18} />
                    : <MagnifyingGlass className="location-search__status" size={18} />}
                  {searchOpen && isEditingLocation && (
                    <div className="location-suggestions" id="location-suggestions" role="listbox">
                      {searchText.trim().length < 3 && (
                        <div className="location-suggestions__hint">Type at least three characters to search areas and places.</div>
                      )}
                      {searchText.trim().length >= 3 && !isSearching && suggestions.length === 0 && !searchError && (
                        <div className="location-suggestions__hint">No matching areas found. Try a nearby city or landmark.</div>
                      )}
                      {suggestions.map((place, index) => (
                        <button
                          type="button"
                          role="option"
                          id={`location-option-${index}`}
                          key={place.id}
                          className={highlightedIndex === index ? 'is-highlighted' : ''}
                          aria-selected={highlightedIndex === index}
                          onMouseMove={() => setHighlightedIndex(index)}
                          onClick={() => selectPlace(place)}
                          disabled={isApplyingPlace}
                        >
                          <span><MapPin size={16} /></span>
                          <div>
                            <strong><HighlightedText text={place.name} query={searchText} /></strong>
                            <small><HighlightedText text={place.detail || place.label} query={searchText} /></small>
                          </div>
                          {place.postcode && <em>{place.postcode}</em>}
                        </button>
                      ))}
                      {searchError && <div className="location-suggestions__error">{searchError}</div>}
                      <div className="location-suggestions__credit">
                        <span>Location results by</span>
                        <strong>Google Maps</strong>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="location-toolbar__current"
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={geoStatus === 'loading' || isApplyingPlace}
                >
                  {geoStatus === 'loading'
                    ? <SpinnerGap className="is-spinning" size={18} />
                    : <CrosshairSimple size={18} />}
                  {geoStatus === 'loading' ? 'Locating...' : 'Use my location'}
                </button>
              </div>
              {locationError && <p className="location-toolbar__error" role="alert">{locationError}</p>}
            </div>
          </div>
          <div className="neighbourhood-hero__media">
            <img
              src={onlineOrderingHeroImage}
              alt="A customer orders online while neighbourhood grocery, dairy, bakery, pharmacy and tiffin vendors prepare deliveries"
              width="1440"
              height="1080"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <div className="featured-vendors-section" aria-labelledby="featured-vendors-title">
        <div className="container">
          <div className="featured-vendors__header">
            <div>
              <h2 id="featured-vendors-title">Shops worth knowing, close by.</h2>
              <p>Browse a rotating selection based on your chosen delivery area.</p>
            </div>
            <div className="featured-vendors__location">
              <MapPin size={19} weight="fill" aria-hidden="true" />
              <span>
                <small>Browsing near</small>
                <strong>{activePlace.name}</strong>
              </span>
              <button
                type="button"
                onClick={refresh}
                aria-label="Refresh neighbourhood results"
                disabled={isLoading || isRefreshing}
              >
                <ArrowsClockwise
                  size={18}
                  className={isRefreshing ? 'is-spinning' : ''}
                  aria-hidden="true"
                />
                {isRefreshing ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>
          <div className="featured-vendors__stage">
            {isLoading && !data ? (
              <FeaturedCarouselSkeleton />
            ) : data?.featuredVendors?.length ? (
              <FeaturedCarousel vendors={data.featuredVendors} onPreview={openPreview} />
            ) : (
              <HeroStorefrontFallback />
            )}
          </div>
        </div>
      </div>

      <div className="neighbourhood-results">
        <div className="container">
          {isLoading && <DiscoverySkeleton />}
          {!isLoading && error && !data && <DiscoveryError error={error} onRetry={refresh} />}

          {data && (
            <div className={isRefreshing ? 'discovery-content is-refreshing' : 'discovery-content'}>
              {error && <DiscoveryError error={error} onRetry={refresh} />}
              <div className="live-counts" aria-label="Live neighbourhood counts">
                <div><strong>{data.summary.vendorCount}</strong><span>businesses nearby</span></div>
                <div><strong>{data.summary.productCount}</strong><span>popular local picks</span></div>
                <div><strong><LocateFixed size={19} /> GEO</strong><span>location-based results</span></div>
              </div>

              {data.offers.length > 0 ? (
                <OffersStrip offers={data.offers} onPreview={openPreview} />
              ) : (
                <>
                  <OffersEmptyState
                    isPreviewOpen={showSampleOffers}
                    onTogglePreview={() => setShowSampleOffers((value) => !value)}
                  />
                  {showSampleOffers && (
                    <div id="sample-offers-preview">
                      <OffersStrip
                        offers={buildSampleOffers(data)}
                        isPreview
                        onPreview={openPreview}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="discovery-rail-section">
                <div className="discovery-section-heading">
                  <div><span className="discovery-kicker">Meet your makers</span><h3>New around you</h3></div>
                  <span>{data.vendors.length} local businesses</span>
                </div>
                {data.vendors.length ? (
                  <div className="live-vendor-grid">
                    {data.vendors.map((vendor) => <VendorCard key={vendor.vendorId} vendor={vendor} onPreview={openPreview} />)}
                  </div>
                ) : (
                  <div className="discovery-empty"><Store size={25} /><strong>No businesses found nearby yet.</strong><span>Try another service area or refresh in a moment.</span></div>
                )}
              </div>

              <div className="discovery-products-section">
                <div className="discovery-section-heading">
                  <div><span className="discovery-kicker">From nearby businesses</span><h3>Popular picks</h3></div>
                </div>
                {data.products.length ? (
                  <ProductSlider products={data.products} onPreview={openPreview} />
                ) : (
                  <div className="discovery-empty"><ShoppingBag size={25} /><strong>No popular picks here yet.</strong><span>Try another area or check back soon.</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <PreviewDrawer selection={selection} onClose={closePreview} />
    </section>
  )
}

export {
  BrandFallback,
  DiscoveryError,
  OffersEmptyState,
  OffersStrip,
  PreviewDrawer,
  ProductArtwork,
  SafeImage,
}
