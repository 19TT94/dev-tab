import { PDFViewer } from '@react-pdf/renderer'
import styled from 'styled-components'

// Utils
import { type ReportPdfData } from '../lib/reportPdf'

// Components
import { Button } from './Button'
import { ReportDocument } from './ReportDocument'
import { downloadReportPdf } from './ReportPdf'
import { ButtonRow, Modal } from './ui'

interface ModalReportPreviewProps {
  open: boolean
  report: ReportPdfData
  startDate: string
  endDate: string
  onClose: () => void
}

export const ModalReportPreview = ({
  open,
  report,
  startDate,
  endDate,
  onClose,
}: ModalReportPreviewProps) => {
  const handleDownload = async () => {
    await downloadReportPdf(report, startDate, endDate)
  }

  return (
    <Modal
      open={open}
      title={`Preview — ${report.periodStart} – ${report.periodEnd}`}
      onClose={onClose}
      maxWidth="52rem"
    >
      <PreviewFrame>
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <ReportDocument report={report} />
        </PDFViewer>
      </PreviewFrame>
      <ButtonRow>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleDownload}>Download PDF</Button>
      </ButtonRow>
    </Modal>
  )
}

// Style Overrides
const PreviewFrame = styled.div`
  height: min(70vh, 42rem);
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};

  iframe {
    border: none;
  }
`
