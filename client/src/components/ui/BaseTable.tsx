import styled, { css } from 'styled-components'

import type { SortDirection } from '../../lib/tableUtils'
import { Spinner } from './Spinner'
import { Text } from './Layout'
import {
  Table,
  TableBody,
  TableHead,
  TableWrapper,
  Td,
  Th,
} from './Table'

export interface TableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  align?: 'left' | 'right'
  render: (row: T) => React.ReactNode
}

export interface BaseTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyMessage?: string
  sortKey?: string
  sortDirection?: SortDirection
  onSort?: (key: string) => void
  toolbar?: React.ReactNode
  maxHeight?: string
}

const SortArrow = ({
  active,
  direction,
}: {
  active: boolean
  direction: SortDirection
}) => {
  if (!active) return <SortIndicator $hidden />

  return direction === 'desc' ? (
    <SortIndicator $direction="down" />
  ) : (
    <SortIndicator $direction="up" />
  )
}

export function BaseTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = 'No data found',
  sortKey = '',
  sortDirection = 'asc',
  onSort,
  toolbar,
  maxHeight,
}: BaseTableProps<T>) {
  const isEmpty = !loading && data.length === 0

  return (
    <Root>
      {toolbar != null && <Toolbar>{toolbar}</Toolbar>}

      <ScrollArea $maxHeight={maxHeight} $empty={isEmpty}>
        <TableWrapper>
          <Table>
            <TableHead>
              <tr>
                {columns.map((column) => (
                  <Th key={column.key} $align={column.align}>
                    {column.sortable && onSort ? (
                      <HeaderButton
                        type="button"
                        onClick={() => onSort(column.key)}
                        $active={sortKey === column.key}
                      >
                        {column.header}
                        <SortArrow
                          active={sortKey === column.key}
                          direction={sortDirection}
                        />
                      </HeaderButton>
                    ) : (
                      column.header
                    )}
                  </Th>
                ))}
              </tr>
            </TableHead>
            {!isEmpty && (
              <TableBody>
                {loading ? (
                  <tr>
                    <LoadingCell colSpan={columns.length}>
                      <Spinner />
                    </LoadingCell>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={rowKey(row)} data-testid="base-table-row">
                      {columns.map((column) => (
                        <Td key={column.key} $align={column.align}>
                          {column.render(row)}
                        </Td>
                      ))}
                    </tr>
                  ))
                )}
              </TableBody>
            )}
          </Table>
        </TableWrapper>

        {isEmpty && (
          <EmptyState>
            <Text $color="muted">{emptyMessage}</Text>
          </EmptyState>
        )}
      </ScrollArea>
    </Root>
  )
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`

const Toolbar = styled.div`
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const ScrollArea = styled.div<{ $maxHeight?: string; $empty?: boolean }>`
  position: relative;
  overflow-x: auto;

  ${({ $maxHeight }) =>
    $maxHeight &&
    css`
      max-height: ${$maxHeight};
      overflow-y: auto;
    `}

  ${({ $empty, theme }) =>
    $empty &&
    css`
      border-bottom: 1px solid ${theme.colors.border};
    `}
`

const HeaderButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: inherit;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`

const SortIndicator = styled.span<{
  $direction?: 'up' | 'down'
  $hidden?: boolean
}>`
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};

  ${({ $direction, theme }) =>
    $direction === 'up'
      ? css`
          border-bottom: 5px solid ${theme.colors.secondary};
        `
      : $direction === 'down'
        ? css`
            border-top: 5px solid ${theme.colors.secondary};
          `
        : css`
            border-top: 5px solid ${theme.colors.muted};
          `}
`

const LoadingCell = styled.td`
  padding: 2rem 1.25rem;
  text-align: center;
`

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.5rem;
  padding: 1.25rem;
`
