"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Report {
  id: string
  title: string
  description: string
  data: any[]
  columns: {
    key: string
    label: string
    format?: (value: any) => string
    isNumeric?: boolean
  }[]
}

interface ReportModalProps {
  report: Report | null
  isOpen: boolean
  onClose: () => void
}

export function ReportModal({ report, isOpen, onClose }: ReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  if (!report) {
    return null
  }

  // Calculate totals for numeric columns
  const totals: Record<string, number> = {}

  report.columns.forEach((column) => {
    if (column.isNumeric) {
      totals[column.key] = report.data.reduce((sum, row) => {
        return sum + (typeof row[column.key] === "number" ? row[column.key] : 0)
      }, 0)
    }
  })

  const handlePrint = () => {
    setIsPrinting(true)

    // Add a small delay to allow the UI to update
    setTimeout(() => {
      // Use the browser's print functionality
      const content = printRef.current
      const originalContents = document.body.innerHTML

      if (content) {
        // Create a print-friendly version
        const printContent = `
          <html>
            <head>
              <title>${report.title}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; font-weight: bold; }
                h1 { font-size: 24px; margin-bottom: 5px; }
                p { font-size: 14px; color: #666; margin-top: 0; }
                .totals-row { font-weight: bold; background-color: #f9f9f9; }
              </style>
            </head>
            <body>
              <h1>${report.title}</h1>
              <p>${report.description}</p>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
              ${content.innerHTML}
            </body>
          </html>
        `

        // Open a new window for printing
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.open()
          printWindow.document.write(printContent)
          printWindow.document.close()

          // Wait for content to load then print
          printWindow.onload = () => {
            printWindow.print()
            printWindow.onafterprint = () => {
              printWindow.close()
              setIsPrinting(false)
            }
          }
        } else {
          setIsPrinting(false)
          alert("Please allow pop-ups to export the report as PDF")
        }
      }
    }, 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </>
            )}
          </Button>
        </div>

        <div className="overflow-auto" ref={printRef}>
          <Card className="border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-white">
                  {report.columns.map((column) => (
                    <TableHead key={column.key} className="font-medium">
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.data.map((row, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    {report.columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.format ? column.format(row[column.key]) : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow className="bg-muted font-medium">
                  {report.columns.map((column, index) => (
                    <TableCell key={`total-${column.key}`}>
                      {index === 0
                        ? "Total"
                        : column.isNumeric
                          ? column.format
                            ? column.format(totals[column.key])
                            : totals[column.key]
                          : ""}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
