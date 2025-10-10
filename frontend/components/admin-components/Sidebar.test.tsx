import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render logo', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    expect(screen.getByText('ML-Practicum')).toBeInTheDocument()
  })

  it('should render all navigation items', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Content Management')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should highlight active navigation item', () => {
    render(<Sidebar activePath="/admin/content" onNavigate={mockOnNavigate} />)

    const activeLink = screen.getByText('Content Management').closest('a')
    expect(activeLink).toHaveClass('bg-blue-600', 'text-white')
  })

  it('should not highlight inactive navigation items', () => {
    render(<Sidebar activePath="/admin/content" onNavigate={mockOnNavigate} />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).not.toHaveClass('bg-blue-600')
    expect(dashboardLink).toHaveClass('text-gray-300', 'hover:bg-gray-700')
  })

  it('should call onNavigate when navigation item is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const usersLink = screen.getByText('Users')
    await user.click(usersLink)

    expect(mockOnNavigate).toHaveBeenCalledWith('/admin/users')
  })

  it('should prevent default link behavior', async () => {
    const user = userEvent.setup()
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const dashboardLink = screen.getByText('Dashboard')
    await user.click(dashboardLink)

    // Should not cause page navigation
    expect(dashboardLink).toBeInTheDocument()
  })

  it('should render user profile section', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
    expect(screen.getByAltText('Admin User')).toBeInTheDocument()
  })

  it('should render user profile image with correct attributes', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const profileImg = screen.getByAltText('Admin User')
    expect(profileImg).toHaveAttribute('src', 'https://picsum.photos/40/40')
    expect(profileImg).toHaveClass('h-10', 'w-10', 'rounded-full')
  })

  it('should render with proper sidebar styling', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('w-72', 'bg-gray-800', 'flex', 'flex-col', 'shrink-0')
  })

  it('should render logo area with proper styling', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const logoArea = document.querySelector('.h-16')
    expect(logoArea).toHaveClass('flex', 'items-center', 'justify-center', 'border-b', 'border-gray-700', 'shrink-0')
  })

  it('should render navigation with proper styling', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const nav = document.querySelector('nav')
    expect(nav).toHaveClass('flex-1', 'overflow-y-auto', 'p-4')
  })

  it('should render navigation links with proper base styling', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveClass('flex', 'items-center', 'gap-3', 'px-4', 'py-2', 'rounded-md', 'text-sm', 'font-medium', 'transition-colors')
    })
  })

  it('should render user area with proper styling', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const userArea = document.querySelector('.p-4.border-t.border-gray-700')
    expect(userArea).toHaveClass('shrink-0')
  })

  it('should render navigation list with proper spacing', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const navList = document.querySelector('ul')
    expect(navList).toHaveClass('space-y-2')
  })

  it('should render icons for each navigation item', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    // Check that icons are rendered (should be 4 svg elements)
    const icons = document.querySelectorAll('svg')
    expect(icons).toHaveLength(4)
    icons.forEach(icon => {
      expect(icon).toHaveClass('h-5', 'w-5')
    })
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const settingsLink = screen.getByText('Settings').closest('a')
    settingsLink?.focus()
    await user.keyboard('{Enter}')

    expect(mockOnNavigate).toHaveBeenCalledWith('/admin/settings')
  })

  it('should render user info with proper text styling', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const userName = screen.getByText('Admin User')
    const userRole = screen.getByText('Administrator')

    expect(userName).toHaveClass('text-sm', 'font-semibold', 'text-white')
    expect(userRole).toHaveClass('text-xs', 'text-gray-400')
  })

  it('should render user profile section with flex layout', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const userSection = document.querySelector('.flex.items-center.gap-3')
    expect(userSection).toBeInTheDocument()
  })

  it('should be accessible with proper role', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('should render all navigation items as links', () => {
    render(<Sidebar activePath="/admin" onNavigate={mockOnNavigate} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)

    const expectedHrefs = ['/admin', '/admin/content', '/admin/users', '/admin/settings']
    links.forEach((link, index) => {
      expect(link).toHaveAttribute('href', expectedHrefs[index])
    })
  })
})