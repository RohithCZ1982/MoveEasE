'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface InvoicePDFButtonProps {
  invoice: any
}

export default function InvoicePDFButton({ invoice }: InvoicePDFButtonProps) {
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  async function generatePDF() {
    setGenerating(true)
    try {
      const [{ pdf }, { InvoiceDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./InvoiceDocument'),
      ])

      const blob = await pdf(React.createElement(InvoiceDocument, { invoice })).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation error:', err)
      toast({ title: 'PDF generation failed', description: String(err), variant: 'destructive' })
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
