import { useState } from 'react'
import styled from 'styled-components'

// Hooks
import { useTimeEntries, useTimeEntryMutations } from '../hooks/useTimeEntries'

// Types
import type { TimeEntryWithProject } from '../types/database'

// Components
import { ModalAddEntry } from '../components/ModalAddEntry'
import { Button } from '../components/Button'
import {
  ButtonRow,
  Card,
  MonoText,
  MutedHint,
  PageContainer,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  StatusNo,
  StatusYes,
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
  formatDateTime,
  formatDuration,
  formatHours,
} from '../lib/utils'

const TimeEntriesPage = () => {
  const { data: entries = [], isLoading } = useTimeEntries()
  const { create, update, remove } = useTimeEntryMutations()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TimeEntryWithProject | null>(null)

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this time entry?')) return
    await remove.mutateAsync(id)
  }

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
          {isLoading ? (
            <Text $color="muted" style={{ padding: '1.25rem' }}>Loading...</Text>
          ) : entries.length === 0 ? (
            <Text $color="muted" style={{ padding: '1.25rem' }}>No time entries yet.</Text>
          ) : (
            <TableWrapper>
              <Table>
                <TableHead>
                  <tr>
                    <Th>Project</Th>
                    <Th>Description</Th>
                    <Th>When</Th>
                    <Th $align="right">Duration</Th>
                    <Th>Billable</Th>
                    <Th />
                  </tr>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <Td data-emphasis="true">
                        <ProjectName>{entry.projects.name}</ProjectName>
                        <ClientName>{entry.projects.clients.name}</ClientName>
                      </Td>
                      <Td>{entry.description || '—'}</Td>
                      <Td>{formatDateTime(entry.started_at)}</Td>
                      <Td $align="right" data-emphasis="true">
                        <MonoText>{formatDuration(entry.duration_seconds)}</MonoText>
                        <MutedHint>
                          <br />
                          {formatHours(entry.duration_seconds)} hrs
                        </MutedHint>
                      </Td>
                      <Td>
                        {entry.billable ? <StatusYes>Yes</StatusYes> : <StatusNo>No</StatusNo>}
                        {entry.invoice_id && (
                          <MutedHint>
                            <br />
                            Invoiced
                          </MutedHint>
                        )}
                      </Td>
                      <Td>
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
                      </Td>
                    </tr>
                  ))}
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
const ProjectName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const ClientName = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`

export default TimeEntriesPage
