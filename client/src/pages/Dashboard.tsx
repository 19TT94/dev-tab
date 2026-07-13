import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

// Hooks
import { useTimeEntries } from '../hooks/useTimeEntries'

// Components
import { EntryOverageIndicator } from '../components/EntryOverageIndicator'
import { Timer } from '../components/Timer'
import {
  Card,
  CardHeader,
  CardTitle,
  Grid,
  List,
  ListItem,
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
} from '../components/ui'

// Utils
import { billEntriesForReport } from '../lib/billing'
import {
  formatDateTime,
  formatDuration,
  formatHours,
  getWeekStart,
  toDateInputValue,
} from '../lib/utils'

const Dashboard = () => {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const syncNow = () => {
      const current = new Date()
      setNow((prev) =>
        toDateInputValue(prev) === toDateInputValue(current) ? prev : current,
      )
    }

    syncNow()
    const interval = setInterval(syncNow, 60_000)
    window.addEventListener('focus', syncNow)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', syncNow)
    }
  }, [])

  const today = toDateInputValue(now)
  const weekStart = toDateInputValue(getWeekStart(now))
  const monthStart = useMemo(() => {
    const d = new Date(now)
    d.setDate(1)
    return toDateInputValue(d)
  }, [now])

  const { data: entries = [], isLoading } = useTimeEntries({
    startDate: today,
    endDate: today,
  })

  const { data: weekEntries = [] } = useTimeEntries({
    startDate: weekStart,
    endDate: today,
  })

  const { data: monthEntries = [] } = useTimeEntries({
    startDate: monthStart,
    endDate: today,
  })

  const segmentsByEntryId = useMemo(
    () => billEntriesForReport(monthEntries),
    [monthEntries],
  )

  const totalSeconds = entries.reduce((sum, e) => sum + e.duration_seconds, 0)
  const weekTotalSeconds = weekEntries.reduce(
    (sum, e) => sum + e.duration_seconds,
    0,
  )
  const monthTotalSeconds = monthEntries.reduce(
    (sum, e) => sum + e.duration_seconds,
    0,
  )

  const weekFilterUrl = `/time?${new URLSearchParams({
    startDate: weekStart,
    endDate: today,
  })}`
  const monthFilterUrl = `/time?${new URLSearchParams({
    startDate: monthStart,
    endDate: today,
  })}`

  return (
    <PageContainer $maxWidth="42rem">
      <PageStack $gap="2rem">
        <div>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>Track time and review today&apos;s work</PageSubtitle>
        </div>

        <Timer />

        <Card>
          <CardHeader $bordered>
            <CardTitle>Today&apos;s entries</CardTitle>
            <Text $color="muted">{formatHours(totalSeconds)} hrs total</Text>
          </CardHeader>

          {isLoading ? (
            <Text $color="muted" style={{ padding: '1.25rem' }}>Loading...</Text>
          ) : entries.length === 0 ? (
            <Text $color="muted" style={{ padding: '1.25rem' }}>No time logged today yet.</Text>
          ) : (
            <List>
              {entries.map((entry) => (
                <ListItem key={entry.id}>
                  <EntryInfo>
                    <EntryMeta>
                      {entry.projects.name}
                      <MutedHint> · </MutedHint>
                      <span style={{ fontWeight: 400, color: 'inherit' }}>
                        {entry.projects.clients.name}
                      </span>
                    </EntryMeta>
                    {entry.description && (
                      <EntryDescription>{entry.description}</EntryDescription>
                    )}
                    <EntryTime>{formatDateTime(entry.started_at)}</EntryTime>
                  </EntryInfo>
                  <EntryDuration>
                    <DurationValue>
                      <MonoText>{formatDuration(entry.duration_seconds)}</MonoText>
                    </DurationValue>
                    {!entry.billable && <NonBillable>Non-billable</NonBillable>}
                    {entry.billable && (
                      <EntryOverageIndicator
                        segments={segmentsByEntryId.get(entry.id) ?? []}
                        totalSeconds={entry.duration_seconds}
                        align="right"
                      />
                    )}
                  </EntryDuration>
                </ListItem>
              ))}
            </List>
          )}
        </Card>

        <Grid $cols={2}>
          <SummaryCard as={Link} to={weekFilterUrl}>
            <StatLabel>This week</StatLabel>
            <StatValue>{formatHours(weekTotalSeconds)}</StatValue>
            <SummaryHint>View entries</SummaryHint>
          </SummaryCard>
          <SummaryCard as={Link} to={monthFilterUrl}>
            <StatLabel>This month</StatLabel>
            <StatValue>{formatHours(monthTotalSeconds)}</StatValue>
            <SummaryHint>View entries</SummaryHint>
          </SummaryCard>
        </Grid>
      </PageStack>
    </PageContainer>
  )
}

// Style Overrides
const EntryInfo = styled.div``

const EntryMeta = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const EntryDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`

const EntryTime = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`

const EntryDuration = styled.div`
  text-align: right;
`

const DurationValue = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const NonBillable = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.accent};
`

const SummaryCard = styled(StatCard)`
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;

  &:hover {
    filter: brightness(0.92);
  }
`

const SummaryHint = styled(MutedHint)`
  display: block;
  margin-top: 0.5rem;
`

export default Dashboard
