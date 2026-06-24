import { useMemo, useState } from 'react'
import styled from 'styled-components'

// Hooks
import { useClients } from '../hooks/useClients'
import { useProjects } from '../hooks/useProjects'
import { useTimeEntries } from '../hooks/useTimeEntries'

// Components
import { Button } from '../components/Button'
import { Input, Select } from '../components/FormFields'
import {
  Card,
  Checkbox,
  CheckboxLabel,
  Grid,
  MonoText,
  PageContainer,
  PageStack,
  PageSubtitle,
  PageTitle,
  StatCard,
  StatLabel,
  StatValue,
  Table,
  TableBody,
  TableHead,
  TableWrapper,
  Td,
  Text,
  Th,
} from '../components/ui'

// Utils
import {
  billEntriesForReport,
  entryBillableAmount,
  totalRevenueFromEntries,
} from '../lib/billing'
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

  const exportCsv = () => {
    const rows: string[][] = [
      ['Client', 'Project', 'Description', 'Date', 'Duration (hrs)', 'Billable', 'Rate', 'Amount'],
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
          {isLoading ? (
            <Text $color="muted" style={{ padding: '1.25rem' }}>Loading...</Text>
          ) : entries.length === 0 ? (
            <Text $color="muted" style={{ padding: '1.25rem' }}>No entries match your filters.</Text>
          ) : (
            <TableWrapper>
              <Table>
                <TableHead>
                  <tr>
                    <Th>Client</Th>
                    <Th>Project</Th>
                    <Th>Date</Th>
                    <Th $align="right">Duration</Th>
                    <Th $align="right">Amount</Th>
                  </tr>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => {
                    const segments = segmentsByEntryId.get(entry.id) ?? []
                    const amount = entry.billable
                      ? entryBillableAmount(entry, segments)
                      : 0

                    return (
                      <tr key={entry.id}>
                        <Td data-emphasis="true">{entry.projects.clients.name}</Td>
                        <Td>{entry.projects.name}</Td>
                        <Td>{formatDate(entry.started_at)}</Td>
                        <Td $align="right" data-emphasis="true">
                          <MonoText>{formatDuration(entry.duration_seconds)}</MonoText>
                        </Td>
                        <Td $align="right" data-emphasis="true">
                          {entry.billable ? formatCurrency(amount) : '—'}
                        </Td>
                      </tr>
                    )
                  })}
                </TableBody>
              </Table>
            </TableWrapper>
          )}
        </Card>
      </PageStack>
    </PageContainer>
  )
}

// Style Overrides
const FilterCard = styled(Card)`
  padding: 1.25rem;
`

const ExportRow = styled.div`
  display: flex;
  justify-content: flex-end;
`

export default ReportsPage
