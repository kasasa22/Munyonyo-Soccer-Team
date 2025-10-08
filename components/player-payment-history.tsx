"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface PlayerPaymentHistoryProps {
  id: string
}

interface Payment {
  id: string
  date: string
  amount: number
  type: "annual" | "monthly" | "pitch"
  status: "completed" | "pending" | "failed"
}

export function PlayerPaymentHistory({ id }: PlayerPaymentHistoryProps) {
  // In a real app, you would fetch this data from an API
  const payments: Payment[] = [
    {
      id: "1",
      date: "2025-04-08",
      amount: 150000,
      type: "annual",
      status: "completed",
    },
    {
      id: "2",
      date: "2025-03-05",
      amount: 10000,
      type: "monthly",
      status: "completed",
    },
    {
      id: "3",
      date: "2025-03-05",
      amount: 5000,
      type: "pitch",
      status: "completed",
    },
    {
      id: "4",
      date: "2025-02-03",
      amount: 10000,
      type: "monthly",
      status: "completed",
    },
    {
      id: "5",
      date: "2025-02-03",
      amount: 5000,
      type: "pitch",
      status: "completed",
    },
  ]

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Total paid: UGX {totalPaid.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {payment.type === "annual"
                    ? "Annual Subscription"
                    : payment.type === "monthly"
                      ? "Monthly Subscription"
                      : "Pitch Payment"}
                </TableCell>
                <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === "completed"
                        ? "default"
                        : payment.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
