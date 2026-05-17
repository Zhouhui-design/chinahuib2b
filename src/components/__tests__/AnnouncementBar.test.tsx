import { render, screen } from '@testing-library/react'
import AnnouncementBar from '../AnnouncementBar'

describe('AnnouncementBar Component', () => {
  it('should render announcement text', () => {
    render(<AnnouncementBar />)
    
    // Check if component renders with expected text
    expect(screen.getByText(/Connecting global buyers/i)).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<AnnouncementBar />)
    
    expect(container.firstChild).toHaveClass('bg-blue-600')
  })
})
