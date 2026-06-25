import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'

import { Pagination } from '../Pagination'
import { theme } from '../../../styles/theme'

const renderPagination = (
  props: Partial<React.ComponentProps<typeof Pagination>> = {},
) =>
  render(
    <ThemeProvider theme={theme}>
      <Pagination
        current={2}
        pageTotal={4}
        onPageChange={vi.fn()}
        {...props}
      />
    </ThemeProvider>,
  )

describe('Pagination', () => {
  it('renders page controls when there is more than one page', () => {
    renderPagination()

    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByText(/of\s+4/)).toBeInTheDocument()
  })

  it('does not render when there is only one page', () => {
    renderPagination({ pageTotal: 1 })

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('calls onPageChange for next page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    renderPagination({ onPageChange })

    await user.click(screen.getByRole('button', { name: 'Next page' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
