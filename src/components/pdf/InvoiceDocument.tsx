import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 40, color: '#1a1a1a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 30, paddingBottom: 20, borderBottom: '2px solid #1e3a5f',
  },
  companyName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1e3a5f' },
  companyTagline: { fontSize: 9, color: '#f97316', letterSpacing: 2, marginTop: 2 },
  companyDetails: { fontSize: 9, color: '#555', marginTop: 4, lineHeight: 1.5 },
  docTitle: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: '#1e3a5f', textAlign: 'right' },
  docSubtitle: { fontSize: 10, color: '#666', textAlign: 'right', marginTop: 4 },
  statusBadge: {
    backgroundColor: '#fef3c7', color: '#92400e',
    padding: '4 8', borderRadius: 4, fontSize: 8,
    fontFamily: 'Helvetica-Bold', textAlign: 'right', marginTop: 4,
  },
  twoCol: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  col: { flex: 1, padding: 12, backgroundColor: '#f8f9ff', borderRadius: 4 },
  colTitle: { fontSize: 8, color: '#888', fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 6 },
  colValueBold: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1e3a5f', marginBottom: 3 },
  colValue: { fontSize: 10, color: '#1a1a1a', marginBottom: 3 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e3a5f', padding: '8 6', borderRadius: '4 4 0 0' },
  tableHeaderText: { color: '#fff', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb', padding: '7 6' },
  tableRowAlt: { backgroundColor: '#f9fafb' },
  tableCell: { fontSize: 9, color: '#374151' },
  col1: { flex: 3 }, col2: { width: 50, textAlign: 'center' },
  col3: { width: 40, textAlign: 'center' }, col4: { width: 60, textAlign: 'right' },
  col5: { width: 70, textAlign: 'right' },
  totalsSection: { marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' },
  totalsBox: { width: 220, borderTop: '2px solid #1e3a5f', paddingTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  totalLabel: { fontSize: 9, color: '#666' },
  totalValue: { fontSize: 9, color: '#1a1a1a' },
  grandTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTop: '1px solid #ddd', paddingTop: 6, marginTop: 4,
  },
  grandTotalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1e3a5f' },
  grandTotalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1e3a5f' },
  paymentBox: {
    marginTop: 20, padding: 12, backgroundColor: '#f0fdf4',
    borderLeft: '3px solid #22c55e', borderRadius: 2,
  },
  paymentTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#15803d', marginBottom: 4 },
  paymentText: { fontSize: 9, color: '#555' },
  footer: {
    position: 'absolute', bottom: 30, left: 40, right: 40,
    borderTop: '1px solid #ddd', paddingTop: 8,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footerText: { fontSize: 8, color: '#888' },
})

export function InvoiceDocument({ invoice }: { invoice: any }) {
  const customer = invoice.quotation?.customer || {}
  const quotation = invoice.quotation || {}
  const items = invoice.items || []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Move EasE</Text>
            <Text style={styles.companyTagline}>PACKERS & MOVERS</Text>
            <Text style={styles.companyDetails}>
              123, Business Park, Bangalore{'\n'}Phone: +91 98765 43210{'\n'}GST: 29XXXXX1234Z1
            </Text>
          </View>
          <View>
            <Text style={styles.docTitle}>TAX INVOICE</Text>
            <Text style={styles.docSubtitle}>{invoice.invoiceNumber}</Text>
            <Text style={styles.docSubtitle}>Date: {formatDate(invoice.createdAt)}</Text>
            <Text style={styles.statusBadge}>{invoice.status}</Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Bill To</Text>
            <Text style={styles.colValueBold}>{customer.name}</Text>
            <Text style={styles.colValue}>{customer.mobile}</Text>
            {customer.email && <Text style={styles.colValue}>{customer.email}</Text>}
            {customer.gstNumber && <Text style={styles.colValue}>GST: {customer.gstNumber}</Text>}
          </View>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Invoice Details</Text>
            <Text style={styles.colValue}>Quotation: {quotation.quotationNumber}</Text>
            <Text style={styles.colValue}>Service: {quotation.serviceType?.replace('_', ' ')}</Text>
            {quotation.fromAddress && <Text style={styles.colValue}>From: {quotation.fromAddress}</Text>}
            {quotation.toAddress && <Text style={styles.colValue}>To: {quotation.toAddress}</Text>}
            {invoice.dueDate && <Text style={styles.colValue}>Due: {formatDate(invoice.dueDate)}</Text>}
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.col2]}>Unit</Text>
          <Text style={[styles.tableHeaderText, styles.col3]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.col4]}>Rate</Text>
          <Text style={[styles.tableHeaderText, styles.col5]}>Amount</Text>
        </View>

        {items.map((item: any, index: number) => (
          <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tableCell, styles.col1]}>{item.customName}</Text>
            <Text style={[styles.tableCell, styles.col2]}>{item.unit}</Text>
            <Text style={[styles.tableCell, styles.col3]}>{Number(item.quantity)}</Text>
            <Text style={[styles.tableCell, styles.col4]}>Rs.{Number(item.rate).toFixed(2)}</Text>
            <Text style={[styles.tableCell, styles.col5]}>Rs.{Number(item.amount).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>Rs.{Number(invoice.subtotal).toFixed(2)}</Text>
            </View>
            {Number(invoice.discountAmount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#dc2626' }]}>Discount</Text>
                <Text style={[styles.totalValue, { color: '#dc2626' }]}>-Rs.{Number(invoice.discountAmount).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST (18%)</Text>
              <Text style={styles.totalValue}>Rs.{Number(invoice.gstAmount).toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandTotalValue}>Rs.{Number(invoice.grandTotal).toFixed(2)}</Text>
            </View>
            {Number(invoice.paidAmount) > 0 && (
              <>
                <View style={[styles.totalRow, { marginTop: 6 }]}>
                  <Text style={[styles.totalLabel, { color: '#16a34a' }]}>Amount Paid</Text>
                  <Text style={[styles.totalValue, { color: '#16a34a' }]}>Rs.{Number(invoice.paidAmount).toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: '#dc2626', fontFamily: 'Helvetica-Bold' }]}>Balance Due</Text>
                  <Text style={[styles.totalValue, { color: '#dc2626', fontFamily: 'Helvetica-Bold' }]}>Rs.{Number(invoice.dueAmount).toFixed(2)}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {invoice.paymentMode && (
          <View style={styles.paymentBox}>
            <Text style={styles.paymentTitle}>PAYMENT RECEIVED</Text>
            <Text style={styles.paymentText}>
              Mode: {invoice.paymentMode}
              {invoice.paymentDate ? `  |  Date: ${formatDate(invoice.paymentDate)}` : ''}
            </Text>
          </View>
        )}

        {invoice.notes && (
          <View style={[styles.paymentBox, { backgroundColor: '#fff8ed', borderLeftColor: '#f97316', marginTop: 10 }]}>
            <Text style={[styles.paymentTitle, { color: '#f97316' }]}>NOTES</Text>
            <Text style={styles.paymentText}>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Move EasE Movers · info@moveease.in · +91 98765 43210</Text>
          <Text style={styles.footerText}>This is a computer-generated document.</Text>
        </View>
      </Page>
    </Document>
  )
}
