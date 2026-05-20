import { render, screen } from '@testing-library/react'
import { App } from '../../src/components/App'

describe('App', () => {
  it('renders app root without crashing', () => {
    render(<App />)
    const title = screen.getByText(/Project Schedule/i)
    expect(title).toBeInTheDocument()
  })
})
