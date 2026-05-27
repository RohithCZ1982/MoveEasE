import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { formatDate, formatCurrency } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2px solid #1e3a5f',
  },
  companyName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
  },
  companyTagline: {
    fontSize: 9,
    color: '#f97316',
    letterSpacing: 2,
    marginTop: 2,
  },
  companyDetails: {
    fontSize: 9,
    color: '#555',
    marginTop: 4,
    lineHeight: 1.5,
  },
  docTitle: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    textAlign: 'right',
  },
  docSubtitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#e8f0fe',
    color: '#1e3a5f',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  col: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8f9ff',
    borderRadius: 4,
  },
  colTitle: {
    fontSize: 8,
    color: '#888',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  colValue: {
    fontSize: 10,
    color: '#1a1a1a',
    marginBottom: 3,
  },
  colValueBold: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a5f',
    padding: '8 6',
    borderRadius: '4 4 0 0',
  },
  tableHeaderText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: '7 6',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  col1: { flex: 3 },
  col2: { width: 50, textAlign: 'center' },
  col3: { width: 40, textAlign: 'center' },
  col4: { width: 60, textAlign: 'right' },
  col5: { width: 70, textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: {
    width: 220,
    borderTop: '2px solid #1e3a5f',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 9,
    color: '#666',
  },
  totalValue: {
    fontSize: 9,
    color: '#1a1a1a',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #ddd',
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff8ed',
    borderLeft: '3px solid #f97316',
    borderRadius: 2,
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#f97316',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: '#555',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #ddd',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#888',
  },
})

interface QuotationDocumentProps {
  quotation: any
}

export function QuotationDocument({ quotation }: QuotationDocumentProps) {
  const items = quotation.items || []
  const customer = quotation.customer || {}

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Move EasE</Text>
            <Text style={styles.companyTagline}>PACKERS & MOVERS</Text>
            <Text style={styles.companyDetails}>
              123, Business Park, Bangalore{'\n'}
              Phone: +91 98765 43210{'\n'}
              Email: info@moveease.in
            </Text>
          </View>
          <View>
            <Text style={styles.docTitle}>QUOTATION</Text>
            <Text style={styles.docSubtitle}>{quotation.quotationNumber}</Text>
            <Text style={styles.docSubtitle}>Date: {formatDate(quotation.createdAt)}</Text>
            <Text style={styles.statusBadge}>{quotation.status}</Text>
          </View>
        </View>

        {/* Customer & Shift Info */}
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Bill To</Text>
            <Text style={styles.colValueBold}>{customer.name}</Text>
            <Text style={styles.colValue}>{customer.mobile}</Text>
            {customer.email && <Text style={styles.colValue}>{customer.email}</Text>}
            {customer.address && <Text style={styles.colValue}>{customer.address}</Text>}
          </View>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Shift Details</Text>
            <Text style={styles.colValue}>Service: {quotation.serviceType?.replace('_', ' ')}</Text>
            <Text style={styles.colValue}>From: {quotation.fromAddress}</Text>
            <Text style={styles.colValue}>To: {quotation.toAddress}</Text>
            {quotation.shiftingDate && (
              <Text style={styles.colValue}>Date: {formatDate(quotation.shiftingDate)}</Text>
            )}
            {quotation.validUntil && (
              <Text style={styles.colValue}>Valid Until: {formatDate(quotation.validUntil)}</Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.col2]}>Unit</Text>
          <Text style={[styles.tableHeaderText, styles.col3]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.col4]}>Rate</Text>
          <Text style={[styles.tableHeaderText, styles.col5]}>Amount</Text>
        </View>

        {items.map((item: any, index: number) => (
          <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tableCell, styles.col1]}>{item.customName || item.item?.name}</Text>
            <Text style={[styles.tableCell, styles.col2]}>{item.unit}</Text>
            <Text style={[styles.tableCell, styles.col3]}>{Number(item.quantity)}</Text>
            <Text style={[styles.tableCell, styles.col4]}>Rs.{Number(item.rate).toFixed(2)}</Text>
            <Text style={[styles.tableCell, styles.col5]}>Rs.{Number(item.amount).toFixed(2)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            {[
              { label: 'Subtotal', value: quotation.subtotal },
              { label: 'Labor Charges', value: quotation.laborCharges, show: Number(quotation.laborCharges) > 0 },
              { label: 'Truck Charges', value: quotation.truckCharges, show: Number(quotation.truckCharges) > 0 },
              { label: 'Insurance', value: quotation.insuranceAmount, show: Number(quotation.insuranceAmount) > 0 },
              { label: 'Packing Charges', value: quotation.packingCharges, show: Number(quotation.packingCharges) > 0 },
            ].filter(row => row.show !== false).map(row => (
              <View key={row.label} style={styles.totalRow}>
                <Text style={styles.totalLabel}>{row.label}</Text>
                <Text style={styles.totalValue}>Rs.{Number(row.value).toFixed(2)}</Text>
              </View>
            ))}

            {Number(quotation.discountAmount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#dc2626' }]}>Discount</Text>
                <Text style={[styles.totalValue, { color: '#dc2626' }]}>-Rs.{Number(quotation.discountAmount).toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST ({Number(quotation.gstRate)}%)</Text>
              <Text style={styles.totalValue}>Rs.{Number(quotation.gstAmount).toFixed(2)}</Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandTotalValue}>Rs.{Number(quotation.grandTotal).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {(quotation.notes || quotation.terms) && (
          <View style={styles.notes}>
            {quotation.notes && (
              <>
                <Text style={styles.notesTitle}>NOTES</Text>
                <Text style={styles.notesText}>{quotation.notes}</Text>
              </>
            )}
            {quotation.terms && (
              <>
                <Text style={[styles.notesTitle, { marginTop: quotation.notes ? 6 : 0 }]}>TERMS & CONDITIONS</Text>
                <Text style={styles.notesText}>{quotation.terms}</Text>
              </>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Move EasE Movers · info@moveease.in · +91 98765 43210</Text>
          <Text style={styles.footerText}>This is a computer-generated document.</Text>
        </View>
      </Page>
    </Document>
  )
}
