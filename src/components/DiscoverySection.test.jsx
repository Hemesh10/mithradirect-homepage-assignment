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

  it('renders live counts and omits an empty offers section', () => {
    render(<DiscoverySection />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('businesses nearby')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.queryByText(/offers near you/i)).not.toBeInTheDocument()
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
