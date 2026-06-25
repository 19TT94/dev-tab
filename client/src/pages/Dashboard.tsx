import styled from 'styled-components'

// Hooks
import { useTimeEntries } from '../hooks/useTimeEntries'

// Components
import { Timer } from '../components/Timer'
import {
  Card,
  CardHeader,
  CardTitle,
  List,
  ListItem,
  MonoText,
  MutedHint,
  PageContainer,
  PageStack,
  PageSubtitle,
  PageTitle,
  Text,
} from '../components/ui'

// Utils
import {
  formatDateTime,
  formatDuration,
  formatHours,
  toDateInputValue,
} from '../lib/utils'

const Dashboard = () => {
  const today = toDateInputValue(new Date())
  const { data: entries = [], isLoading } = useTimeEntries({
    startDate: today,
    endDate: today,
  })

  const totalSeconds = entries.reduce((sum, e) => sum + e.duration_seconds, 0)

  return (
    <PageContainer $maxWidth="42rem">
      <PageStack $gap="2rem">
        <div>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>Track time and review today&apos;s work</PageSubtitle>
        </div>

        <Timer />

        <Card>
          {/* TODO: Add Weely & Monthly Preview */}
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
                  </EntryDuration>
                </ListItem>
              ))}
            </List>
          )}
        </Card>
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

export default Dashboard
