import { type ReactNode } from 'react'
import {
  Document,
  Image,
  Link,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

// Types
import type { InvoiceWithDetails } from '../types/database'

// Utils
import { businessInfo } from '../lib/supabase'
import {
  formatCurrency,
  formatInvoiceHours,
  formatInvoiceLabel,
  formatInvoicePeriodDate,
  formatInvoiceRate,
  formatWebsiteHref,
  resolveAssetUrl,
  splitInvoiceDescription,
} from '../lib/utils'

// Styles
import { theme } from '../styles/theme'

import defaultInvoiceLogo from '../assets/invoice-logo.png'

const brandAddressLines = (address: string): string[] => {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length < 2) return [address]
  return [parts[0], parts.slice(1).join(', ')]
}

const invoiceLogoSrc = (): string => {
  if (businessInfo.logo) return resolveAssetUrl(businessInfo.logo)
  return defaultInvoiceLogo
}

export const InvoiceDocument = ({ invoice }: { invoice: InvoiceWithDetails }) => {
  const lineItems = invoice.invoice_line_items
  const lastIndex = lineItems.length - 1

  return (
    <Document>
      <InvoicePage>
        <HeaderRow>
          <ContactBlock />
          <BrandBox invoice={invoice} />
        </HeaderRow>

        <BillingSection>
          <BillToBlock invoice={invoice} />
          <BillingPeriodBlock invoice={invoice} />
        </BillingSection>

        <LineItemsTable>
          <TableHeaderRow>
            <HeaderCellService>SERVICE</HeaderCellService>
            <HeaderCellDescription>DESCRIPTION</HeaderCellDescription>
            <HeaderCellHrs>HRS</HeaderCellHrs>
            <HeaderCellRate>RATE</HeaderCellRate>
            <HeaderCellAmount>AMOUNT</HeaderCellAmount>
          </TableHeaderRow>

          {lineItems.map((item, index) => (
            <LineItemRow
              key={item.id}
              item={item}
              $isLast={index === lastIndex}
            />
          ))}
        </LineItemsTable>

        <TotalRow>
          <TotalText>
            TOTAL: {formatCurrency(Number(invoice.subtotal))}
          </TotalText>
        </TotalRow>

        {invoice.notes ? (
          <NotesSection>
            <SectionLabel>NOTES</SectionLabel>
            <NotesBody>{invoice.notes}</NotesBody>
          </NotesSection>
        ) : null}

        <PageFooter
          render={({ pageNumber, totalPages }) =>
            `-- ${pageNumber} of ${totalPages} --`
          }
          fixed
        />
      </InvoicePage>
    </Document>
  )
}

// Style Overrides
const { colors } = theme

const BORDER_RADIUS = 6
const INNER_BORDER_RADIUS = BORDER_RADIUS - 1
const TABLE_HEADER_BG = `color-mix(in srgb, ${colors.muted} 8%, ${colors.tertiary})`

const COLUMN_STYLES = {
  service: { width: '22%', paddingRight: 8 },
  description: { width: '38%', paddingRight: 8 },
  hrs: { width: '12%', paddingRight: 6 },
  rate: { width: '14%', paddingRight: 6 },
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
  brandBox: {
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
  brandInvoiceLabel: {
    color: colors.tertiary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginTop: 12,
    textAlign: 'center',
  },
  brandDate: {
    color: colors.tertiary,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  brandAddressLine: {
    color: colors.tertiary,
    fontSize: 8.5,
    lineHeight: 1.5,
    marginTop: 10,
    textAlign: 'center',
  },
  brandAddressLineCompact: {
    marginTop: 2,
  },
  billingSection: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    color: colors.secondary,
  },
  clientName: {
    fontSize: 10.5,
    fontWeight: 'bold',
    lineHeight: 1.45,
    marginBottom: 2,
  },
  infoLine: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.secondary,
  },
  billingPeriod: {
    marginTop: 18,
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
    paddingVertical: 11,
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
  colService: {
    ...COLUMN_STYLES.service,
    fontSize: 10,
    lineHeight: 1.4,
    fontWeight: 'bold',
  },
  colDescription: {
    ...COLUMN_STYLES.description,
  },
  descriptionLine: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: colors.muted,
    marginBottom: 2,
  },
  colNumeric: {
    fontSize: 10,
    textAlign: 'right',
    color: colors.secondary,
  },
  colHrs: {
    ...COLUMN_STYLES.hrs,
  },
  colRate: {
    ...COLUMN_STYLES.rate,
  },
  colAmount: {
    ...COLUMN_STYLES.amount,
    fontWeight: 'bold',
  },
  totalRow: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  notes: {
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesBody: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.muted,
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

const InvoicePage = ({ children }: { children: ReactNode }) => (
  <Page size="LETTER" style={styles.page}>
    {children}
  </Page>
)

const HeaderRow = ({ children }: { children: ReactNode }) => (
  <View style={styles.headerRow}>{children}</View>
)

const ContactBlock = () => (
  <View style={styles.contactBlock}>
    <Text style={styles.contactName}>{businessInfo.name}</Text>
    {businessInfo.email ? (
      <Link src={`mailto:${businessInfo.email}`} style={styles.contactLink}>
        {businessInfo.email}
      </Link>
    ) : null}
    {businessInfo.phone ? (
      <Text style={styles.contactLine}>{businessInfo.phone}</Text>
    ) : null}
    {businessInfo.website ? (
      <Link
        src={formatWebsiteHref(businessInfo.website)}
        style={styles.contactLink}
      >
        {businessInfo.website}
      </Link>
    ) : null}
  </View>
)

const BrandBox = ({ invoice }: { invoice: InvoiceWithDetails }) => (
  <View style={styles.brandBox}>
    <Image src={invoiceLogoSrc()} style={styles.brandLogo} />
    <Text style={styles.brandInvoiceLabel}>
      {formatInvoiceLabel(invoice.invoice_number)}
    </Text>
    <Text style={styles.brandDate}>
      {formatInvoicePeriodDate(invoice.created_at)}
    </Text>
    {businessInfo.address
      ? brandAddressLines(businessInfo.address).map((line, index) => (
          <Text
            key={`${line}-${index}`}
            style={
              index === 0
                ? styles.brandAddressLine
                : [styles.brandAddressLine, styles.brandAddressLineCompact]
            }
          >
            {line}
          </Text>
        ))
      : null}
  </View>
)

const BillToBlock = ({ invoice }: { invoice: InvoiceWithDetails }) => (
  <View>
    <SectionLabel>BILL TO</SectionLabel>
    <Text style={styles.clientName}>{invoice.clients.name}</Text>
    {invoice.clients.address ? (
      <Text style={styles.infoLine}>{invoice.clients.address}</Text>
    ) : invoice.clients.email ? (
      <Text style={styles.infoLine}>{invoice.clients.email}</Text>
    ) : null}
  </View>
)

const BillingPeriodBlock = ({ invoice }: { invoice: InvoiceWithDetails }) => (
  <View style={styles.billingPeriod}>
    <SectionLabel>BILLING PERIOD</SectionLabel>
    <Text style={styles.infoLine}>
      {formatInvoicePeriodDate(invoice.period_start)} –{' '}
      {formatInvoicePeriodDate(invoice.period_end)}
    </Text>
  </View>
)

const LineItemRow = ({
  item,
  $isLast,
}: {
  item: InvoiceWithDetails['invoice_line_items'][number]
  $isLast: boolean
}) => {
  const descriptionLines = splitInvoiceDescription(item.description)

  return (
    <View style={$isLast ? [styles.tableRow, styles.tableRowLast] : styles.tableRow}>
      <Text style={styles.colService}>{item.projects.name}</Text>
      <View style={styles.colDescription}>
        {descriptionLines.length > 0 ? (
          descriptionLines.map((line, index) => (
            <Text key={`${item.id}-${index}`} style={styles.descriptionLine}>
              {line.startsWith('●') ? line : `● ${line}`}
            </Text>
          ))
        ) : (
          <Text style={styles.descriptionLine}> </Text>
        )}
      </View>
      <Text style={[styles.colNumeric, styles.colHrs]}>
        {formatInvoiceHours(Number(item.hours))}
      </Text>
      <Text style={[styles.colNumeric, styles.colRate]}>
        {formatInvoiceRate(Number(item.rate))}
      </Text>
      <Text style={[styles.colNumeric, styles.colAmount]}>
        {formatCurrency(Number(item.amount))}
      </Text>
    </View>
  )
}

const BillingSection = ({ children }: { children: ReactNode }) => (
  <View style={styles.billingSection}>{children}</View>
)

const LineItemsTable = ({ children }: { children: ReactNode }) => (
  <View style={styles.table}>{children}</View>
)

const TableHeaderRow = ({ children }: { children: ReactNode }) => (
  <View style={styles.tableHeader}>{children}</View>
)

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <Text style={styles.sectionLabel}>{children}</Text>
)

const HeaderCellService = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colService]}>{children}</Text>
)

const HeaderCellDescription = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colDescription]}>{children}</Text>
)

const HeaderCellHrs = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colNumeric, styles.colHrs]}>
    {children}
  </Text>
)

const HeaderCellRate = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colNumeric, styles.colRate]}>
    {children}
  </Text>
)

const HeaderCellAmount = ({ children }: { children: ReactNode }) => (
  <Text style={[styles.tableHeaderText, styles.colNumeric, styles.colAmount]}>
    {children}
  </Text>
)

const TotalRow = ({ children }: { children: ReactNode }) => (
  <View style={styles.totalRow}>{children}</View>
)

const TotalText = ({ children }: { children: ReactNode }) => (
  <Text style={styles.totalText}>{children}</Text>
)

const NotesSection = ({ children }: { children: ReactNode }) => (
  <View style={styles.notes}>{children}</View>
)

const NotesBody = ({ children }: { children: ReactNode }) => (
  <Text style={styles.notesBody}>{children}</Text>
)

const PageFooter = ({
  render,
  fixed,
}: {
  render: (props: { pageNumber: number; totalPages: number }) => string
  fixed?: boolean
}) => <Text style={styles.footer} render={render} fixed={fixed} />
