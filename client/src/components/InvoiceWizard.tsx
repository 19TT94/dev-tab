import { useMemo, useState } from 'react'
import styled from 'styled-components'

// Hooks
import { useClients } from '../hooks/useClients'
import { useInvoiceMutations } from '../hooks/useInvoices'
import { useTimeEntries } from '../hooks/useTimeEntries'

// Types
import type { DraftLineItem } from '../types/database'

// Components
import { Button } from './Button'
import { Input, Select, Textarea, InlineInput } from './FormFields'
import { Inline } from './ui/Layout'
import {
  ButtonRow,
  CompactTable,
  CompactTd,
  CompactTh,
  Grid,
  TableWrapper,
} from './ui'

// Utils
import { groupEntriesIntoLineItems } from '../lib/billing'
import { formatCurrency, toDateInputValue } from '../lib/utils'

interface InvoiceWizardProps {
  onClose: () => void
}

export const InvoiceWizard = ({ onClose }: InvoiceWizardProps) => {
  const { data: clients = [] } = useClients()
  const { create } = useInvoiceMutations()

  const [clientId, setClientId] = useState('')
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return toDateInputValue(d)
  })
  const [periodEnd, setPeriodEnd] = useState(toDateInputValue(new Date()))
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([])
  const [loaded, setLoaded] = useState(false)

  const { data: entries = [], isLoading } = useTimeEntries({
    clientId: clientId || undefined,
    startDate: periodStart,
    endDate: periodEnd,
    billableOnly: true,
    uninvoicedOnly: true,
  })

  const selectedClient = clients.find((client) => client.id === clientId)

  const loadLineItems = () => {
    setLineItems(groupEntriesIntoLineItems(entries, selectedClient))
    setLoaded(true)
  }

  const subtotal = useMemo(
    () => lineItems.reduce((sum, li) => sum + li.amount, 0),
    [lineItems],
  )

  const updateLineItem = (index: number, field: keyof DraftLineItem, value: string | number) => {
    setLineItems((items) => {
      const updated = [...items]
      const item = { ...updated[index], [field]: value }
      if (field === 'hours' || field === 'rate') {
        item.amount = Math.round(Number(item.hours) * Number(item.rate) * 100) / 100
      }
      updated[index] = item
      return updated
    })
  }

  const handleCreate = async () => {
    if (!clientId || lineItems.length === 0) return
    try {
      await create.mutateAsync({
        client_id: clientId,
        period_start: periodStart,
        period_end: periodEnd,
        notes: notes || undefined,
        line_items: lineItems,
      })
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create invoice')
    }
  }

  const clientOptions = [
    { value: '', label: 'Select client...' },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <>
      <Grid $cols={2} style={{ marginBottom: '1rem' }}>
        <Select
          label="Client"
          options={clientOptions}
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value)
            setLoaded(false)
            setLineItems([])
          }}
        />
        <Inline>
          <Input
            label="Period start"
            type="date"
            value={periodStart}
            onChange={(e) => {
              setPeriodStart(e.target.value)
              setLoaded(false)
            }}
          />
          <Input
            label="Period end"
            type="date"
            value={periodEnd}
            onChange={(e) => {
              setPeriodEnd(e.target.value)
              setLoaded(false)
            }}
          />
        </Inline>
      </Grid>

      {clientId && (
        <Button
          variant="secondary"
          onClick={loadLineItems}
          disabled={isLoading || entries.length === 0}
          style={{ marginBottom: '1rem' }}
        >
          {isLoading
            ? 'Loading entries...'
            : entries.length === 0
              ? 'No uninvoiced billable entries'
              : `Load ${entries.length} entries`}
        </Button>
      )}

      {loaded && lineItems.length > 0 && (
        <>
          <TableWrapper style={{ marginBottom: '1rem' }}>
            <CompactTable>
              <thead>
                <tr>
                  <CompactTh>Description</CompactTh>
                  <CompactTh $align="right">Hours</CompactTh>
                  <CompactTh $align="right">Rate</CompactTh>
                  <CompactTh $align="right">Amount</CompactTh>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={`${item.project_id}-${item.rate}-${i}`}>
                    <CompactTd>
                      <InlineInput
                        value={item.description}
                        onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                      />
                    </CompactTd>
                    <CompactTd $align="right">
                      <InlineInput
                        style={{ width: '5rem', textAlign: 'right' }}
                        type="number"
                        step="0.01"
                        value={item.hours}
                        onChange={(e) =>
                          updateLineItem(i, 'hours', parseFloat(e.target.value) || 0)
                        }
                      />
                    </CompactTd>
                    <CompactTd $align="right">
                      <InlineInput
                        style={{ width: '5rem', textAlign: 'right' }}
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) =>
                          updateLineItem(i, 'rate', parseFloat(e.target.value) || 0)
                        }
                      />
                    </CompactTd>
                    <CompactTd $align="right" style={{ fontWeight: 500 }}>
                      {formatCurrency(item.amount)}
                    </CompactTd>
                  </tr>
                ))}
              </tbody>
            </CompactTable>
          </TableWrapper>

          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <TotalRow>
            <TotalLabel>Total: {formatCurrency(subtotal)}</TotalLabel>
            <ButtonRow>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={create.isPending}>
                {create.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </ButtonRow>
          </TotalRow>
        </>
      )}
    </>
  )
}

// Style Overrides
const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
`

const TotalLabel = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
`
