import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'

// Types
import type { InvoiceWithDetails } from '../types/database'

// Utils
import { businessInfo } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'

// Styles
import { theme } from '../styles/theme'

const { colors } = theme

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: colors.secondary,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.secondary,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  colDesc: { flex: 3 },
  colHours: { flex: 1, textAlign: 'right' },
  colRate: { flex: 1, textAlign: 'right' },
  colAmount: { flex: 1, textAlign: 'right' },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.secondary,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notes: {
    marginTop: 30,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
})

const InvoiceDocument = ({ invoice }: { invoice: InvoiceWithDetails }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <Text style={styles.subtitle}>{invoice.invoice_number}</Text>
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.sectionTitle}>From</Text>
          <Text>{businessInfo.name}</Text>
          {businessInfo.address ? <Text>{businessInfo.address}</Text> : null}
        </View>
        <View>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text>{invoice.clients.name}</Text>
          {invoice.clients.email ? <Text>{invoice.clients.email}</Text> : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text>
          Period: {formatDate(invoice.period_start)} — {formatDate(invoice.period_end)}
        </Text>
        <Text>Date: {formatDate(invoice.created_at)}</Text>
        <Text>Status: {invoice.status.toUpperCase()}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colHours}>Hours</Text>
          <Text style={styles.colRate}>Rate</Text>
          <Text style={styles.colAmount}>Amount</Text>
        </View>
        {invoice.invoice_line_items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colHours}>{Number(item.hours).toFixed(2)}</Text>
            <Text style={styles.colRate}>{formatCurrency(Number(item.rate))}</Text>
            <Text style={styles.colAmount}>{formatCurrency(Number(item.amount))}</Text>
          </View>
        ))}
      </View>

      <View style={styles.total}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(Number(invoice.subtotal))}
        </Text>
      </View>

      {invoice.notes && (
        <View style={styles.notes}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text>{invoice.notes}</Text>
        </View>
      )}
    </Page>
  </Document>
)

export const downloadInvoicePdf = async (
  invoice: InvoiceWithDetails,
  filename?: string,
): Promise<void> => {
  const blob = await pdf(<InvoiceDocument invoice={invoice} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename ?? `${invoice.invoice_number}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
