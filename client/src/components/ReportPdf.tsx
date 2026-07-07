import { pdf } from '@react-pdf/renderer'

// Components
import { ReportDocument } from './ReportDocument'

// Utils
import {
  reportPdfFilename,
  type ReportPdfData,
} from '../lib/reportPdf'

export const downloadReportPdf = async (
  report: ReportPdfData,
  startDate: string,
  endDate: string,
  filename?: string,
): Promise<void> => {
  const blob = await pdf(<ReportDocument report={report} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename ?? reportPdfFilename(startDate, endDate)
  link.click()
  URL.revokeObjectURL(url)
}
