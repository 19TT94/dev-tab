import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'

import { BaseTable } from '../BaseTable'
import { theme } from '../../../styles/theme'

interface Row {
  id: string
  name: string
  amount: number
}

const rows: Row[] = [
  { id: '1', name: 'Alpha', amount: 10 },
  { id: '2', name: 'Beta', amount: 5 },
]

const columns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: (row: Row) => row.name,
  },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    align: 'right' as const,
    render: (row: Row) => row.amount,
  },
]

const renderTable = (props: Partial<React.ComponentProps<typeof BaseTable<Row>>> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <BaseTable
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        sortKey="name"
        sortDirection="asc"
        onSort={vi.fn()}
        {...props}
      />
    </ThemeProvider>,
  )

describe('BaseTable', () => {
  it('renders rows', () => {
    renderTable()

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('renders toolbar when provided', () => {
    renderTable({
      toolbar: <input type="search" aria-label="Filter rows" />,
    })

    expect(screen.getByRole('searchbox', { name: 'Filter rows' })).toBeInTheDocument()
  })

  it('shows empty state when there is no data', () => {
    renderTable({ data: [], emptyMessage: 'Nothing here' })

    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('calls onSort when a sortable header is clicked', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()

    renderTable({ onSort })

    await user.click(screen.getByRole('button', { name: /name/i }))

    expect(onSort).toHaveBeenCalledWith('name')
  })
})
