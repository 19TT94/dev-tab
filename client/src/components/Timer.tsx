import { useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

// Hooks
import { useProjects } from '../hooks/useProjects'
import { useTimer } from '../hooks/useTimer'

// Components
import { Button } from './Button'
import { InlineInput, InlineSelect } from './FormFields'
import { Card, CardBody } from './ui'
import { fieldBase } from './ui/InlineFields'

// Utils
import { formatDuration } from '../lib/utils'

const DESCRIPTION_PLACEHOLDER = 'What are you working on?'

export const Timer = () => {
  const { data: projects = [] } = useProjects()
  const { activeTimer, elapsed, start, stop, updateDescription } = useTimer()
  const [projectId, setProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const descriptionInputRef = useRef<HTMLInputElement>(null)

  const showDescriptionInput = !activeTimer || isEditingDescription
  const savedDescription = activeTimer?.description?.trim() ?? ''

  const projectOptions = [
    { value: '', label: 'Project...' },
    ...projects.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.clients.name})`,
    })),
  ]

  const activeProject = projects.find((p) => p.id === activeTimer?.project_id)

  useEffect(() => {
    if (!activeTimer) {
      setIsEditingDescription(false)
    }
  }, [activeTimer])

  useEffect(() => {
    if (isEditingDescription) {
      descriptionInputRef.current?.focus()
    }
  }, [isEditingDescription])

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

  const handleDescriptionDisplayClick = () => {
    setDescription(activeTimer?.description ?? '')
    setIsEditingDescription(true)
  }

  const saveActiveDescription = async () => {
    if (!activeTimer) return

    const nextDescription = description.trim()
    const currentDescription = activeTimer.description?.trim() ?? ''

    if (nextDescription === currentDescription) {
      setIsEditingDescription(false)
      return
    }

    try {
      await updateDescription.mutateAsync({
        description: nextDescription || undefined,
      })
      setIsEditingDescription(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update description')
    }
  }

  const handleDescriptionBlur = () => {
    if (activeTimer && isEditingDescription) {
      void saveActiveDescription()
    }
  }

  const handleDescriptionKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }

    if (event.key === 'Escape') {
      setDescription(activeTimer?.description ?? '')
      setIsEditingDescription(false)
    }
  }

  return (
    <Card>
      <CardBody $padding="1.5rem">
        <TimerDisplay>
          <TimerValue>{formatDuration(elapsed)}</TimerValue>
        </TimerDisplay>
        <Controls>
          <FieldRow>
            {showDescriptionInput ? (
              <Description
                ref={descriptionInputRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                onKeyDown={handleDescriptionKeyDown}
                placeholder={DESCRIPTION_PLACEHOLDER}
                disabled={updateDescription.isPending}
              />
            ) : (
              <DescriptionDisplay
                type="button"
                title="Click to edit description"
                onClick={handleDescriptionDisplayClick}
                $isPlaceholder={!savedDescription}
              >
                {savedDescription || DESCRIPTION_PLACEHOLDER}
              </DescriptionDisplay>
            )}
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

const descriptionFieldLayout = css`
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex: 1;
    min-width: 0;
    width: auto;
  }
`

const Description = styled(InlineInput)`
  ${descriptionFieldLayout}
`

const DescriptionDisplay = styled.button<{ $isPlaceholder: boolean }>`
  ${fieldBase}
  ${descriptionFieldLayout}
  text-align: left;
  cursor: pointer;

  color: ${({ theme, $isPlaceholder }) =>
    $isPlaceholder ? theme.colors.muted : theme.colors.secondary};

  &:hover {
    filter: brightness(0.92);
  }
`

const ProjectSelect = styled(InlineSelect)`
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: auto;
    flex-shrink: 0;
    max-width: 210px;
  }
`
