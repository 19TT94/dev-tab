import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import App from '../App'
import { GlobalStyle } from '../styles/GlobalStyle'
import { theme } from '../styles/theme'

describe('App', () => {
  it('renders the app shell with authenticated dashboard in mock mode', async () => {
    render(
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <App />
      </ThemeProvider>,
    )

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('DevTab')).toBeInTheDocument()
  })
})
