import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  CaretRight,
  List,
  Pause,
  Play,
  X,
} from '@phosphor-icons/react'
import {
  Check,
  HeartHandshake,
  MapPin,
  ShoppingBag,
  Store,
} from 'lucide-react'
import DiscoverySection from './components/DiscoverySection'
import {
  audienceContent,
  brandPrinciples,
  features,
  footerGroups,
  journeySteps,
  navigation,
} from './data'
import heroImage from './assets/hyperlocal-platform-hero.webp'
import bakerImage from './assets/local-baker-orders.webp'
import dairySubscriptionImage from './assets/dairy-subscription-delivery.webp'

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
      { threshold: 0.12 },
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

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.body.classList.add('menu-open')
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('menu-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="container header__inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="button button--small button--ink header__cta" href="#waitlist">
          Sign up <ArrowRight size={15} aria-hidden="true" />
        </a>
        <button
          className="menu-button"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {open ? <X /> : <List />}
        </button>
      </div>
      <div id="mobile-navigation" className={`mobile-nav ${open ? 'mobile-nav--open' : ''}`}>
        <nav aria-label="Mobile navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label} <CaretRight size={18} aria-hidden="true" />
            </a>
          ))}
          <a className="button button--ink" href="#waitlist" onClick={() => setOpen(false)}>
            Sign up <ArrowRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <Reveal className="hero__content">
          <div className="hero__eyebrow">
            <MapPin size={14} fill="currentColor" aria-hidden="true" />
            Built for the neighbourhood
          </div>
          <h1>Local, made direct.</h1>
          <p>
            Discover trusted local businesses, order directly, and keep more value close to home.
          </p>
          <div className="hero__actions">
            <a className="button button--accent" href="#discover">
              Explore nearby <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button button--text" href="#why-mithra">
              For businesses
            </a>
          </div>
        </Reveal>
        <Reveal className="hero__media" delay={100}>
          <img
            src={heroImage}
            alt="A mobile neighbourhood marketplace connecting customers with local produce, dairy, bakery, pharmacy and tiffin businesses"
            width="1120"
            height="1400"
            fetchPriority="high"
          />
        </Reveal>
      </div>
    </section>
  )
}

function AudienceSection() {
  const customer = audienceContent.customers
  const vendor = audienceContent.vendors

  return (
    <section className="section audience" id="why-mithra">
      <div className="container">
        <Reveal className="section-heading">
          <h2>Better for both sides of the counter.</h2>
          <p>One direct connection, designed around how neighbourhood commerce really works.</p>
        </Reveal>
        <div className="audience__grid">
          <Reveal className="audience__media">
            <img
              src={bakerImage}
              alt="A local baker prepares customer orders for the morning"
              width="1440"
              height="960"
              loading="lazy"
              decoding="async"
            />
          </Reveal>
          <div className="audience__stories">
            <Reveal className="audience-story" delay={60}>
              <span className="audience-story__icon"><ShoppingBag size={20} /></span>
              <h3>{customer.title}</h3>
              <p>{customer.copy}</p>
              <ul>
                {customer.bullets.map((bullet) => (
                  <li key={bullet}><Check size={15} /> {bullet}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="audience-story" delay={120}>
              <span className="audience-story__icon"><Store size={20} /></span>
              <h3>{vendor.title}</h3>
              <p>{vendor.copy}</p>
              <ul>
                {vendor.bullets.map((bullet) => (
                  <li key={bullet}><Check size={15} /> {bullet}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function Journey() {
  return (
    <section className="section journey" id="how-it-works">
      <div className="container journey__grid">
        <Reveal className="section-heading journey__heading">
          <h2>From nearby to on its way.</h2>
          <p>A clear path from discovery to delivery, with the relationship still intact.</p>
        </Reveal>
        <div className="journey__steps">
          {journeySteps.map((step, index) => {
            const Icon = step.icon
            return (
              <Reveal className="journey-step" key={step.title} delay={index * 70}>
                <span><Icon size={21} /></span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
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
  const [paused, setPaused] = useState(false)

  return (
    <section className="section subscriptions" id="subscriptions">
      <div className="container subscriptions__grid">
        <Reveal className="subscriptions__content">
          <span className="section-label">Designed to repeat</span>
          <h2>Your essentials can arrive on your rhythm.</h2>
          <p>Set a schedule once, then pause or change it whenever life does.</p>
          <div className="subscription-control">
            <label htmlFor="delivery-frequency">Delivery frequency</label>
            <div>
              <select
                id="delivery-frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
              >
                <option>Every week</option>
                <option>Every 2 weeks</option>
                <option>Every month</option>
              </select>
              <button type="button" onClick={() => setPaused((value) => !value)}>
                {paused ? <Play size={15} /> : <Pause size={15} />}
                {paused ? 'Resume' : 'Pause'}
              </button>
            </div>
            <small role="status">
              {paused ? 'Deliveries are paused.' : `Next delivery is set for ${frequency.toLowerCase()}.`}
            </small>
          </div>
        </Reveal>
        <Reveal className="subscriptions__media" delay={100}>
          <img
            src={dairySubscriptionImage}
            alt="A local dairy owner prepares milk, curd and paneer for a recurring delivery"
            width="1440"
            height="960"
            loading="lazy"
            decoding="async"
          />
        </Reveal>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="section features" id="features">
      <div className="container">
        <Reveal className="section-heading">
          <h2>The tools stay out of the way.</h2>
          <p>Everything needed to buy, fulfil, and return, without turning local commerce into a faceless marketplace.</p>
        </Reveal>
        <div className="feature-list">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Reveal className="feature-item" key={feature.title} delay={(index % 3) * 50}>
                <Icon size={22} />
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                </div>
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
      <div className="container impact__grid">
        <Reveal className="impact__statement">
          <HeartHandshake size={28} />
          <h2>Local commerce works better when the relationship stays local.</h2>
          <p>Mithra Direct supports each transaction without taking ownership of the customer connection.</p>
        </Reveal>
        <div className="principle-list">
          {brandPrinciples.map((principle, index) => {
            const Icon = principle.icon
            return (
              <Reveal className="principle-item" key={principle.title} delay={index * 60}>
                <Icon size={20} />
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </div>
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
  const [error, setError] = useState('')

  const onSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget

    if (!form.checkValidity()) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setSubmitted(true)
  }

  return (
    <section className="waitlist" id="waitlist">
      <div className="container waitlist__grid">
        <Reveal className="waitlist__copy">
          <h2>Make local the easy choice.</h2>
          <p>Join customers and businesses shaping the next Mithra Direct neighbourhood.</p>
        </Reveal>
        <Reveal className="waitlist__form-wrap" delay={80}>
          {submitted ? (
            <div className="success-message" role="status">
              <Check size={20} />
              <div>
                <strong>You are on the list.</strong>
                <span>Updates will go to {email}.</span>
              </div>
              <button type="button" onClick={() => setSubmitted(false)}>Use another email</button>
            </div>
          ) : (
            <form className="waitlist-form" onSubmit={onSubmit} noValidate>
              <label htmlFor="waitlist-email">Email address</label>
              <div>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  aria-describedby={error ? 'waitlist-error' : 'waitlist-note'}
                  aria-invalid={Boolean(error)}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (error) setError('')
                  }}
                />
                <button className="button button--ink" type="submit">
                  Sign up <ArrowRight size={17} />
                </button>
              </div>
              {error ? (
                <small id="waitlist-error" className="waitlist-form__error" role="alert">{error}</small>
              ) : (
                <small id="waitlist-note">No spam. Just useful neighbourhood updates.</small>
              )}
            </form>
          )}
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
          <span>© 2026 Mithra Direct</span>
          <span>Built for local commerce</span>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return undefined

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

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
