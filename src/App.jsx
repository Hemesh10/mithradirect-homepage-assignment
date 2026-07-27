import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Heart,
  Leaf,
  MapPin,
  Menu,
  Minus,
  Package,
  Pause,
  Play,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  X,
} from 'lucide-react'
import {
  audienceContent,
  brandPrinciples,
  features,
  footerGroups,
  journeySteps,
  navigation,
  sampleBusinesses,
} from './data'
import DiscoverySection from './components/DiscoverySection'

function BrandMark({ light = false }) {
  return (
    <a className={`brand ${light ? 'brand--light' : ''}`} href="#top" aria-label="Mithra Direct home">
      <span className="brand__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand__name">
        mithra <strong>direct</strong>
      </span>
    </a>
  )
}

function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || !('IntersectionObserver' in window)) {
      node?.classList.add('is-visible')
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible')
          observer.unobserve(node)
        }
      },
      { threshold: 0.13 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.classList.add('menu-open')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('menu-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const closeMenu = () => setOpen(false)

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="container header__inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="button button--small button--dark header__cta" href="#waitlist">
          Sign Up <ArrowRight size={15} aria-hidden="true" />
        </a>
        <button
          className="menu-button"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <div id="mobile-navigation" className={`mobile-nav ${open ? 'mobile-nav--open' : ''}`}>
        <nav aria-label="Mobile navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label} <ChevronRight size={18} aria-hidden="true" />
            </a>
          ))}
          <a className="button button--dark" href="#waitlist" onClick={closeMenu}>
            Sign Up <ArrowRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}

function ProductOrb({ type, children }) {
  return <div className={`product-orb product-orb--${type}`}>{children}</div>
}

function HeroVisual() {
  return (
    <div className="hero-visual" aria-label="Mithra Direct product preview">
      <div className="hero-visual__wash" />
      <div className="phone-shell">
        <div className="phone__top">
          <span>9:41</span>
          <div className="phone__status">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="phone__header">
          <div>
            <small>Delivering to</small>
            <strong>12th Main, Indiranagar <ChevronDown size={12} /></strong>
          </div>
          <button type="button" aria-label="Notifications">
            <Bell size={16} />
            <i />
          </button>
        </div>
        <div className="phone__search">
          <Search size={14} />
          <span>Search nearby</span>
        </div>
        <div className="phone__banner">
          <div>
            <small>FRESH THIS MORNING</small>
            <strong>Good things live nearby.</strong>
            <span>Shop neighbourhood favourites</span>
          </div>
          <ProductOrb type="crate">
            <Leaf size={28} />
          </ProductOrb>
        </div>
        <div className="phone__section-title">
          <strong>Near you</strong>
          <span>See all</span>
        </div>
        <div className="shop-list">
          {sampleBusinesses.map((business, index) => (
            <div className="shop-card" key={business.name}>
              <ProductOrb type={business.accent}>
                {index === 0 ? <ShoppingBag /> : index === 1 ? <Leaf /> : <Sparkles />}
              </ProductOrb>
              <div>
                <strong>{business.name}</strong>
                <span>{business.category}</span>
                <small>
                  <Star size={10} fill="currentColor" /> 4.{9 - index} · {business.time}
                </small>
              </div>
              <Heart size={14} />
            </div>
          ))}
        </div>
        <div className="phone__nav">
          <span className="is-active"><Store size={15} />Home</span>
          <span><Search size={15} />Discover</span>
          <span><ShoppingBag size={15} />Orders</span>
        </div>
      </div>

      <div className="floating-card order-card">
        <div className="floating-card__head">
          <span className="icon-pill icon-pill--green"><CheckCircle2 size={17} /></span>
          <div>
            <small>ORDER CONFIRMED</small>
            <strong>The Daily Loaf</strong>
          </div>
        </div>
        <div className="order-card__route">
          <span /><i /><span />
        </div>
        <div className="order-card__meta">
          <span><Clock3 size={13} /> Arrives by 8:30 AM</span>
          <strong>₹285</strong>
        </div>
      </div>

      <div className="floating-card subscription-card">
        <div className="subscription-card__icon"><RepeatBadge /></div>
        <div>
          <small>YOUR WEEKLY BOX</small>
          <strong>Next delivery: Saturday</strong>
          <span>Fresh vegetables · ₹640</span>
        </div>
        <button type="button" aria-label="Pause subscription"><Pause size={13} /></button>
      </div>

      <div className="floating-card vendor-card">
        <div className="vendor-card__head">
          <div>
            <small>TODAY’S ORDERS</small>
            <strong>28</strong>
          </div>
          <span>+12%</span>
        </div>
        <div className="mini-chart" aria-hidden="true">
          {[38, 52, 44, 69, 58, 78, 88].map((height, index) => (
            <i key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="vendor-card__foot">
          <span><i /> New</span>
          <span><i /> Ready</span>
          <strong>₹12,840</strong>
        </div>
      </div>
    </div>
  )
}

function RepeatBadge() {
  return (
    <span className="repeat-badge" aria-hidden="true">
      <ArrowRight size={13} />
      <ArrowRight size={13} />
    </span>
  )
}

function Hero() {
  const marqueeItems = ['Discover local', 'Order direct', 'Subscribe easily', 'Grow together']

  return (
    <section className="hero" id="top">
      <div className="hero__pattern pattern-dots" aria-hidden="true" />
      <div className="container hero__grid">
        <Reveal className="hero__content">
          <div className="eyebrow">
            <span><MapPin size={13} fill="currentColor" /></span>
            Built for the neighbourhood
          </div>
          <h1>
            Local commerce,
            <span className="hero__accent"> made direct.</span>
          </h1>
          <p>
            Discover nearby businesses, order on your terms and build relationships that
            stay in the community.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#discover">
              Explore near you <ArrowDown size={18} aria-hidden="true" />
            </a>
            <a className="text-link" href="#waitlist">
              Sign Up <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="hero__proof">
            <span><Heart size={14} fill="currentColor" /> Direct relationships</span>
            <span><RepeatBadge /> Built for recurring commerce</span>
          </div>
        </Reveal>
        <Reveal className="hero__visual-wrap" delay={120}>
          <HeroVisual />
        </Reveal>
      </div>
      <div className="hero__marquee" aria-label="Mithra Direct benefits">
        <div className="hero__marquee-track">
          {[0, 1].map((group) => (
            <div className="hero__marquee-group" key={group} aria-hidden={group === 1 ? 'true' : undefined}>
              {marqueeItems.map((item) => (
                <span key={`${group}-${item}`}>{item}<i>✦</i></span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CustomerPreview() {
  return (
    <div className="audience-preview audience-preview--customer">
      <div className="catalog-panel">
        <div className="catalog-panel__top">
          <div><span>←</span><strong>Green Basket</strong></div>
          <Heart size={17} />
        </div>
        <div className="catalog-shop">
          <ProductOrb type="green"><Leaf /></ProductOrb>
          <div>
            <span>Fresh produce · 1.2 km</span>
            <small><Star size={11} fill="currentColor" /> 4.9 · Open until 8 PM</small>
          </div>
        </div>
        <div className="catalog-tabs"><strong>Popular</strong><span>Vegetables</span><span>Fruit</span></div>
        <div className="product-grid">
          <ProductTile color="green" name="Farm Fresh Box" price="₹640" label="Bestseller" />
          <ProductTile color="yellow" name="Fruit Mix" price="₹420" label="Seasonal" />
        </div>
      </div>
      <div className="cart-panel">
        <div className="cart-panel__top">
          <span>Your basket</span><strong>3 items</strong>
        </div>
        <div className="cart-item">
          <ProductOrb type="green"><Leaf size={18} /></ProductOrb>
          <div><strong>Farm Fresh Box</strong><span>Medium · Weekly</span></div>
          <strong>₹640</strong>
        </div>
        <div className="delivery-choice">
          <span><Truck size={15} /> Delivery</span>
          <strong>Saturday, 8–10 AM</strong>
        </div>
        <div className="cart-total"><span>Total</span><strong>₹680</strong></div>
        <button type="button">Place order <ArrowRight size={14} /></button>
      </div>
    </div>
  )
}

function ProductTile({ color, name, price, label }) {
  return (
    <div className="product-tile">
      <div className={`product-tile__image product-tile__image--${color}`}>
        <Leaf size={30} />
        <small>{label}</small>
      </div>
      <strong>{name}</strong>
      <span>{price}</span>
      <button type="button" aria-label={`Add ${name}`}><Plus size={14} /></button>
    </div>
  )
}

function VendorPreview() {
  return (
    <div className="audience-preview audience-preview--vendor">
      <div className="dashboard-bar">
        <div><span className="brand__mark"><span /><span /><span /></span><strong>mithra</strong></div>
        <span><Search size={15} /><Bell size={15} /></span>
      </div>
      <div className="dashboard-body">
        <aside>
          <span className="is-active"><Package size={15} /> Orders</span>
          <span><RepeatIcon /> Subscriptions</span>
          <span><Truck size={15} /> Deliveries</span>
          <span><Heart size={15} /> Customers</span>
        </aside>
        <div className="orders-board">
          <div className="orders-board__title">
            <div><small>MONDAY, 17 JUNE</small><strong>Good morning, Ananya</strong></div>
            <button type="button">+ New order</button>
          </div>
          <div className="dashboard-metrics">
            <div><span>Today’s orders</span><strong>28</strong><small>+12%</small></div>
            <div><span>Ready to deliver</span><strong>11</strong><small>On track</small></div>
            <div><span>Weekly revenue</span><strong>₹42.8k</strong><small>+8.4%</small></div>
          </div>
          <div className="order-table">
            <div className="order-table__head"><span>Order</span><span>Customer</span><span>Delivery</span><span>Status</span></div>
            {[
              ['#MD-1048', 'Meera I.', '8:00 AM', 'Packing'],
              ['#MD-1047', 'Rohan S.', '9:30 AM', 'Ready'],
              ['#MD-1046', 'Aditi K.', '11:00 AM', 'New'],
            ].map((row) => (
              <div className="order-table__row" key={row[0]}>
                {row.map((cell, index) => <span key={cell} className={index === 3 ? `status status--${cell.toLowerCase()}` : ''}>{cell}</span>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RepeatIcon() {
  return (
    <span className="repeat-icon" aria-hidden="true">
      <ArrowRight size={11} /><ArrowRight size={11} />
    </span>
  )
}

function AudienceSection() {
  const [audience, setAudience] = useState('customers')
  const content = audienceContent[audience]

  return (
    <section className="section audience" id="why-mithra">
      <div className="container">
        <Reveal className="section-heading section-heading--center">
          <span className="kicker">One neighbourhood. Two sides. Connected.</span>
          <h2>Better for the people who buy.<br />Powerful for the people who sell.</h2>
        </Reveal>
        <div className="audience-tabs" role="tablist" aria-label="Choose an audience">
          <button
            type="button"
            role="tab"
            aria-selected={audience === 'customers'}
            className={audience === 'customers' ? 'is-active' : ''}
            onClick={() => setAudience('customers')}
          >
            <ShoppingBag size={17} /> For customers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={audience === 'vendors'}
            className={audience === 'vendors' ? 'is-active' : ''}
            onClick={() => setAudience('vendors')}
          >
            <Store size={17} /> For local businesses
          </button>
        </div>
        <Reveal className="audience-card">
          <div className="audience-card__content">
            <span className="kicker">{content.eyebrow}</span>
            <h3>{content.title}</h3>
            <p>{content.copy}</p>
            <ul>
              {content.bullets.map((bullet) => (
                <li key={bullet}><Check size={15} /> {bullet}</li>
              ))}
            </ul>
            <a className="inline-link" href="#waitlist">
              {audience === 'customers' ? 'Find your local favourites' : 'Grow your local business'}
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="audience-card__preview" role="tabpanel">
            {audience === 'customers' ? <CustomerPreview /> : <VendorPreview />}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Journey() {
  return (
    <section className="section journey" id="how-it-works">
      <div className="journey__shape" aria-hidden="true" />
      <div className="container">
        <Reveal className="section-heading">
          <span className="kicker kicker--light">How Mithra Direct works</span>
          <h2>From “near me” to<br />“see you next week.”</h2>
          <p>A simple journey that turns a neighbourhood purchase into lasting local connection.</p>
        </Reveal>
        <div className="journey-grid">
          {journeySteps.map((step, index) => {
            const Icon = step.icon
            return (
              <Reveal className="journey-step" key={step.number} delay={index * 90}>
                <div className={`journey-step__icon journey-step__icon--${step.color}`}>
                  <Icon size={24} />
                </div>
                <span className="journey-step__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
                {index < journeySteps.length - 1 && <ArrowRight className="journey-step__arrow" size={20} />}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SubscriptionSection() {
  const [frequency, setFrequency] = useState('Every week')

  return (
    <section className="section subscriptions">
      <div className="container subscriptions__grid">
        <Reveal className="subscription-visual">
          <div className="subscription-card-main">
            <div className="subscription-card-main__top">
              <div>
                <span className="icon-pill icon-pill--purple"><RepeatBadge /></span>
                <div><small>ACTIVE SUBSCRIPTION</small><strong>My weekly essentials</strong></div>
              </div>
              <span className="active-pill">Active</span>
            </div>
            <div className="subscription-product">
              <div className="subscription-product__art">
                <Leaf size={36} />
                <span>FRESH</span>
              </div>
              <div><strong>Fresh produce box</strong><span>Green Basket · Medium</span><small>₹640 per delivery</small></div>
              <button type="button" aria-label="Edit quantity"><Minus size={14} /><span>1</span><Plus size={14} /></button>
            </div>
            <div className="subscription-settings">
              <div>
                <span><Clock3 size={14} /> Frequency</span>
                <select value={frequency} onChange={(event) => setFrequency(event.target.value)} aria-label="Delivery frequency">
                  <option>Every week</option>
                  <option>Every 2 weeks</option>
                  <option>Every month</option>
                </select>
              </div>
              <div>
                <span><Truck size={14} /> Next delivery</span>
                <strong>Sat, 22 June</strong>
              </div>
            </div>
            <div className="subscription-card-main__actions">
              <button type="button"><Pause size={14} /> Pause</button>
              <button type="button">Manage subscription <ArrowRight size={14} /></button>
            </div>
          </div>
          <div className="subscription-float">
            <span><CheckCircle2 size={17} /></span>
            <div><strong>Delivery scheduled</strong><small>Saturday · 8–10 AM</small></div>
          </div>
        </Reveal>
        <Reveal className="subscriptions__content" delay={100}>
          <span className="kicker">Commerce that keeps flowing</span>
          <h2>One less thing to remember. One more reason to stay.</h2>
          <p>
            Make everyday essentials effortless for customers and demand more predictable
            for local businesses.
          </p>
          <div className="subscription-benefits">
            <div><span><Play size={15} fill="currentColor" /></span><p><strong>Flexible for customers</strong>Pause, skip or change a delivery in a tap.</p></div>
            <div><span><BarGlyph /></span><p><strong>Predictable for businesses</strong>Plan stock and fulfilment with repeat demand.</p></div>
            <div><span><Heart size={15} fill="currentColor" /></span><p><strong>Better over time</strong>Turn reliable service into genuine loyalty.</p></div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function BarGlyph() {
  return <span className="bar-glyph" aria-hidden="true"><i /><i /><i /></span>
}

function Features() {
  return (
    <section className="section features" id="features">
      <div className="container">
        <Reveal className="section-heading section-heading--center">
          <span className="kicker">A better way to do local business</span>
          <h2>Everything commerce needs.<br />Nothing in the way.</h2>
          <p>Thoughtful tools that make buying simpler and running a neighbourhood business calmer.</p>
        </Reveal>
        <div className="feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Reveal className="feature-card" key={feature.title} delay={(index % 3) * 70}>
                <div className={`feature-card__icon feature-card__icon--${feature.color}`}><Icon size={22} /></div>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
                <a href="#waitlist" aria-label={`Learn more about ${feature.title}`}><ArrowRight size={17} /></a>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Impact() {
  return (
    <section className="section impact" id="impact">
      <div className="container">
        <div className="impact__top">
          <Reveal className="section-heading">
            <span className="kicker kicker--light">When local wins, everyone does</span>
            <h2>More value stays<br />close to home.</h2>
          </Reveal>
          <Reveal className="impact__copy" delay={80}>
            <p>
              Mithra Direct is designed to strengthen the businesses that make a neighbourhood
              feel like one—without standing between them and their customers. These are the
              principles the platform is being built around.
            </p>
          </Reveal>
        </div>
        <div className="principle-grid">
          {brandPrinciples.map((principle, index) => {
            const Icon = principle.icon
            return (
              <Reveal className="principle-card" key={principle.title} delay={index * 70}>
                <span className={`principle-card__icon principle-card__icon--${principle.color}`}>
                  <Icon size={20} />
                </span>
                <h3>{principle.title}</h3>
                <p>{principle.copy}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Waitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (event) => {
    event.preventDefault()
    if (!event.currentTarget.checkValidity()) return
    setSubmitted(true)
  }

  return (
    <section className="waitlist" id="waitlist">
      <div className="waitlist__shape waitlist__shape--one" aria-hidden="true" />
      <div className="waitlist__shape waitlist__shape--two" aria-hidden="true" />
      <div className="container waitlist__inner">
        <Reveal>
          <div className="waitlist__icon"><MapPin size={25} fill="currentColor" /></div>
          <span className="kicker">Your neighbourhood is next</span>
          <h2>Let’s make local<br />the easiest choice.</h2>
          <p>Join the early community of customers and businesses shaping Mithra Direct.</p>
          {submitted ? (
            <div className="success-message" role="status">
              <CheckCircle2 size={22} />
              <div><strong>You’re signed up!</strong><span>We’ll share neighbourhood updates with {email}.</span></div>
              <button type="button" onClick={() => setSubmitted(false)}>Use another email</button>
            </div>
          ) : (
            <form className="waitlist-form" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="waitlist-email">Email address</label>
              <input
                id="waitlist-email"
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="button button--dark" type="submit">
                Sign Up <ArrowRight size={17} />
              </button>
            </form>
          )}
          <small className="waitlist__note">No spam. Just meaningful updates from around the corner.</small>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <BrandMark light />
            <p>The digital operating system for neighbourhood commerce.</p>
            <div className="footer__location"><MapPin size={14} /> Made for neighbourhoods everywhere</div>
          </div>
          <div className="footer__links">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <strong>{group.title}</strong>
                {group.links.map((link) => <a href="#top" key={link}>{link}</a>)}
              </div>
            ))}
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 Mithra Direct. Made with care for local commerce.</span>
          <div><span className="pulse-dot" /> Building neighbourhood by neighbourhood</div>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content">
        <Hero />
        <DiscoverySection />
        <AudienceSection />
        <Journey />
        <SubscriptionSection />
        <Features />
        <Impact />
        <Waitlist />
      </main>
      <Footer />
    </>
  )
}
