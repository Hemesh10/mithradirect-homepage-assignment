import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Leaf,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Pause,
  Play,
  RefreshCw,
  Search,
  SearchX,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from 'lucide-react'
import { useHomeDiscovery } from '../hooks/useHomeDiscovery'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import { reverseGeocode } from '../api/locationApi'

const defaultQuery = {
  serviceArea: '502103',
  latitude: 18.100525,
  longitude: 78.848279,
}

const defaultPlace = {
  id: 'default-siddipet',
  name: 'Siddipet',
  label: 'Siddipet, Telangana',
  detail: 'Telangana · 502103',
  postcode: '502103',
  latitude: defaultQuery.latitude,
  longitude: defaultQuery.longitude,
}

function SafeImage({ src, alt, className = '' }) {
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

function BrandFallback({ item, className = '' }) {
  return (
    <div className={`brand-fallback brand-fallback--${item.fallbackColor} ${className}`} aria-hidden="true">
      <span className="brand-fallback__dots" />
      <strong>{item.initials || item.name?.slice(0, 2).toUpperCase()}</strong>
      <small>Local goodness, made direct</small>
    </div>
  )
}

function MediaWithFallback({ item, type = 'thumbnail', className = '' }) {
  const src = type === 'banner' ? item.bannerUrl : item.thumbnailUrl
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  if (!src || failed) return <BrandFallback item={item} className={className} />

  return (
    <img
      className={className}
      src={src}
      alt={`${item.name} ${type}`}
      loading={type === 'banner' ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

function DiscoverySkeleton() {
  return (
    <div className="discovery-skeleton" aria-label="Loading neighbourhood businesses">
      <div className="skeleton skeleton--toolbar" />
      <div className="skeleton skeleton--feature" />
      <div className="skeleton-row">
        {[1, 2, 3, 4].map((item) => <div className="skeleton skeleton--vendor" key={item} />)}
      </div>
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((item) => <div className="skeleton skeleton--product" key={item} />)}
      </div>
    </div>
  )
}

function FeaturedCarousel({ vendors, onPreview }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const touchStart = useRef(null)
  const activeVendor = vendors[activeIndex]

  useEffect(() => {
    if (activeIndex > vendors.length - 1) setActiveIndex(0)
  }, [activeIndex, vendors.length])

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (paused || interacting || reduceMotion || vendors.length < 2) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % vendors.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [interacting, paused, vendors.length])

  if (!activeVendor) return null

  const move = (direction) => {
    setActiveIndex((index) => (index + direction + vendors.length) % vendors.length)
  }

  const onPointerDown = (event) => {
    touchStart.current = event.clientX
    setInteracting(true)
  }

  const onPointerUp = (event) => {
    if (touchStart.current !== null) {
      const distance = event.clientX - touchStart.current
      if (Math.abs(distance) > 42) move(distance > 0 ? -1 : 1)
    }
    touchStart.current = null
    setInteracting(false)
  }

  return (
    <div
      className="featured-carousel"
      aria-roledescription="carousel"
      aria-label="Featured neighbourhood businesses"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setInteracting(false)}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false)
      }}
    >
      <div className="featured-carousel__media">
        <MediaWithFallback item={activeVendor} type="banner" />
        <span className="featured-carousel__label"><Sparkles size={13} /> Featured nearby</span>
      </div>
      <div className="featured-carousel__content" aria-live="polite">
        <span className="discovery-kicker">Neighbourhood spotlight</span>
        <h3>{activeVendor.name}</h3>
        <p>
          Discover what this local business is bringing to your neighbourhood through
          Mithra Direct.
        </p>
        <div className="featured-carousel__actions">
          <button type="button" className="discovery-primary-action" onClick={(event) => onPreview(activeVendor, 'vendor', event.currentTarget)}>
            Preview business <ArrowRight size={16} />
          </button>
          <span>{activeVendor.products.length} popular {activeVendor.products.length === 1 ? 'pick' : 'picks'}</span>
        </div>
      </div>
      <div className="featured-carousel__controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous featured business">
          <ChevronLeft size={18} />
        </button>
        <div className="featured-carousel__dots" role="group" aria-label="Choose featured business">
          {vendors.map((vendor, index) => (
            <button
              type="button"
              key={`${vendor.vendorId}-${index}`}
              className={index === activeIndex ? 'is-active' : ''}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${vendor.name}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
        <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Play carousel' : 'Pause carousel'}>
          {paused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Next featured business">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

function VendorCard({ vendor, onPreview }) {
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

function ProductArtwork({ product, className = '' }) {
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

function ProductCard({ product, onPreview }) {
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

function ProductSlider({ products, onPreview }) {
  const trackRef = useRef(null)
  const [canMoveBack, setCanMoveBack] = useState(false)
  const [canMoveForward, setCanMoveForward] = useState(products.length > 1)
  const [progress, setProgress] = useState(0)

  const updateControls = () => {
    const track = trackRef.current
    if (!track) return
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth)
    setCanMoveBack(track.scrollLeft > 4)
    setCanMoveForward(track.scrollLeft < maximum - 4)
    setProgress(maximum > 0 ? Math.min(100, (track.scrollLeft / maximum) * 100) : 100)
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateControls)
    window.addEventListener('resize', updateControls)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateControls)
    }
  }, [products.length])

  const move = (direction) => {
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
            <ChevronLeft size={19} />
          </button>
          <button type="button" onClick={() => move(1)} disabled={!canMoveForward} aria-label="Next popular products">
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      <div className="product-slider__progress" aria-hidden="true">
        <span style={{ width: `${Math.max(12, progress)}%` }} />
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

function PreviewDrawer({ selection, onClose }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const item = selection?.item
  const isVendor = selection?.type === 'vendor'

  useEffect(() => {
    if (!selection) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll(
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

  if (!selection || !item) return null

  const vendor = isVendor ? item : item.vendor
  const products = isVendor ? item.products : []

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
        {isVendor ? (
          <>
            <div className="preview-drawer__banner"><MediaWithFallback item={item} type="banner" /></div>
            <div className="preview-drawer__identity">
              <div className="preview-drawer__logo"><MediaWithFallback item={item} /></div>
              <span className="preview-status"><Check size={12} /> {item.status === 'ACTIVE' ? 'Available nearby' : item.status}</span>
            </div>
            <h2 id="preview-title">{item.name}</h2>
            <p>Explore a glimpse of this local business. Full storefront details, pricing and ordering will be available in the Mithra Direct experience.</p>
            <div className="preview-drawer__section">
              <div className="preview-drawer__heading"><strong>Popular picks</strong><span>{products.length}</span></div>
              {products.length ? (
                <div className="preview-product-list">
                  {products.map((product) => (
                    <div key={product.id}>
                      <ProductArtwork product={product} />
                      <div><strong>{product.name}</strong><span>From {item.name}</span></div>
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
            <div className="preview-product-hero"><ProductArtwork product={item} /></div>
            <span className="preview-status"><Sparkles size={12} /> Popular nearby</span>
            <h2 id="preview-title">{item.name}</h2>
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
          Sign up for storefront access <ArrowRight size={16} />
        </a>
        <small className="preview-drawer__note">Preview data does not include live pricing or availability.</small>
      </aside>
    </div>
  )
}

function DiscoveryError({ error, onRetry }) {
  return (
    <div className="discovery-error" role="alert">
      <span><SearchX size={24} /></span>
      <div>
        <strong>We couldn’t open this neighbourhood.</strong>
        <p>{error?.userMessage || 'The local discovery service is temporarily unavailable.'}</p>
      </div>
      <button type="button" onClick={onRetry}><RefreshCw size={15} /> Try again</button>
    </div>
  )
}

export default function DiscoverySection() {
  const [query, setQuery] = useState(defaultQuery)
  const [activePlace, setActivePlace] = useState(defaultPlace)
  const [searchText, setSearchText] = useState(defaultPlace.label)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle')
  const [selection, setSelection] = useState(null)
  const { data, error, refresh, isLoading, isRefreshing } = useHomeDiscovery(query)
  const { suggestions, isSearching, error: searchError } = usePlaceSearch(
    searchText,
    searchOpen && isEditingLocation,
  )

  const selectPlace = (place) => {
    const postcode = place.postcode || query.serviceArea
    const resolvedPlace = {
      ...place,
      postcode,
      detail: place.detail || `Pincode ${postcode}`,
    }

    setActivePlace(resolvedPlace)
    setSearchText(resolvedPlace.label)
    setQuery({
      serviceArea: postcode,
      latitude: resolvedPlace.latitude,
      longitude: resolvedPlace.longitude,
    })
    setLocationError('')
    setSearchOpen(false)
    setIsEditingLocation(false)
  }

  const useCurrentLocation = () => {
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
          selectPlace({
            ...place,
            postcode: place.postcode || query.serviceArea,
          })
          setGeoStatus('success')
        } catch {
          const fallbackPlace = {
            id: `current-${latitude}-${longitude}`,
            name: 'Current location',
            label: 'Current location',
            detail: `${latitude.toFixed(4)}, ${longitude.toFixed(4)} · ${query.serviceArea}`,
            postcode: query.serviceArea,
            latitude,
            longitude,
          }
          selectPlace(fallbackPlace)
          setLocationError('We found your coordinates but could not resolve the area name.')
          setGeoStatus('error')
        }
      },
      (geoError) => {
        const messages = {
          1: 'Location permission was denied. Search for an area instead.',
          2: 'Your current location could not be determined.',
          3: 'Finding your location took too long. Please try again.',
        }
        setLocationError(messages[geoError.code] || 'Your current location could not be determined.')
        setGeoStatus('error')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const openPreview = (item, type, trigger) => setSelection({ item, type, trigger })
  const closePreview = () => setSelection(null)

  return (
    <section className="neighbourhood" id="discover" aria-labelledby="discover-title">
      <div className="container">
        <div className="neighbourhood__heading">
          <div>
            <span className="kicker">Live neighbourhood preview</span>
            <h2 id="discover-title">See what’s good<br />around the corner.</h2>
          </div>
          <p>Real businesses and popular picks returned for your service area—framed through the Mithra Direct experience.</p>
        </div>

        <div className="location-toolbar">
          <div
            className="location-search"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false)
            }}
          >
            <MapPin size={18} fill="currentColor" />
            <div className="location-search__field">
              <small>Explore businesses near</small>
              <input
                type="search"
                value={searchText}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setSearchText(event.target.value)
                  setSearchOpen(true)
                  setIsEditingLocation(true)
                  setLocationError('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setSearchText(activePlace.label)
                    setSearchOpen(false)
                    setIsEditingLocation(false)
                  }
                }}
                role="combobox"
                aria-label="Search for an area or place"
                aria-expanded={searchOpen && isEditingLocation}
                aria-controls="location-suggestions"
                aria-autocomplete="list"
                placeholder="Search area or place"
              />
              {!isEditingLocation && <span>{activePlace.detail}</span>}
            </div>
            {isSearching ? <LoaderCircle className="is-spinning location-search__status" size={17} /> : <Search className="location-search__status" size={17} />}
            {searchOpen && isEditingLocation && (
              <div className="location-suggestions" id="location-suggestions" role="listbox">
                {searchText.trim().length < 3 && (
                  <div className="location-suggestions__hint">Type at least three characters to search areas and places.</div>
                )}
                {searchText.trim().length >= 3 && !isSearching && suggestions.length === 0 && !searchError && (
                  <div className="location-suggestions__hint">No matching areas found. Try a nearby city or landmark.</div>
                )}
                {suggestions.map((place) => (
                  <button type="button" role="option" key={place.id} onClick={() => selectPlace(place)}>
                    <span><MapPin size={15} /></span>
                    <div><strong>{place.name}</strong><small>{place.detail || place.label}</small></div>
                    {place.postcode && <em>{place.postcode}</em>}
                  </button>
                ))}
                {searchError && <div className="location-suggestions__error">{searchError}</div>}
                <div className="location-suggestions__credit">Search data © OpenStreetMap contributors</div>
              </div>
            )}
          </div>
          <div className="location-toolbar__actions">
            {isRefreshing && <span className="refreshing-label"><LoaderCircle size={14} /> Refreshing</span>}
            <button type="button" onClick={useCurrentLocation} disabled={geoStatus === 'loading'}>
              {geoStatus === 'loading' ? <LoaderCircle className="is-spinning" size={16} /> : <Crosshair size={16} />}
              {geoStatus === 'loading' ? 'Locating…' : 'Use my location'}
            </button>
            <button type="button" onClick={refresh} aria-label="Refresh neighbourhood results" disabled={isLoading || isRefreshing}>
              <RefreshCw size={16} className={isRefreshing ? 'is-spinning' : ''} />
            </button>
          </div>
          {locationError && <p className="location-toolbar__error" role="alert">{locationError}</p>}
        </div>

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

            {data.featuredVendors.length > 0 && (
              <FeaturedCarousel vendors={data.featuredVendors} onPreview={openPreview} />
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
      <PreviewDrawer selection={selection} onClose={closePreview} />
    </section>
  )
}

export {
  BrandFallback,
  DiscoveryError,
  PreviewDrawer,
  ProductArtwork,
  SafeImage,
}
