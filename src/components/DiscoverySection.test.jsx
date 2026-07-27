import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DiscoverySection from './DiscoverySection'
import { normalizeHomeResponse } from '../api/homeAdapter'
import { homeFixture } from '../test/homeFixture'
import { useHomeDiscovery } from '../hooks/useHomeDiscovery'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import { reverseGeocode, warmLocationService } from '../api/locationApi'

vi.mock('../hooks/useHomeDiscovery', () => ({
  useHomeDiscovery: vi.fn(),
}))

vi.mock('../hooks/usePlaceSearch', () => ({
  usePlaceSearch: vi.fn(),
}))

vi.mock('../api/locationApi', () => ({
  reverseGeocode: vi.fn(),
  warmLocationService: vi.fn(),
}))

const normalizedData = normalizeHomeResponse(homeFixture)

describe('DiscoverySection', () => {
  beforeEach(() => {
    useHomeDiscovery.mockReturnValue({
      data: normalizedData,
      error: null,
      refresh: vi.fn(),
      isLoading: false,
      isRefreshing: false,
    })
    usePlaceSearch.mockReturnValue({
      suggestions: [],
      isSearching: false,
      error: '',
    })
    reverseGeocode.mockReset()
    warmLocationService.mockResolvedValue()
  })

  it('renders live counts, an honest empty state, and a sample offers preview', async () => {
    const user = userEvent.setup()
    render(<DiscoverySection />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('businesses nearby')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.queryByText(/offers near you/i)).not.toBeInTheDocument()
    expect(screen.getByText(/local offers will appear when businesses publish them/i)).toBeInTheDocument()
    expect(screen.getByText('Discounts and coupons are tied to nearby businesses.')).toBeInTheDocument()
    expect(screen.getByText('Real offers only')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'How local offers will look' })).toBeInTheDocument()
    expect(screen.getByText('LOCAL15')).toBeInTheDocument()
    expect(screen.getByText('REPEAT18')).toBeInTheDocument()
    expect(screen.getByText('WEEKEND10')).toBeInTheDocument()
    expect(screen.getByText('NEARBY11')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next offers' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', {
      name: 'Preview A little extra off a popular pick for Sarvapindi',
    }))
    expect(screen.getByRole('dialog', { name: 'Sarvapindi' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Sarvapindi' })).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Hide sample offers' }))
    expect(screen.queryByRole('heading', { name: 'How local offers will look' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview sample offers' })).toBeInTheDocument()
  })

  it('falls back from a featured banner to its thumbnail and then the business name', async () => {
    render(<DiscoverySection />)
    const carousel = screen.getByLabelText('Featured neighbourhood businesses')

    expect(within(carousel).getByRole('img', {
      name: 'Kammani - Authentic Telangana Snacks',
    })).toBeInTheDocument()
    expect(within(carousel).getAllByText('Kammani - Authentic Telangana Snacks')).toHaveLength(2)
    expect(within(carousel).getByText('Featured local business')).toBeInTheDocument()
    expect(within(carousel).queryByText(/Discover what is available nearby/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', {
      name: 'Show Straight From The Farm (SFTF)',
    }))
    const banner = within(carousel).getByRole('img', {
      name: 'Straight From The Farm (SFTF)',
    })
    expect(banner).toHaveAttribute('src', 'https://images.test/sftf-banner.jpeg')

    fireEvent.error(banner)
    await waitFor(() => {
      expect(within(carousel).getByRole('img', {
        name: 'Straight From The Farm (SFTF)',
      })).toHaveAttribute('src', 'https://images.test/sftf-logo.jpeg')
    })
  })

  it('renders API-backed offers linked to their product preview', async () => {
    const payload = {
      ...homeFixture,
      data: {
        ...homeFixture.data,
        offers: [{
          id: 14,
          offer_title: 'Fresh dairy week',
          discount_percentage: 10,
          offer_code: 'FRESH10',
          expiry_date: '2026-08-15',
          vendor_id: 123,
          product_id: 248,
        }],
      },
    }
    useHomeDiscovery.mockReturnValue({
      data: normalizeHomeResponse(payload),
      error: null,
      refresh: vi.fn(),
      isLoading: false,
      isRefreshing: false,
    })

    const user = userEvent.setup()
    render(<DiscoverySection />)

    expect(screen.getByRole('heading', { name: 'Offers near you' })).toBeInTheDocument()
    expect(screen.getByText('10% off')).toBeInTheDocument()
    expect(screen.getByText(/FRESH10/)).toBeInTheDocument()
    expect(screen.queryByText('Real offers only')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', {
      name: 'Preview Fresh dairy week for Desi Cow Milk (A2)',
    }))
    expect(screen.getByRole('dialog', { name: 'Desi Cow Milk (A2)' })).toBeInTheDocument()
  })

  it('shows all products in a slider without store filter tabs', () => {
    render(<DiscoverySection />)

    expect(screen.getByRole('button', { name: /preview sarvapindi/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /preview desi cow milk/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All picks' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next popular products' })).toBeInTheDocument()
  })

  it('selects an area-search suggestion and updates geo query values', async () => {
    usePlaceSearch.mockReturnValue({
      suggestions: [{
        id: 'place-1',
        name: 'Hyderabad',
        label: 'Hyderabad, Telangana',
        detail: 'Telangana · 500001',
        postcode: '500001',
        latitude: 17.385,
        longitude: 78.4867,
      }],
      isSearching: false,
      error: '',
    })
    const user = userEvent.setup()
    render(<DiscoverySection />)

    const input = screen.getByRole('combobox', { name: 'Search for an area or place' })
    await user.clear(input)
    await user.type(input, 'Hyderabad')
    await user.click(screen.getByRole('option', { name: /Hyderabad/i }))

    expect(input).toHaveValue('Hyderabad, Telangana')
    expect(useHomeDiscovery).toHaveBeenLastCalledWith({
      serviceArea: '500001',
      latitude: 17.385,
      longitude: 78.4867,
    })
  })

  it('supports keyboard navigation and immediate location selection', async () => {
    usePlaceSearch.mockReturnValue({
      suggestions: [{
        id: 'place-1',
        name: 'Hyderabad',
        label: 'Hyderabad, Telangana',
        detail: 'Telangana · 500001',
        postcode: '500001',
        latitude: 17.385,
        longitude: 78.4867,
      }],
      isSearching: false,
      error: '',
    })
    const user = userEvent.setup()
    render(<DiscoverySection />)

    const input = screen.getByRole('combobox', { name: 'Search for an area or place' })
    await user.clear(input)
    await user.type(input, 'Hyderabad')
    await user.keyboard('{ArrowDown}{Enter}')

    await waitFor(() => expect(input).toHaveValue('Hyderabad, Telangana'))
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(useHomeDiscovery).toHaveBeenLastCalledWith({
      serviceArea: '500001',
      latitude: 17.385,
      longitude: 78.4867,
    })
  })

  it('reverse geocodes the browser location into the search field', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success) => success({
          coords: { latitude: 18.100525, longitude: 78.848279 },
        }),
      },
    })
    reverseGeocode.mockResolvedValue({
      id: 'current-place',
      name: 'Siddipet',
      label: 'Siddipet, Telangana',
      detail: 'Telangana · 502103',
      postcode: '502103',
      latitude: 18.100525,
      longitude: 78.848279,
    })
    const user = userEvent.setup()
    render(<DiscoverySection />)

    await user.click(screen.getByRole('button', { name: /use my location/i }))

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Siddipet, Telangana')
    })
    expect(reverseGeocode).toHaveBeenCalledWith(18.100525, 78.848279)
  })

  it('does not apply current coordinates when reverse geocoding fails', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success) => success({
          coords: { latitude: 17.385, longitude: 78.4867 },
        }),
      },
    })
    reverseGeocode.mockRejectedValue({
      userMessage: 'Choose a more specific address that includes a six-digit pincode.',
    })
    const user = userEvent.setup()
    render(<DiscoverySection />)

    await user.click(screen.getByRole('button', { name: /use my location/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/six-digit pincode/i)
    expect(useHomeDiscovery).toHaveBeenLastCalledWith({
      serviceArea: '502103',
      latitude: 18.100525,
      longitude: 78.848279,
    })
  })

  it('opens a vendor preview, traps the dialog, and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<DiscoverySection />)

    const vendorButtons = screen.getAllByRole('button', {
      name: /preview kammani/i,
    })
    await user.click(vendorButtons.at(-1))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: /kammani/i })).toBeInTheDocument()
    expect(within(dialog).getAllByText('Sarvapindi').length).toBeGreaterThan(0)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('exposes carousel navigation and pause controls', () => {
    render(<DiscoverySection />)

    expect(screen.getByRole('button', { name: 'Previous featured business' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause carousel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next featured business' })).toBeInTheDocument()
  })
})
