import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { ModalReportPreview } from '../ModalReportPreview'
import { theme } from '../../styles/theme'
import type { ReportPdfData } from '../../lib/reportPdf'

vi.mock('../ReportDocument', () => ({
  ReportDocument: () => <div data-testid="report-document" />,
}))

vi.mock('@react-pdf/renderer', () => ({
  PDFViewer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-viewer">{children}</div>
  ),
  Document: 'Document',
  Page: 'Page',
  Text: 'Text',
  View: 'View',
  StyleSheet: { create: (styles: unknown) => styles },
}))

vi.mock('../ReportPdf', () => ({
  downloadReportPdf: vi.fn(),
}))

function makeReport(): ReportPdfData {
  return {
    periodStart: '06/01/2024',
    periodEnd: '06/30/2024',
    clientLabel: 'All clients',
    projectLabel: 'All projects',
    billableOnly: false,
    totalHours: '2.00',
    billableHours: '2.00',
    revenue: '$200.00',
    retainerSummaries: [],
    entries: [],
  }
}

const renderPreview = (open = true) =>
  render(
    <ThemeProvider theme={theme}>
      <ModalReportPreview
        open={open}
        report={makeReport()}
        startDate="2024-06-01"
        endDate="2024-06-30"
        onClose={vi.fn()}
      />
    </ThemeProvider>,
  )

describe('ModalReportPreview', () => {
  it('renders the PDF viewer when open', () => {
    renderPreview()
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      'Preview — 06/01/2024 – 06/30/2024',
    )
  })

  it('does not render when closed', () => {
    renderPreview(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when Close is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(
      <ThemeProvider theme={theme}>
        <ModalReportPreview
          open
          report={makeReport()}
          startDate="2024-06-01"
          endDate="2024-06-30"
          onClose={onClose}
        />
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
