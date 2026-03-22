import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationBell } from '@/components/notifications/NotificationBell'

// Mock fetch
global.fetch = jest.fn()

const mockNotifications = [
  {
    id: '1',
    type: 'pipeline_failure',
    title: 'Pipeline failed',
    message: 'Your pipeline failed on main branch',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'ai_fix',
    title: 'Auto-fix applied',
    message: 'An issue was automatically fixed',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
]

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
}

describe('NotificationBell Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: mockNotifications,
        unreadCount: 1,
      }),
    })
  })

  it('renders notification bell icon', () => {
    render(<NotificationBell />)
    
    const bellButton = screen.getByTestId('notification-bell')
    expect(bellButton).toBeInTheDocument()
    expect(bellButton).toBeVisible()
  })

  it('shows zero unread count initially', () => {
    render(<NotificationBell />)
    
    // Should not show badge when no unread notifications
    const badge = screen.queryByTestId('notification-badge')
    expect(badge).not.toBeInTheDocument()
  })

  it('shows badge with unread count when there are unread notifications', async () => {
    render(<NotificationBell />)
    
    // Wait for notifications to load
    await waitFor(() => {
      const badge = screen.getByTestId('notification-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('1')
    })
  })

  it('opens notification panel on click', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)
    
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    // Panel should be visible
    const panel = screen.getByTestId('notification-panel')
    expect(panel).toBeInTheDocument()
    expect(panel).toBeVisible()
  })

  it('closes notification panel on outside click', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <NotificationBell />
        <div data-testid="outside-area">Outside</div>
      </div>
    )
    
    // Open panel
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    expect(screen.getByTestId('notification-panel')).toBeVisible()
    
    // Click outside
    const outsideArea = screen.getByTestId('outside-area')
    await user.click(outsideArea)
    
    // Panel should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('notification-panel')).not.toBeVisible()
    })
  })

  it('displays notification items correctly', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)
    
    // Wait for notifications to load and open panel
    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })
    
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    // Check notification items
    await waitFor(() => {
      const notificationItems = screen.getAllByTestId('notification-item')
      expect(notificationItems).toHaveLength(2)
    })
    
    // Check unread notification styling
    const unreadNotification = screen.getByText('Pipeline failed')
    expect(unreadNotification.closest('[data-testid="notification-item"]')).toHaveClass('unread')
  })

  it('marks notification as read on click', async () => {
    const user = userEvent.setup()
    
    // Mock the PATCH request
    ;(global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'PATCH') {
        return Promise.resolve({ ok: true, json: async () => ({}) })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          notifications: mockNotifications,
          unreadCount: 1,
        }),
      })
    })
    
    render(<NotificationBell />)
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })
    
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    // Click on unread notification
    await waitFor(() => {
      const unreadNotification = screen.getByText('Pipeline failed')
      expect(unreadNotification).toBeInTheDocument()
    })
    
    const unreadNotification = screen.getByText('Pipeline failed')
    await user.click(unreadNotification)
    
    // Should make API call to mark as read
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('1'),
        })
      )
    })
  })

  it('marks all notifications as read', async () => {
    const user = userEvent.setup()
    
    // Mock the PATCH request for marking all as read
    ;(global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'PATCH' && options.body?.includes('markAll')) {
        return Promise.resolve({ ok: true, json: async () => ({}) })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          notifications: mockNotifications,
          unreadCount: 1,
        }),
      })
    })
    
    render(<NotificationBell />)
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })
    
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    // Click "Mark all as read" button
    const markAllButton = screen.getByText('Mark all as read')
    await user.click(markAllButton)
    
    // Should make API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications'),
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })
  })

  it('deletes notification on delete button click', async () => {
    const user = userEvent.setup()
    
    // Mock the DELETE request
    ;(global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: async () => ({}) })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          notifications: mockNotifications,
          unreadCount: 1,
        }),
      })
    })
    
    render(<NotificationBell />)
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })
    
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    // Click delete button on first notification
    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('delete-notification')
      expect(deleteButtons).toHaveLength(2)
    })
    
    const deleteButtons = screen.getAllByTestId('delete-notification')
    await user.click(deleteButtons[0])
    
    // Should make API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  it('shows loading state while fetching', async () => {
    // Delay the fetch response
    ;(global.fetch as jest.Mock).mockImplementation(() =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              notifications: [],
              unreadCount: 0,
            }),
          })
        }, 1000)
      })
    )
    
    const user = userEvent.setup()
    render(<NotificationBell />)
    
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    // Should show loading state
    expect(screen.getByTestId('loading-notifications')).toBeInTheDocument()
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-notifications')).not.toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('shows empty state when no notifications', async () => {
    // Mock empty notifications
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: [],
        unreadCount: 0,
      }),
    })
    
    const user = userEvent.setup()
    render(<NotificationBell />)
    
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument()
    })
  })

  it('shows error state when fetch fails', async () => {
    // Mock failed fetch
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))
    
    const user = userEvent.setup()
    render(<NotificationBell />)
    
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument()
    })
  })

  it('allows retry after error', async () => {
    // First call fails, second call succeeds
    ;(global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notifications: mockNotifications,
          unreadCount: 1,
        }),
      })
    
    const user = userEvent.setup()
    render(<NotificationBell />)
    
    const bellButton = screen.getByTestId('notification-bell')
    await user.click(bellButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument()
    })
    
    // Click retry button
    const retryButton = screen.getByText('Try Again')
    await user.click(retryButton)
    
    // Should retry fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
    
    // Should show notifications
    await waitFor(() => {
      expect(screen.getAllByTestId('notification-item')).toHaveLength(2)
    })
  })

  it('is accessible with keyboard', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)
    
    const bellButton = screen.getByTestId('notification-bell')
    
    // Focus with tab
    bellButton.focus()
    expect(bellButton).toHaveFocus()
    
    // Open with Enter
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-panel')).toBeVisible()
    })
    
    // Close with Escape
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(screen.queryByTestId('notification-panel')).not.toBeVisible()
    })
  })

  it('has proper ARIA attributes', () => {
    render(<NotificationBell />)
    
    const bellButton = screen.getByTestId('notification-bell')
    expect(bellButton).toHaveAttribute('aria-label', expect.stringContaining('notifications'))
    expect(bellButton).toHaveAttribute('aria-haspopup', 'true')
  })

  it('updates badge when new notification arrives', async () => {
    const user = userEvent.setup()
    
    // Mock initial state with 1 unread
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: mockNotifications,
        unreadCount: 1,
      }),
    })
    
    render(<NotificationBell />)
    
    await waitFor(() => {
      const badge = screen.getByTestId('notification-badge')
      expect(badge).toHaveTextContent('1')
    })
    
    // Simulate new notification via WebSocket
    const newNotification = {
      id: '3',
      type: 'pipeline_success',
      title: 'Pipeline succeeded',
      message: 'Build completed successfully',
      read: false,
      createdAt: new Date().toISOString(),
    }
    
    // Trigger notification event
    const notificationEvent = new CustomEvent('notification', {
      detail: newNotification,
    })
    window.dispatchEvent(notificationEvent)
    
    // Badge should update
    await waitFor(() => {
      const badge = screen.getByTestId('notification-badge')
      expect(badge).toHaveTextContent('2')
    })
  })
})
