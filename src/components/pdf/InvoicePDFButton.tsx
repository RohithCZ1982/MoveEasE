'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { InvoiceDocument } from './InvoiceDocument'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function InvoicePDFButton({ invoice }: { invoice: any }) {
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  async function generatePDF() {
    setGenerating(true)
    try {
      const blob = await pdf(<InvoiceDocument invoice={invoice} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoiceNumber || 'invoice'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF error:', err)
      toast({ title: 'PDF generation failed', description: String(err), variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button variant="outline" onClick={generatePDF} disabled={generating}>
      {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Download PDF
    </Button>
  )
}
