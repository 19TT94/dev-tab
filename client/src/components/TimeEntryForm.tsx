import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

// Hooks
import { useProjects } from '../hooks/useProjects'

// Types
import type { TimeEntryWithProject } from '../types/database'

// Components
import { Button } from './Button'
import { Input, Select } from './FormFields'
import { ButtonRow, Checkbox, CheckboxLabel, FormRow, FormStack } from './ui'

interface TimeEntryFormData {
  project_id: string
  description: string
  date: string
  start_time: string
  end_time: string
  billable: boolean
}

interface TimeEntryFormProps {
  entry?: TimeEntryWithProject
  onSubmit: (data: {
    project_id: string
    description?: string
    started_at: string
    ended_at: string
    duration_seconds: number
    billable: boolean
  }) => Promise<void>
  onCancel?: () => void
}

export const TimeEntryForm = ({ entry, onSubmit, onCancel }: TimeEntryFormProps) => {
  const { data: projects = [] } = useProjects()

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } =
    useForm<TimeEntryFormData>({
      defaultValues: entry
        ? {
            project_id: entry.project_id,
            description: entry.description ?? '',
            date: entry.started_at.slice(0, 10),
            start_time: entry.started_at.slice(11, 16),
            end_time: entry.ended_at.slice(11, 16),
            billable: entry.billable,
          }
        : {
            project_id: '',
            description: '',
            date: new Date().toISOString().slice(0, 10),
            start_time: '09:00',
            end_time: '10:00',
            billable: true,
          },
    })

  const projectId = watch('project_id')
  const selectedProject = projects.find((p) => p.id === projectId)

  useEffect(() => {
    if (selectedProject && !entry) {
      setValue('billable', selectedProject.billable)
    }
  }, [selectedProject, entry, setValue])

  const projectOptions = [
    { value: '', label: 'Select project...' },
    ...projects.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.clients.name})`,
    })),
  ]

  const submit = handleSubmit(async (data) => {
    const startedAt = new Date(`${data.date}T${data.start_time}:00`)
    const endedAt = new Date(`${data.date}T${data.end_time}:00`)
    const durationSeconds = Math.max(
      0,
      Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000),
    )

    if (durationSeconds <= 0) {
      alert('End time must be after start time')
      return
    }

    await onSubmit({
      project_id: data.project_id,
      description: data.description || undefined,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
      billable: data.billable,
    })
  })

  return (
    <FormStack onSubmit={submit}>
      <Select label="Project" options={projectOptions} {...register('project_id', { required: true })} />
      <Input label="Description" {...register('description')} />
      <Input label="Date" type="date" {...register('date', { required: true })} />
      <FormRow>
        <Input label="Start time" type="time" {...register('start_time', { required: true })} />
        <Input label="End time" type="time" {...register('end_time', { required: true })} />
      </FormRow>
      <CheckboxLabel>
        <Checkbox {...register('billable')} />
        Billable
      </CheckboxLabel>
      <ButtonRow>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : entry ? 'Update Entry' : 'Add Entry'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </ButtonRow>
    </FormStack>
  )
}
