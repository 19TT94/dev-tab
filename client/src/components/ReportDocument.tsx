import { type ReactNode } from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

// Utils
import { businessInfo } from '../lib/supabase'
import { type ReportPdfData } from '../lib/reportPdf'
import { formatCurrency, formatHours } from '../lib/utils'

// Styles
import { theme } from '../styles/theme'

export const ReportDocument = ({ report }: { report: ReportPdfData }) => {
  const lastIndex = report.entries.length - 1

  return (
    <Document>
      <ReportPage>
        <HeaderRow>
          <ContactBlock />
          <ReportBox report={report} />
        </HeaderRow>

        <FilterSection report={report} />

        <StatsRow report={report} />

        {report.retainerSummaries.length > 0 ? (
          <RetainerSection summaries={report.retainerSummaries} />
        ) : null}

        <EntriesTable>
          <TableHeaderRow>
            <HeaderCellClient>CLIENT</HeaderCellClient>
            <HeaderCellProject>PROJECT</HeaderCellProject>
            <HeaderCellDescription>DESCRIPTION</HeaderCellDescription>
            <HeaderCellDate>DATE</HeaderCellDate>
            <HeaderCellDuration>DURATION</HeaderCellDuration>
            <HeaderCellAmount>AMOUNT</HeaderCellAmount>
          </TableHeaderRow>

          {report.entries.map((entry, index) => (
            <EntryRow key={entry.id} entry={entry} $isLast={index === lastIndex} />
          ))}
        </EntriesTable>

        <PageFooter
          render={({ pageNumber, totalPages }) =>
            `-- ${pageNumber} of ${totalPages} --`
          }
          fixed
        />
      </ReportPage>
    </Document>
  )
}

// Style Overrides
const { colors } = theme

const BORDER_RADIUS = 6
const INNER_BORDER_RADIUS = BORDER_RADIUS - 1
const TABLE_HEADER_BG = '#f7f7f7'

const COLUMN_STYLES = {
  client: { width: '14%', paddingRight: 6 },
  project: { width: '16%', paddingRight: 6 },
  description: { width: '28%', paddingRight: 6 },
  date: { width: '14%', paddingRight: 6 },
  duration: { width: '14%', paddingRight: 6 },
  amount: { width: '14%' },
} as const

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 52,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: colors.secondary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactBlock: {
    flex: 1,
    paddingRight: 36,
    paddingTop: 4,
  },
  contactName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactLine: {
    fontSize: 10,
    lineHeight: 1.55,
    marginBottom: 2,
  },
  contactLink: {
    fontSize: 10,
    lineHeight: 1.55,
    marginBottom: 2,
    color: colors.primary,
    textDecoration: 'none',
  },
  reportBox: {
    width: 192,
    backgroundColor: colors.secondary,
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  brandLogo: {
    width: 58,
    height: 58,
    objectFit: 'contain',
  },
  reportTitle: {
    color: colors.tertiary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginTop: 12,
    textAlign: 'center',
  },
  reportPeriod: {
    color: colors.tertiary,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    color: colors.secondary,
  },
  filterLine: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.secondary,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  statCardLast: {
    marginRight: 0,
  },
  statLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 0.6,
    color: colors.muted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  retainerSection: {
    marginBottom: 18,
  },
  retainerCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  retainerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  retainerLine: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: colors.muted,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: TABLE_HEADER_BG,
    borderTopLeftRadius: INNER_BORDER_RADIUS,
    borderTopRightRadius: INNER_BORDER_RADIUS,
  },
  tableHeaderText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 0.6,
    color: colors.secondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  tableRowLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: INNER_BORDER_RADIUS,
    borderBottomRightRadius: INNER_BORDER_RADIUS,
  },
  colClient: {
    ...COLUMN_STYLES.client,
    fontSize: 9.5,
    lineHeight: 1.4,
    fontWeight: 'bold',
  },
  colProject: {
    ...COLUMN_STYLES.project,
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  colDescription: {
    ...COLUMN_STYLES.description,
    fontSize: 9,
    lineHeight: 1.45,
    color: colors.muted,
  },
  colDate: {
    ...COLUMN_STYLES.date,
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  colDuration: {
    ...COLUMN_STYLES.duration,
    fontSize: 9.5,
    lineHeight: 1.4,
    textAlign: 'right',
  },
  colAmount: {
    ...COLUMN_STYLES.amount,
    fontSize: 9.5,
    lineHeight: 1.4,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8.5,
    color: colors.muted,
    letterSpacing: 0.5,
  },
})

const ContactBlock = () => (
  <View style={styles.contactBlock}>
    <Text style={styles.contactName}>{businessInfo.name}</Text>
    {businessInfo.address ? (
      <Text style={styles.contactLine}>{businessInfo.address}</Text>
    ) : null}
  </View>
)

const ReportBox = ({ report }: { report: ReportPdfData }) => (
  <View style={styles.reportBox}>
    <Text style={styles.reportTitle}>TIME REPORT</Text>
    <Text style={styles.reportPeriod}>
      {report.periodStart} – {report.periodEnd}
    </Text>
  </View>
)

const ReportPage = ({ children }: { children: ReactNode }) => (
  <Page size="LETTER" style={styles.page}>
    {children}
  </Page>
)

const HeaderRow = ({ children }: { children: ReactNode }) => (
  <View style={styles.headerRow}>{children}</View>
)

const FilterSection = ({ report }: { report: ReportPdfData }) => (
  <View style={styles.filterSection}>
    <Text style={styles.sectionLabel}>FILTERS</Text>
    <Text style={styles.filterLine}>Client: {report.clientLabel}</Text>
    <Text style={styles.filterLine}>Project: {report.projectLabel}</Text>
    {report.billableOnly ? (
      <Text style={styles.filterLine}>Billable entries only</Text>
    ) : null}
  </View>
)

const StatsRow = ({ report }: { report: ReportPdfData }) => (
  <View style={styles.statsRow}>
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>TOTAL HOURS</Text>
      <Text style={styles.statValue}>{report.totalHours}</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>BILLABLE HOURS</Text>
      <Text style={styles.statValue}>{report.billableHours}</Text>
    </View>
    <View style={[styles.statCard, styles.statCardLast]}>
      <Text style={styles.statLabel}>EST. REVENUE</Text>
      <Text style={styles.statValue}>{report.revenue}</Text>
    </View>
  </View>
)

const RetainerSection = ({
  summaries,
}: {
  summaries: ReportPdfData['retainerSummaries']
}) => (
  <View style={styles.retainerSection}>
    <Text style={styles.sectionLabel}>RETAINER USAGE</Text>
    {summaries.map((summary) => (
      <View key={summary.clientId} style={styles.retainerCard}>
        <Text style={styles.retainerTitle}>{summary.clientName}</Text>
        <Text style={styles.retainerLine}>
          Retainer used: {formatHours(summary.retainerHoursUsed * 3600)} /{' '}
          {formatHours(summary.allowanceHours * 3600)} · Remaining:{' '}
          {formatHours(summary.retainerHoursRemaining * 3600)} · Overage:{' '}
          {formatHours(summary.overageHoursUsed * 3600)}
        </Text>
        <Text style={styles.retainerLine}>
          {formatCurrency(summary.retainerRate)}/hr retainer ·{' '}
          {formatCurrency(summary.overageRate)}/hr overage
        </Text>
      </View>
    ))}
  </View>
)

const EntriesTable = ({ children }: { children: ReactNode }) => (
  <View style={styles.table}>{children}</View>
)

const TableHeaderRow = ({ children }: { children: ReactNode }) => (
  <View style={styles.tableHeader}>{children}</View>
)

const HeaderCellClient = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colClient]}>{children}</Text>
)

const HeaderCellProject = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colProject]}>{children}</Text>
)

const HeaderCellDescription = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colDescription]}>{children}</Text>
)

const HeaderCellDate = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colDate]}>{children}</Text>
)

const HeaderCellDuration = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colDuration]}>{children}</Text>
)

const HeaderCellAmount = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colAmount]}>{children}</Text>
)

const EntryRow = ({
  entry,
  $isLast,
}: {
  entry: ReportPdfData['entries'][number]
  $isLast: boolean
}) => (
  <View style={$isLast ? [styles.tableRow, styles.tableRowLast] : styles.tableRow}>
    <Text style={styles.colClient}>{entry.clientName}</Text>
    <Text style={styles.colProject}>{entry.projectName}</Text>
    <Text style={styles.colDescription}>{entry.description || '—'}</Text>
    <Text style={styles.colDate}>{entry.date}</Text>
    <Text style={styles.colDuration}>{entry.duration}</Text>
    <Text style={styles.colAmount}>{entry.amount}</Text>
  </View>
)

const PageFooter = ({
  render,
  fixed,
}: {
  render: (props: { pageNumber: number; totalPages: number }) => string
  fixed?: boolean
}) => <Text style={styles.footer} render={render} fixed={fixed} />
