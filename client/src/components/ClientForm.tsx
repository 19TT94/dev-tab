import { useForm } from 'react-hook-form'

// Types
import type { Client } from '../types/database'

// Components
import { Button } from './Button'
import { Input } from './FormFields'
import { ButtonRow, Checkbox, CheckboxLabel, FormStack, Panel, Text } from './ui'

export interface ClientFormData {
  name: string
  email: string
  default_hourly_rate: number
  retainer_enabled: boolean
  retainer_hours_per_month: number | null
  retainer_hourly_rate: number | null
  retainer_overage_rate: number | null
}

interface ClientFormProps {
  client?: Client
  onSave: (data: ClientFormData) => Promise<void>
  onCancel?: () => void
}

export const ClientForm = ({ client, onSave, onCancel }: ClientFormProps) => {
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<ClientFormData>({
    defaultValues: client
      ? {
          name: client.name,
          email: client.email ?? '',
          default_hourly_rate: client.default_hourly_rate,
          retainer_enabled: client.retainer_enabled,
          retainer_hours_per_month: client.retainer_hours_per_month,
          retainer_hourly_rate: client.retainer_hourly_rate,
          retainer_overage_rate: client.retainer_overage_rate,
        }
      : {
          name: '',
          email: '',
          default_hourly_rate: 0,
          retainer_enabled: false,
          retainer_hours_per_month: null,
          retainer_hourly_rate: null,
          retainer_overage_rate: null,
        },
  })

  const retainerEnabled = watch('retainer_enabled')

  return (
    <FormStack onSubmit={handleSubmit(onSave)}>
      <Input label="Name" {...register('name', { required: true })} />
      <Input label="Email" type="email" {...register('email')} />
      <Input
        label="Default hourly rate ($)"
        type="number"
        step="0.01"
        min="0"
        {...register('default_hourly_rate', { required: true, valueAsNumber: true })}
      />
      <Panel>
        <CheckboxLabel>
          <Checkbox {...register('retainer_enabled')} />
          Monthly retainer
        </CheckboxLabel>
        {retainerEnabled && (
          <>
            <Input
              label="Retainer hours per month"
              type="number"
              step="0.25"
              min="0"
              {...register('retainer_hours_per_month', {
                setValueAs: (value) => (value === '' || value == null ? null : Number(value)),
              })}
            />
            <Input
              label="Retainer rate ($/hr)"
              type="number"
              step="0.01"
              min="0"
              {...register('retainer_hourly_rate', {
                setValueAs: (value) => (value === '' || value == null ? null : Number(value)),
              })}
            />
            <Input
              label="Overage rate ($/hr)"
              type="number"
              step="0.01"
              min="0"
              {...register('retainer_overage_rate', {
                setValueAs: (value) => (value === '' || value == null ? null : Number(value)),
              })}
            />
            <Text $size="xs" $color="muted">
              Billable time is applied to the retainer in chronological order. Hours
              within the monthly allowance use the retainer rate; additional hours
              use the overage rate.
            </Text>
          </>
        )}
      </Panel>
      <ButtonRow>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
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
