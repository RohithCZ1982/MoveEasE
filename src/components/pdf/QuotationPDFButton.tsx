'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface QuotationPDFButtonProps {
  quotation: any
}

export default function QuotationPDFButton({ quotation }: QuotationPDFButtonProps) {
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  async function generatePDF() {
    setGenerating(true)
    try {
      const [{ pdf }, { QuotationDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./QuotationDocument'),
      ])

      const blob = await pdf(React.createElement(QuotationDocument, { quotation })).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${quotation.quotationNumber}.pdf`
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
