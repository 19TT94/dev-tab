import { useCallback, useMemo, useState } from 'react'

import {
  filterRows,
  getPageTotal,
  paginateRows,
  sortRows,
  type SortDirection,
} from '../lib/tableUtils'

interface UseTableStateOptions<T> {
  pageSize?: number
  initialSortKey?: string
  initialSortDirection?: SortDirection
  filterFn?: (row: T) => boolean
  searchFn?: (row: T, normalizedQuery: string) => boolean
  sortAccessors?: Record<string, (row: T) => string | number>
}

export function useTableState<T>(data: T[], options: UseTableStateOptions<T> = {}) {
  const {
    pageSize = 10,
    initialSortKey = '',
    initialSortDirection = 'asc',
    filterFn,
    searchFn,
    sortAccessors = {},
  } = options

  const [search, setSearchState] = useState('')
  const [sortKey, setSortKey] = useState(initialSortKey)
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialSortDirection)
  const [page, setPage] = useState(1)

  const setSearch = useCallback((value: string) => {
    setSearchState(value)
    setPage(1)
  }, [])

  const filtered = useMemo(() => {
    const afterFilter = filterFn ? data.filter(filterFn) : data
    if (!searchFn) return afterFilter
    return filterRows(afterFilter, search, searchFn)
  }, [data, filterFn, search, searchFn])

  const sorted = useMemo(() => {
    if (!sortKey || !sortAccessors[sortKey]) return filtered
    return sortRows(filtered, sortKey, sortDirection, sortAccessors[sortKey])
  }, [filtered, sortKey, sortDirection, sortAccessors])

  const pageTotal = getPageTotal(sorted.length, pageSize)
  const currentPage = Math.min(page, pageTotal)

  const rows = useMemo(
    () => paginateRows(sorted, currentPage, pageSize),
    [sorted, currentPage, pageSize],
  )

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
    setPage(1)
  }

  return {
    search,
    setSearch,
    sortKey,
    sortDirection,
    toggleSort,
    page: currentPage,
    setPage,
    pageSize,
    pageTotal,
    totalCount: sorted.length,
    rows,
  }
}
