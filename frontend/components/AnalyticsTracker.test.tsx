import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import AnalyticsTracker from './AnalyticsTracker'

// Mock Next.js navigation hooks
const mockUsePathname = vi.fn()
const mockUseSearchParams = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}))

// Mock useAnalytics hook
const mockTrackEvent = vi.fn()
vi.mock('../src/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackEvent: mockTrackEvent,
  }),
}))

describe('AnalyticsTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render nothing', () => {
    mockUsePathname.mockReturnValue('/test')
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''))

    const { container } = render(<AnalyticsTracker />)

    expect(container.firstChild).toBeNull()
  })

  it('should track page view on mount', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''))

    render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/dashboard' })
  })

  it('should track page view with search params', () => {
    mockUsePathname.mockReturnValue('/courses')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('category=react&page=1'))

    render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/coursescategory=react&page=1' })
  })

  it('should track page view when pathname changes', () => {
    mockUsePathname.mockReturnValue('/home')
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''))

    const { rerender } = render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/home' })

    // Change pathname
    mockUsePathname.mockReturnValue('/about')
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''))

    rerender(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/about' })
  })

  it('should track page view when search params change', () => {
    mockUsePathname.mockReturnValue('/search')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('q=react'))

    const { rerender } = render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/searchq=react' })

    // Change search params
    mockUsePathname.mockReturnValue('/search')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('q=vue'))

    rerender(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/searchq=vue' })
  })

  it('should handle empty pathname', () => {
    mockUsePathname.mockReturnValue('')
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''))

    render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '' })
  })

  it('should handle pathname with leading slash', () => {
    mockUsePathname.mockReturnValue('/nested/path')
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''))

    render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/nested/path' })
  })

  it('should handle complex search params', () => {
    mockUsePathname.mockReturnValue('/filter')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('category=tech&sort=asc&limit=10&offset=0'))

    render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/filtercategory=tech&sort=asc&limit=10&offset=0' })
  })

  it('should handle URL-encoded search params', () => {
    mockUsePathname.mockReturnValue('/search')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('q=hello%20world&category=web%20dev'))

    render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/searchq=hello%20world&category=web%20dev' })
  })

  it('should call trackEvent only once on mount', () => {
    mockUsePathname.mockReturnValue('/test')
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''))

    render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledTimes(1)
  })

  it('should call trackEvent when both pathname and search params change', () => {
    mockUsePathname.mockReturnValue('/initial')
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''))

    const { rerender } = render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/initial' })

    // Change both
    mockUsePathname.mockReturnValue('/new-path')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('param=value'))

    rerender(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/new-pathparam=value' })
  })

  it('should handle search params becoming empty', () => {
    mockUsePathname.mockReturnValue('/page')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('filter=active'))

    const { rerender } = render(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/pagefilter=active' })

    // Remove search params
    mockUsePathname.mockReturnValue('/page')
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''))

    rerender(<AnalyticsTracker />)

    expect(mockTrackEvent).toHaveBeenCalledWith('PAGE_VIEW', { path: '/page' })
  })
})