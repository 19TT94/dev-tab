import { useState } from 'react'
import styled from 'styled-components'

// Hooks
import {
  useInvoices,
  useInvoice,
  useInvoiceMutations,
} from '../hooks/useInvoices'

// Types
import type { InvoiceWithDetails } from '../types/database'

// Components
import { ModalAddInvoice } from '../components/ModalAddInvoice'
import { Button } from '../components/Button'
import { downloadInvoicePdf } from '../components/InvoicePdf'
import {
  Badge,
  ButtonRow,
  Card,
  CardBody,
  CompactTable,
  CompactTd,
  CompactTh,
  LinkButton,
  List,
  ListButton,
  PageContainer,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  Panel,
  Text,
} from '../components/ui'

// Utils
import {
  formatCurrency,
  formatDate,
} from '../lib/utils'

const InvoiceDetail = ({ invoiceId, onBack }: { invoiceId: string; onBack: () => void }) => {
  const { data: invoice, isLoading } = useInvoice(invoiceId)
  const { updateStatus, remove } = useInvoiceMutations()

  if (isLoading || !invoice) {
    return <Text $color="muted">Loading invoice...</Text>
  }

  const handleDownload = async () => {
    await downloadInvoicePdf(invoice as InvoiceWithDetails)
  }

  const handleStatusChange = async (status: 'draft' | 'sent' | 'paid') => {
    await updateStatus.mutateAsync({ id: invoice.id, status })
  }

  const handleDelete = async () => {
    if (!confirm('Delete this invoice? Linked time entries will become uninvoiced.')) return
    await remove.mutateAsync(invoice.id)
    onBack()
  }

  return (
    <PageStack>
      <LinkButton onClick={onBack}>← Back to invoices</LinkButton>

      <Card>
        <CardBody>
          <DetailHeader>
            <div>
              <InvoiceNumber>{invoice.invoice_number}</InvoiceNumber>
              <InvoiceMeta>
                {invoice.clients.name} · {formatDate(invoice.period_start)} —{' '}
                {formatDate(invoice.period_end)}
              </InvoiceMeta>
            </div>
            <Badge $variant={invoice.status as 'draft' | 'sent' | 'paid'}>
              {invoice.status}
            </Badge>
          </DetailHeader>

          <CompactTable style={{ marginBottom: '1.5rem', width: '100%' }}>
            <thead>
              <tr>
                <CompactTh>Description</CompactTh>
                <CompactTh $align="right">Hours</CompactTh>
                <CompactTh $align="right">Rate</CompactTh>
                <CompactTh $align="right">Amount</CompactTh>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_line_items.map((item) => (
                <tr key={item.id}>
                  <CompactTd>{item.description}</CompactTd>
                  <CompactTd $align="right">{Number(item.hours).toFixed(2)}</CompactTd>
                  <CompactTd $align="right">{formatCurrency(Number(item.rate))}</CompactTd>
                  <CompactTd $align="right">{formatCurrency(Number(item.amount))}</CompactTd>
                </tr>
              ))}
            </tbody>
          </CompactTable>

          <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
            <TotalLabel>Total: {formatCurrency(Number(invoice.subtotal))}</TotalLabel>
          </div>

          {invoice.notes && (
            <NotesPanel>
              <NotesTitle>Notes</NotesTitle>
              <Text>{invoice.notes}</Text>
            </NotesPanel>
          )}

          <ButtonRow style={{ flexWrap: 'wrap' }}>
            <Button onClick={handleDownload}>Download PDF</Button>
            {invoice.status === 'draft' && (
              <Button variant="secondary" onClick={() => handleStatusChange('sent')}>
                Mark as Sent
              </Button>
            )}
            {invoice.status === 'sent' && (
              <Button variant="secondary" onClick={() => handleStatusChange('paid')}>
                Mark as Paid
              </Button>
            )}
            {invoice.status !== 'draft' && invoice.status !== 'paid' && (
              <Button variant="ghost" onClick={() => handleStatusChange('draft')}>
                Revert to Draft
              </Button>
            )}
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </ButtonRow>
        </CardBody>
      </Card>
    </PageStack>
  )
}

const InvoicesPage = () => {
  const { data: invoices = [], isLoading } = useInvoices()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (selectedId) {
    return (
      <PageContainer $maxWidth="48rem">
        <InvoiceDetail invoiceId={selectedId} onBack={() => setSelectedId(null)} />
      </PageContainer>
    )
  }

  return (
    <PageContainer $maxWidth="48rem">
      <PageStack>
        <PageHeader>
          <div>
            <PageTitle>Invoices</PageTitle>
            <PageSubtitle>Create and manage client invoices</PageSubtitle>
          </div>
          <Button onClick={() => setModalOpen(true)}>New Invoice</Button>
        </PageHeader>

        <ModalAddInvoice open={modalOpen} onClose={() => setModalOpen(false)} />

        <Card>
          {isLoading ? (
            <Text $color="muted" style={{ padding: '1.25rem' }}>Loading...</Text>
          ) : invoices.length === 0 ? (
            <Text $color="muted" style={{ padding: '1.25rem' }}>No invoices yet.</Text>
          ) : (
            <List>
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <ListButton onClick={() => setSelectedId(invoice.id)}>
                    <div>
                      <ListPrimary>{invoice.invoice_number}</ListPrimary>
                      <ListSecondary>
                        {invoice.clients.name} · {formatDate(invoice.period_start)} —{' '}
                        {formatDate(invoice.period_end)}
                      </ListSecondary>
                    </div>
                    <ListRight>
                      <Badge $variant={invoice.status as 'draft' | 'sent' | 'paid'} $size="sm">
                        {invoice.status}
                      </Badge>
                      <ListAmount>{formatCurrency(Number(invoice.subtotal))}</ListAmount>
                    </ListRight>
                  </ListButton>
                </li>
              ))}
            </List>
          )}
        </Card>
      </PageStack>
    </PageContainer>
  )
}

// Style Overrides
const DetailHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`

const InvoiceNumber = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
`

const InvoiceMeta = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`

const TotalLabel = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
`

const NotesPanel = styled(Panel)`
  margin-bottom: 1.5rem;
`

const NotesTitle = styled.p`
  margin: 0 0 0.25rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const ListPrimary = styled.p`
  margin: 0;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const ListSecondary = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`

const ListRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const ListAmount = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

export default InvoicesPage
