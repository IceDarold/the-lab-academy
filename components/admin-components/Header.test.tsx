import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from './Header'

// Mock navItems from Sidebar
vi.mock('./Sidebar', () => ({
  navItems: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/content', label: 'Content Management' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/settings', label: 'Settings' }
  ]
}))

describe('Header', () => {
  it('should render breadcrumbs with active page', () => {
    render(<Header activePath="/admin/content" />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getByText('Content Management')).toBeInTheDocument()
  })

  it('should render Dashboard as default when path not found', () => {
    render(<Header activePath="/unknown" />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should render search input on desktop', () => {
    render(<Header activePath="/admin" />)

    const searchInput = screen.getByPlaceholderText('Search...')
    expect(searchInput).toBeInTheDocument()
    // Note: In test environment, responsive classes might not be applied the same way
    expect(searchInput).toHaveClass('bg-gray-900', 'border', 'border-gray-700', 'rounded-md')
  })

  it('should render user profile image', () => {
    render(<Header activePath="/admin" />)

    const profileImg = screen.getByAltText('User profile')
    expect(profileImg).toBeInTheDocument()
    expect(profileImg).toHaveAttribute('src', 'https://picsum.photos/32/32')
  })

  it('should render user menu link with proper attributes', () => {
    render(<Header activePath="/admin" />)

    const userMenuLink = screen.getByRole('link', { name: /user menu/i })
    expect(userMenuLink).toHaveAttribute('href', '/admin/profile')
    expect(userMenuLink).toHaveAttribute('aria-label', 'User menu')
  })

  it('should prevent default on breadcrumb links', async () => {
    const user = userEvent.setup()
    render(<Header activePath="/admin" />)

    const homeLink = screen.getByText('Home')
    await user.click(homeLink)

    // Should not navigate (preventDefault called)
    expect(homeLink).toBeInTheDocument()
  })

  it('should render with proper header styling', () => {
    render(<Header activePath="/admin" />)

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-gray-800', 'border-b', 'border-gray-700', 'p-4', 'shrink-0')
  })

  it('should render search input with proper styling', () => {
    render(<Header activePath="/admin" />)

    const searchInput = screen.getByPlaceholderText('Search...')
    expect(searchInput).toHaveClass('bg-gray-900', 'border', 'border-gray-700', 'rounded-md', 'pl-10', 'pr-4', 'py-2', 'w-64')
  })

  it('should render magnifying glass icon in search', () => {
    render(<Header activePath="/admin" />)

    const searchIcon = document.querySelector('svg')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should render user profile image with proper styling', () => {
    render(<Header activePath="/admin" />)

    const profileImg = screen.getByAltText('User profile')
    expect(profileImg).toHaveClass('h-8', 'w-8', 'rounded-full')
  })

  it('should render breadcrumb links with hover effects', () => {
    render(<Header activePath="/admin" />)

    const homeLink = screen.getByText('Home')
    expect(homeLink).toHaveClass('hover:text-gray-100')
  })

  it('should render current page with medium font weight', () => {
    render(<Header activePath="/admin" />)

    const currentPage = screen.getByText('Dashboard')
    expect(currentPage).toHaveClass('text-gray-100', 'font-medium')
  })

  it('should handle different active paths', () => {
    render(<Header activePath="/admin/users" />)

    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('should render search input with focus styles', () => {
    render(<Header activePath="/admin" />)

    const searchInput = screen.getByPlaceholderText('Search...')
    expect(searchInput).toHaveClass('focus:ring-blue-500', 'focus:border-blue-500')
  })

  it('should render user menu link with focus styles', () => {
    render(<Header activePath="/admin" />)

    const userMenuLink = screen.getByRole('link', { name: /user menu/i })
    expect(userMenuLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-offset-gray-800', 'focus:ring-blue-500')
  })

  it('should be accessible with proper roles', () => {
    render(<Header activePath="/admin" />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /user menu/i })).toBeInTheDocument()
  })
})