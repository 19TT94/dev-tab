import { useState, type FormEvent } from 'react'
import styled from 'styled-components'

// Components
import { Button } from './Button'
import { Input } from './FormFields'
import { ButtonRow, FormRow, FormStack, Modal, Text } from './ui'

export interface TimeEntryDateFilter {
  startDate: string
  endDate: string
}

interface ModalTimeEntryFiltersProps {
  open: boolean
  startDate: string
  endDate: string
  onApply: (filter: TimeEntryDateFilter) => void
  onClear: () => void
  onClose: () => void
}

interface FilterFormProps {
  startDate: string
  endDate: string
  onApply: (filter: TimeEntryDateFilter) => void
  onClear: () => void
  onClose: () => void
}

const FilterForm = ({
  startDate,
  endDate,
  onApply,
  onClear,
  onClose,
}: FilterFormProps) => {
  const [draftStart, setDraftStart] = useState(startDate)
  const [draftEnd, setDraftEnd] = useState(endDate)

  const rangeInvalid =
    draftStart !== '' && draftEnd !== '' && draftStart > draftEnd

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (rangeInvalid) return
    onApply({ startDate: draftStart, endDate: draftEnd })
    onClose()
  }

  const handleClear = () => {
    setDraftStart('')
    setDraftEnd('')
    onClear()
    onClose()
  }

  return (
    <FormStack onSubmit={handleSubmit}>
      <FormRow>
        <Input
          label="Start date"
          type="date"
          value={draftStart}
          onChange={(event) => setDraftStart(event.target.value)}
        />
        <Input
          label="End date"
          type="date"
          value={draftEnd}
          onChange={(event) => setDraftEnd(event.target.value)}
        />
      </FormRow>
      {rangeInvalid && (
        <Text $color="danger" $size="xs">
          Start date must be on or before end date.
        </Text>
      )}
      <Actions>
        <Button
          type="button"
          variant="secondary"
          onClick={handleClear}
          disabled={draftStart === '' && draftEnd === ''}
        >
          Clear
        </Button>
        <ButtonRow>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={rangeInvalid}>
            Apply
          </Button>
        </ButtonRow>
      </Actions>
    </FormStack>
  )
}

export const ModalTimeEntryFilters = ({
  open,
  startDate,
  endDate,
  onApply,
  onClear,
  onClose,
}: ModalTimeEntryFiltersProps) => {
  return (
    <Modal open={open} title="Filter entries" onClose={onClose} maxWidth="24rem">
      {open && (
        <FilterForm
          key={`${startDate}|${endDate}`}
          startDate={startDate}
          endDate={endDate}
          onApply={onApply}
          onClear={onClear}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}

// Style Overrides
const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`
