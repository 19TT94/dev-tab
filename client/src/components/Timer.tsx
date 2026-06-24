import { useState } from 'react'
import styled from 'styled-components'

// Hooks
import { useProjects } from '../hooks/useProjects'
import { useTimer } from '../hooks/useTimer'

// Components
import { Button } from './Button'
import { InlineInput, InlineSelect } from './FormFields'
import { Card, CardBody } from './ui'

// Utils
import { formatDuration } from '../lib/utils'

export const Timer = () => {
  const { data: projects = [] } = useProjects()
  const { activeTimer, elapsed, start, stop } = useTimer()
  const [projectId, setProjectId] = useState('')
  const [description, setDescription] = useState('')

  const projectOptions = [
    { value: '', label: 'Project...' },
    ...projects.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.clients.name})`,
    })),
  ]

  const activeProject = projects.find((p) => p.id === activeTimer?.project_id)

  const handleStart = async () => {
    if (!projectId) return
    try {
      await start.mutateAsync({
        project_id: projectId,
        description: description || undefined,
      })
      setDescription('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start timer')
    }
  }

  const handleStop = async () => {
    try {
      await stop.mutateAsync()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to stop timer')
    }
  }

  return (
    <Card>
      <CardBody $padding="1.5rem">
        <TimerDisplay>
          <TimerValue>{formatDuration(elapsed)}</TimerValue>
          {activeTimer && activeProject && (
            <TimerMeta>
              {activeProject.name} — {activeProject.clients.name}
              {activeTimer.description && ` · ${activeTimer.description}`}
            </TimerMeta>
          )}
        </TimerDisplay>
        <Controls>
          <FieldRow>
            <Description
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
            />
            <ProjectSelect
              aria-label="Project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </ProjectSelect>
          </FieldRow>
          {!activeTimer ? (
            <Button
              onClick={handleStart}
              disabled={!projectId || start.isPending}
            >
              {start.isPending ? 'Starting...' : 'Start'}
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={handleStop}
              disabled={stop.isPending}
            >
              {stop.isPending ? 'Stopping...' : 'Stop Timer'}
            </Button>
          )}
        </Controls>
      </CardBody>
    </Card>
  )
}

// Style Overrides
const TimerDisplay = styled.div`
  margin-bottom: 1rem;
  text-align: center;
`

const TimerValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: clamp(1.75rem, 10vw, ${({ theme }) => theme.fontSizes['5xl']});
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.secondary};
`

const TimerMeta = styled.p`
  margin: 0.5rem 0 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
  overflow-wrap: anywhere;
`

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    align-items: center;
  }

  > button {
    width: 100%;

    @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
      width: auto;
    }
  }
`

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    flex: 1;
    min-width: 0;
    align-items: center;
  }
`

const Description = styled(InlineInput)`
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex: 1;
    min-width: 0;
    width: auto;
  }
`

const ProjectSelect = styled(InlineSelect)`
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: auto;
    flex-shrink: 0;
    max-width: 120px;
  }
`
