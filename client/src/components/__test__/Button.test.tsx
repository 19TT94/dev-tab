import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { Button } from '../Button'
import { GlobalStyle } from '../../styles/GlobalStyle'
import { theme } from '../../styles/theme'

function renderButton(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {ui}
    </ThemeProvider>,
  )
}

describe('Button', () => {
  it('renders children', () => {
    renderButton(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies variant and size', () => {
    renderButton(
      <Button variant="danger" size="sm">
        Delete
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveStyle({ backgroundColor: 'rgb(242, 67, 51)' })
    expect(button).toHaveStyle({ fontSize: '0.875rem' })
  })

  it('forwards click events', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderButton(<Button onClick={onClick}>Go</Button>)
    await user.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('respects disabled state', () => {
    renderButton(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })
})
