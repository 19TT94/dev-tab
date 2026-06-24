import { useForm } from 'react-hook-form'

// Types
import type { ProjectWithClient } from '../types/database'

// Components
import { Button } from './Button'
import { Input } from './FormFields'
import { ButtonRow, Checkbox, CheckboxLabel, FormStack } from './ui'

export interface ProjectFormPayload {
  client_id: string
  name: string
  hourly_rate: number | null
  billable: boolean
}

interface ProjectFormData {
  name: string
  hourly_rate: string
  billable: boolean
}

interface ProjectFormProps {
  clientId: string
  project?: ProjectWithClient
  onSave: (data: ProjectFormPayload) => Promise<void>
  onCancel?: () => void
}

export const ProjectForm = ({ clientId, project, onSave, onCancel }: ProjectFormProps) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProjectFormData>({
    defaultValues: project
      ? {
          name: project.name,
          hourly_rate: project.hourly_rate?.toString() ?? '',
          billable: project.billable,
        }
      : { name: '', hourly_rate: '', billable: true },
  })

  const submit = handleSubmit(async (data) => {
    await onSave({
      client_id: clientId,
      name: data.name,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      billable: data.billable,
    })
  })

  return (
    <FormStack onSubmit={submit}>
      <Input label="Project name" {...register('name', { required: true })} />
      <Input
        label="Hourly rate override ($, optional)"
        type="number"
        step="0.01"
        min="0"
        {...register('hourly_rate')}
      />
      <CheckboxLabel>
        <Checkbox {...register('billable')} />
        Billable by default
      </CheckboxLabel>
      <ButtonRow>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Project'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </ButtonRow>
    </FormStack>
  )
}
