"use client"

import { use } from "react"
import { EditPaymentForm } from "@/components/edit-payment-form"

interface EditPaymentPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPaymentPage({ params }: EditPaymentPageProps) {
  const { id } = use(params)
  
  return (
    <div className="container mx-auto py-6 px-4">
      <EditPaymentForm paymentId={id} />
    </div>
  )
}