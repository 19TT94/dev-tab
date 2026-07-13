import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

// Hooks
import { useTimeEntries, useTimeEntryMutations } from '../hooks/useTimeEntries'
import { useTableState } from '../hooks/useTableState'

// Types
import type { TimeEntryWithProject } from '../types/database'

// Components
import { ModalAddEntry } from '../components/ModalAddEntry'
import {
  ModalTimeEntryFilters,
  type TimeEntryDateFilter,
} from '../components/ModalTimeEntryFilters'
import { ActionMenu } from '../components/ActionMenu'
import { Button } from '../components/Button'
import {
  BaseTable,
  Card,
  InlineInput,
  MonoText,
  MutedHint,
  PageContainer,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  Pagination,
  StatusNo,
  StatusYes,
  Text,
  type TableColumn,
} from '../components/ui'

// Utils
import {
  formatDateTime,
  formatDuration,
  formatHours,
  isWithinLocalDateRange,
  parseDateInputValue,
} from '../lib/utils'

const PAGE_SIZE = 10

const searchTimeEntry = (entry: TimeEntryWithProject, query: string) => {
  const haystack = [
    entry.projects.name,
    entry.projects.clients.name,
    entry.description ?? '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

const formatFilterDate = (value: string) =>
  parseDateInputValue(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const formatDateRangeLabel = (startDate: string, endDate: string) => {
  if (startDate && endDate) {
    if (startDate === endDate) return formatFilterDate(startDate)
    return `${formatFilterDate(startDate)} – ${formatFilterDate(endDate)}`
  }
  if (startDate) return `From ${formatFilterDate(startDate)}`
  if (endDate) return `Through ${formatFilterDate(endDate)}`
  return ''
}

const TimeEntriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: entries = [], isLoading } = useTimeEntries()
  const { create, update, remove } = useTimeEntryMutations()
  const [modalOpen, setModalOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [editing, setEditing] = useState<TimeEntryWithProject | null>(null)

  const startDate = searchParams.get('startDate') ?? ''
  const endDate = searchParams.get('endDate') ?? ''

  const filterByDate = useCallback(
    (entry: TimeEntryWithProject) =>
      isWithinLocalDateRange(entry.started_at, startDate || undefined, endDate || undefined),
    [startDate, endDate],
  )

  const sortAccessors = useMemo(
    () => ({
      project: (entry: TimeEntryWithProject) => entry.projects.name.toLowerCase(),
      description: (entry: TimeEntryWithProject) =>
        (entry.description ?? '').toLowerCase(),
      when: (entry: TimeEntryWithProject) =>
        new Date(entry.started_at).getTime(),
      duration: (entry: TimeEntryWithProject) => entry.duration_seconds,
      billable: (entry: TimeEntryWithProject) => (entry.billable ? 1 : 0),
    }),
    [],
  )

  const {
    search,
    setSearch,
    sortKey,
    sortDirection,
    toggleSort,
    page,
    setPage,
    pageTotal,
    totalCount,
    rows,
  } = useTableState(entries, {
    pageSize: PAGE_SIZE,
    initialSortKey: 'when',
    initialSortDirection: 'desc',
    filterFn: filterByDate,
    searchFn: searchTimeEntry,
    sortAccessors,
  })

  useEffect(() => {
    setPage(1)
  }, [startDate, endDate, setPage])

  const syncDateParams = useCallback(
    (nextStart: string, nextEnd: string) => {
      const params = new URLSearchParams(searchParams)
      if (nextStart) params.set('startDate', nextStart)
      else params.delete('startDate')
      if (nextEnd) params.set('endDate', nextEnd)
      else params.delete('endDate')
      params.delete('year')
      params.delete('month')
      params.delete('day')
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const handleApplyFilters = (filter: TimeEntryDateFilter) => {
    syncDateParams(filter.startDate, filter.endDate)
  }

  const handleClearFilters = () => {
    syncDateParams('', '')
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleCreate = async (data: Parameters<typeof create.mutateAsync>[0]) => {
    await create.mutateAsync(data)
    closeModal()
  }

  const handleUpdate = async (data: {
    project_id: string
    description?: string
    started_at: string
    ended_at: string
    duration_seconds: number
    billable: boolean
  }) => {
    if (!editing) return
    await update.mutateAsync({ id: editing.id, ...data })
    closeModal()
  }

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this time entry?')) return
    await remove.mutateAsync(id)
  }, [remove])

  const columns = useMemo<TableColumn<TimeEntryWithProject>[]>(
    () => [
      {
        key: 'project',
        header: 'Project',
        sortable: true,
        render: (entry) => (
          <>
            <ProjectName>{entry.projects.name}</ProjectName>
            <ClientName>{entry.projects.clients.name}</ClientName>
          </>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        sortable: true,
        render: (entry) => entry.description || '—',
      },
      {
        key: 'when',
        header: 'When',
        sortable: true,
        render: (entry) => formatDateTime(entry.started_at),
      },
      {
        key: 'duration',
        header: 'Duration',
        sortable: true,
        align: 'right',
        render: (entry) => (
          <>
            <MonoText>{formatDuration(entry.duration_seconds)}</MonoText>
            <MutedHint>
              <br />
              {formatHours(entry.duration_seconds)} hrs
            </MutedHint>
          </>
        ),
      },
      {
        key: 'billable',
        header: 'Billable',
        sortable: true,
        render: (entry) => (
          <>
            {entry.billable ? <StatusYes>Yes</StatusYes> : <StatusNo>No</StatusNo>}
            {entry.invoice_id && (
              <MutedHint>
                <br />
                Invoiced
              </MutedHint>
            )}
          </>
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (entry) => (
          <ActionMenu
            label={`Actions for ${entry.projects.name}`}
            disabled={!!entry.invoice_id}
            items={[
              {
                label: 'Edit',
                onSelect: () => {
                  setEditing(entry)
                  setModalOpen(true)
                },
              },
              {
                label: 'Delete',
                variant: 'danger',
                onSelect: () => {
                  void handleDelete(entry.id)
                },
              },
            ]}
          />
        ),
      },
    ],
    [handleDelete],
  )

  const hasDateFilter = startDate !== '' || endDate !== ''
  const hasFilters = search.length > 0 || hasDateFilter
  const dateRangeLabel = formatDateRangeLabel(startDate, endDate)

  const emptyMessage =
    entries.length === 0
      ? 'No time entries yet.'
      : hasFilters
        ? 'No time entries match your filters.'
        : 'No time entries found.'

  return (
    <PageContainer $maxWidth="48rem">
      <PageStack>
        <PageHeader>
          <div>
            <PageTitle>Time Entries</PageTitle>
            <PageSubtitle>Add and manage manual time entries</PageSubtitle>
          </div>
          <Button
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            Add Entry
          </Button>
        </PageHeader>

        <ModalAddEntry
          open={modalOpen}
          entry={editing ?? undefined}
          onSubmit={editing ? handleUpdate : handleCreate}
          onClose={closeModal}
        />

        <ModalTimeEntryFilters
          open={filterModalOpen}
          startDate={startDate}
          endDate={endDate}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          onClose={() => setFilterModalOpen(false)}
        />

        <Card>
          <BaseTable
            columns={columns}
            data={rows}
            rowKey={(entry) => entry.id}
            loading={isLoading}
            emptyMessage={emptyMessage}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={toggleSort}
            toolbar={
              <ToolbarRow>
                <SearchInput
                  type="search"
                  value={search}
                  placeholder="Search by project, client, or description"
                  aria-label="Search by project, client, or description"
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilterModalOpen(true)}
                >
                  {hasDateFilter ? 'Edit filters' : 'Filters'}
                </Button>
                {hasDateFilter && (
                  <ActiveFilter>
                    <Text $size="xs" $color="muted">
                      {dateRangeLabel}
                    </Text>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Clear
                    </Button>
                  </ActiveFilter>
                )}
              </ToolbarRow>
            }
          />
          {!isLoading && totalCount > 0 && (
            <Pagination
              current={page}
              pageTotal={pageTotal}
              onPageChange={setPage}
              loading={isLoading}
            />
          )}
        </Card>
      </PageStack>
    </PageContainer>
  )
}

// Style Overrides
const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
`

const SearchInput = styled(InlineInput)`
  flex: 1 1 12rem;
  max-width: 20rem;
`

const ActiveFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const ProjectName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const ClientName = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`

export default TimeEntriesPage
