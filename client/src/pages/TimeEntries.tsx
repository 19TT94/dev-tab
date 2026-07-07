// TODO: for some reason the overage indicator is showing on every entry
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

// Hooks
import { useTimeEntries, useTimeEntryMutations } from '../hooks/useTimeEntries'
import { useTableState } from '../hooks/useTableState'

// Types
import type { TimeEntryWithProject } from '../types/database'

// Components
import { ModalAddEntry } from '../components/ModalAddEntry'
import { EntryOverageIndicator } from '../components/EntryOverageIndicator'
import { Button } from '../components/Button'
import {
  BaseTable,
  ButtonRow,
  Card,
  InlineInput,
  InlineSelect,
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
  type TableColumn,
} from '../components/ui'

// Utils
import { billEntriesForReport } from '../lib/billing'
import {
  getDayOptions,
  getMonthOptions,
  getYearsFromDates,
  matchesDateParts,
} from '../lib/tableUtils'
import {
  formatDateTime,
  formatDuration,
  formatHours,
} from '../lib/utils'

const PAGE_SIZE = 10
const MONTH_OPTIONS = getMonthOptions()
const DAY_OPTIONS = getDayOptions()

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

const TimeEntriesPage = () => {
  const { data: entries = [], isLoading } = useTimeEntries()
  const { create, update, remove } = useTimeEntryMutations()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TimeEntryWithProject | null>(null)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')

  const segmentsByEntryId = useMemo(
    () => billEntriesForReport(entries),
    [entries],
  )

  const yearOptions = useMemo(
    () => getYearsFromDates(entries.map((entry) => entry.started_at)),
    [entries],
  )

  const dateFilter = useMemo(
    () => ({ year, month, day }),
    [year, month, day],
  )

  const filterByDate = useCallback(
    (entry: TimeEntryWithProject) =>
      matchesDateParts(entry.started_at, dateFilter),
    [dateFilter],
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
  }, [year, month, day, setPage])

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
            {entry.billable && (
              <EntryOverageIndicator
                segments={segmentsByEntryId.get(entry.id) ?? []}
                totalSeconds={entry.duration_seconds}
              />
            )}
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
        render: (entry) => (
          <ButtonRow>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(entry)
                setModalOpen(true)
              }}
              disabled={!!entry.invoice_id}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(entry.id)}
              disabled={!!entry.invoice_id}
            >
              Delete
            </Button>
          </ButtonRow>
        ),
      },
    ],
    [handleDelete, segmentsByEntryId],
  )

  const hasFilters = search.length > 0 || year !== '' || month !== '' || day !== ''

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
                <FilterSelect
                  value={year}
                  aria-label="Filter by year"
                  onChange={(event) => setYear(event.target.value)}
                >
                  <option value="">All years</option>
                  {yearOptions.map((option) => (
                    <option key={option} value={String(option)}>
                      {option}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  value={month}
                  aria-label="Filter by month"
                  onChange={(event) => setMonth(event.target.value)}
                >
                  <option value="">All months</option>
                  {MONTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  value={day}
                  aria-label="Filter by day"
                  onChange={(event) => setDay(event.target.value)}
                >
                  <option value="">All days</option>
                  {DAY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FilterSelect>
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

const FilterSelect = styled(InlineSelect)`
  width: auto;
  min-width: 7rem;
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
