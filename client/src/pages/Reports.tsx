import { useMemo, useState } from 'react'
import styled from 'styled-components'

// Hooks
import { useClients } from '../hooks/useClients'
import { useProjects } from '../hooks/useProjects'
import { useTimeEntries } from '../hooks/useTimeEntries'

// Types
import type { TimeEntryWithProject } from '../types/database'

// Components
import { Button } from '../components/Button'
import { EntryOverageIndicator } from '../components/EntryOverageIndicator'
import { Input, Select } from '../components/FormFields'
import {
  BaseTable,
  Card,
  Checkbox,
  CheckboxLabel,
  Grid,
  MonoText,
  MutedHint,
  PageContainer,
  PageStack,
  PageSubtitle,
  PageTitle,
  StatCard,
  StatLabel,
  StatValue,
  Text,
  type TableColumn,
} from '../components/ui'

// Utils
import {
  billEntriesForReport,
  entryBillableAmount,
  entryHasOverage,
  emptyRetainerSummary,
  hasRetainerBilling,
  summarizeRetainerUsage,
  totalRevenueFromEntries,
} from '../lib/billing'
import { sortRows, type SortDirection } from '../lib/tableUtils'
import {
  downloadCsv,
  formatCurrency,
  formatDate,
  formatDuration,
  formatHours,
  toDateInputValue,
} from '../lib/utils'

const ReportsPage = () => {
  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()

  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return toDateInputValue(d)
  })
  const [endDate, setEndDate] = useState(toDateInputValue(new Date()))
  const [billableOnly, setBillableOnly] = useState(false)
  const [sortKey, setSortKey] = useState('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const { data: entries = [], isLoading } = useTimeEntries({
    clientId: clientId || undefined,
    projectId: projectId || undefined,
    startDate,
    endDate,
    billableOnly,
  })

  const summary = useMemo(() => {
    let totalSeconds = 0
    let billableSeconds = 0

    for (const entry of entries) {
      totalSeconds += entry.duration_seconds
      if (entry.billable) {
        billableSeconds += entry.duration_seconds
      }
    }

    return {
      totalSeconds,
      billableSeconds,
      revenue: totalRevenueFromEntries(entries),
    }
  }, [entries])

  const segmentsByEntryId = useMemo(
    () => billEntriesForReport(entries),
    [entries],
  )

  const retainerSummaries = useMemo(() => {
    const summaries = summarizeRetainerUsage(entries)

    if (!clientId) return summaries

    const client = clients.find((c) => c.id === clientId)
    if (
      client &&
      hasRetainerBilling(client) &&
      !summaries.some((summary) => summary.clientId === clientId)
    ) {
      const empty = emptyRetainerSummary(client)
      if (empty) return [empty]
    }

    return summaries
  }, [entries, clientId, clients])

  const clientOptions = [
    { value: '', label: 'All clients' },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ]

  const filteredProjects = clientId
    ? projects.filter((p) => p.client_id === clientId)
    : projects

  const projectOptions = [
    { value: '', label: 'All projects' },
    ...filteredProjects.map((p) => ({ value: p.id, label: p.name })),
  ]

  const sortAccessors = useMemo(
    () => ({
      client: (entry: TimeEntryWithProject) =>
        entry.projects.clients.name.toLowerCase(),
      project: (entry: TimeEntryWithProject) => entry.projects.name.toLowerCase(),
      date: (entry: TimeEntryWithProject) => new Date(entry.started_at).getTime(),
      duration: (entry: TimeEntryWithProject) => entry.duration_seconds,
      amount: (entry: TimeEntryWithProject) => {
        const segments = segmentsByEntryId.get(entry.id) ?? []
        return entry.billable ? entryBillableAmount(entry, segments) : 0
      },
    }),
    [segmentsByEntryId],
  )

  const sortedEntries = useMemo(() => {
    if (!sortKey || !sortAccessors[sortKey as keyof typeof sortAccessors]) {
      return entries
    }
    return sortRows(
      entries,
      sortDirection,
      sortAccessors[sortKey as keyof typeof sortAccessors],
    )
  }, [entries, sortKey, sortDirection, sortAccessors])

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const columns = useMemo<TableColumn<TimeEntryWithProject>[]>(
    () => [
      {
        key: 'client',
        header: 'Client',
        sortable: true,
        render: (entry) => <Emphasis>{entry.projects.clients.name}</Emphasis>,
      },
      {
        key: 'project',
        header: 'Project',
        sortable: true,
        render: (entry) => entry.projects.name,
      },
      {
        key: 'date',
        header: 'Date',
        sortable: true,
        render: (entry) => formatDate(entry.started_at),
      },
      {
        key: 'duration',
        header: 'Duration',
        sortable: true,
        align: 'right',
        render: (entry) => (
          <Emphasis>
            <MonoText>{formatDuration(entry.duration_seconds)}</MonoText>
          </Emphasis>
        ),
      },
      {
        key: 'amount',
        header: 'Amount',
        sortable: true,
        align: 'right',
        render: (entry) => {
          const segments = segmentsByEntryId.get(entry.id) ?? []
          const amount = entry.billable
            ? entryBillableAmount(entry, segments)
            : 0

          return (
            <AmountCell>
              <Emphasis>
                {entry.billable ? formatCurrency(amount) : '—'}
              </Emphasis>
              {entry.billable && (
                <EntryOverageIndicator
                  segments={segments}
                  totalSeconds={entry.duration_seconds}
                  align="right"
                />
              )}
            </AmountCell>
          )
        },
      },
    ],
    [segmentsByEntryId],
  )

  const exportCsv = () => {
    const rows: string[][] = [
      ['Client', 'Project', 'Description', 'Date', 'Duration (hrs)', 'Billable', 'Overage', 'Rate', 'Amount'],
    ]

    for (const entry of entries) {
      const segments = segmentsByEntryId.get(entry.id) ?? []
      const amount = entry.billable ? entryBillableAmount(entry, segments) : 0
      const rateLabel = entry.billable
        ? segments.length === 1
          ? segments[0].rate.toFixed(2)
          : segments.map((segment) => segment.rate.toFixed(2)).join(' / ')
        : '0'

      rows.push([
        entry.projects.clients.name,
        entry.projects.name,
        entry.description ?? '',
        formatDate(entry.started_at),
        formatHours(entry.duration_seconds),
        entry.billable ? 'Yes' : 'No',
        entry.billable && entryHasOverage(segments) ? 'Yes' : 'No',
        rateLabel,
        entry.billable ? amount.toFixed(2) : '0',
      ])
    }

    downloadCsv(`time-report-${startDate}-to-${endDate}.csv`, rows)
  }

  return (
    <PageContainer $maxWidth="56rem">
      <PageStack>
        <div>
          <PageTitle>Reports</PageTitle>
          <PageSubtitle>Filter and export your tracked time</PageSubtitle>
        </div>

        <FilterCard>
          <Grid $cols={3}>
            <Select
              label="Client"
              options={clientOptions}
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value)
                setProjectId('')
              }}
            />
            <Select
              label="Project"
              options={projectOptions}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
            <Input
              label="Start date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <CheckboxLabel style={{ alignSelf: 'end', paddingBottom: '0.5rem' }}>
              <Checkbox
                checked={billableOnly}
                onChange={(e) => setBillableOnly(e.target.checked)}
              />
              Billable only
            </CheckboxLabel>
          </Grid>
        </FilterCard>

        {retainerSummaries.length > 0 && (
          <RetainerStack>
            {retainerSummaries.map((summary) => {
              const retainerPct = Math.min(
                100,
                (summary.retainerHoursUsed / summary.allowanceHours) * 100,
              )
              const overagePct = Math.min(
                100,
                (summary.overageHoursUsed / summary.allowanceHours) * 100,
              )

              return (
                <RetainerCard key={summary.clientId}>
                  <RetainerCardHeader>
                    <div>
                      <RetainerTitle>
                        Monthly retainer
                        {retainerSummaries.length > 1 && (
                          <> — {summary.clientName}</>
                        )}
                      </RetainerTitle>
                      <Text $size="xs" $color="muted">
                        {formatHours(summary.allowanceHours * 3600)}/mo @{' '}
                        {formatCurrency(summary.retainerRate)}/hr ·{' '}
                        {formatCurrency(summary.overageRate)}/hr overage
                      </Text>
                    </div>
                  </RetainerCardHeader>
                  <RetainerCardBody>
                    <UsageBar>
                      <UsageBarFill
                        $variant="retainer"
                        $width={retainerPct}
                      />
                      {summary.overageHoursUsed > 0 && (
                        <UsageBarFill $variant="overage" $width={overagePct} />
                      )}
                    </UsageBar>
                    <RetainerStats>
                      <RetainerStat>
                        <StatLabel>Retainer used</StatLabel>
                        <CompactStatValue>
                          {formatHours(summary.retainerHoursUsed * 3600)}
                        </CompactStatValue>
                      </RetainerStat>
                      <RetainerStat>
                        <StatLabel>Remaining</StatLabel>
                        <CompactStatValue>
                          {formatHours(summary.retainerHoursRemaining * 3600)}
                        </CompactStatValue>
                      </RetainerStat>
                      <RetainerStat>
                        <StatLabel>Overage</StatLabel>
                        <CompactStatValue>
                          {formatHours(summary.overageHoursUsed * 3600)}
                        </CompactStatValue>
                      </RetainerStat>
                    </RetainerStats>
                    <MutedHint>
                      Based on billable entries in this date range, allocated
                      chronologically. Overage badges match this allocation.
                    </MutedHint>
                  </RetainerCardBody>
                </RetainerCard>
              )
            })}
          </RetainerStack>
        )}

        <Grid $cols={3}>
          <StatCard>
            <StatLabel>Total hours</StatLabel>
            <StatValue>{formatHours(summary.totalSeconds)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Billable hours</StatLabel>
            <StatValue>{formatHours(summary.billableSeconds)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Estimated revenue</StatLabel>
            <StatValue>{formatCurrency(summary.revenue)}</StatValue>
          </StatCard>
        </Grid>

        <ExportRow>
          <Button variant="secondary" onClick={exportCsv} disabled={entries.length === 0}>
            Export CSV
          </Button>
        </ExportRow>

        <Card>
          <BaseTable
            columns={columns}
            data={sortedEntries}
            rowKey={(entry) => entry.id}
            loading={isLoading}
            emptyMessage="No entries match your filters."
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={toggleSort}
          />
        </Card>
      </PageStack>
    </PageContainer>
  )
}

// Style Overrides
const FilterCard = styled(Card)`
  padding: 1.25rem;
`

const RetainerStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const RetainerCard = styled(Card)`
  overflow: hidden;
`

const RetainerCardHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const RetainerTitle = styled.h3`
  margin: 0 0 0.25rem;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const RetainerCardBody = styled.div`
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const UsageBar = styled.div`
  display: flex;
  height: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`

const UsageBarFill = styled.div<{
  $variant: 'retainer' | 'overage'
  $width: number
}>`
  width: ${({ $width }) => $width}%;
  background: ${({ $variant, theme }) =>
    $variant === 'retainer' ? theme.colors.primary : theme.colors.accent};
`

const RetainerStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`

const RetainerStat = styled.div``

const CompactStatValue = styled(StatValue)`
  font-size: ${({ theme }) => theme.fontSizes.xl};
`

const ExportRow = styled.div`
  display: flex;
  justify-content: flex-end;
`

const Emphasis = styled.span`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`

const AmountCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`

export default ReportsPage
