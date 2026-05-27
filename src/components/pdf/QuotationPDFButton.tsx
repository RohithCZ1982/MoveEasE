'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface QuotationPDFButtonProps {
  quotation: any
}

export default function QuotationPDFButton({ quotation }: QuotationPDFButtonProps) {
  const [generating, setGenerating] = useState(false)

  async function generatePDF() {
    setGenerating(true)
    try {
      const ReactPDF = await import('@react-pdf/renderer')
      const { QuotationDocument } = await import('./QuotationDocument')
      const React = await import('react')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await (ReactPDF as any).pdf(React.createElement(QuotationDocument, { quotation })).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${quotation.quotationNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button variant="outline" onClick={generatePDF} disabled={generating}>
      {generating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Download PDF
    </Button>
  )
}
