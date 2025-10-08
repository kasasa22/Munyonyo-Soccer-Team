"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, FileText, Users, CreditCard, Receipt, AlertTriangle, ChevronRight } from "lucide-react"
import { ReportModal } from "./report-modal"

// Sample report data
const monthlyPaymentData = [
  { date: "2025-04-01", player: "Mukalazi Ismail", type: "Annual", amount: 150000, status: "Completed" },
  { date: "2025-04-02", player: "Patrick Kalungi", type: "Monthly", amount: 10000, status: "Completed" },
  { date: "2025-04-03", player: "Joseph Wakabi", type: "Monthly", amount: 10000, status: "Completed" },
  { date: "2025-04-05", player: "Denis Zimba", type: "Pitch", amount: 5000, status: "Completed" },
  { date: "2025-04-08", player: "Eria Musumba", type: "Monthly", amount: 10000, status: "Completed" },
  { date: "2025-04-10", player: "Hood Sentongo", type: "Pitch", amount: 5000, status: "Completed" },
  { date: "2025-04-15", player: "Frank Lubega", type: "Annual", amount: 150000, status: "Completed" },
  { date: "2025-04-18", player: "Ivan Diesel", type: "Pitch", amount: 5000, status: "Completed" },
]

const playerStatusData = [
  {
    player: "Mukalazi Ismail",
    annualStatus: "Paid",
    monthlyStatus: "Paid",
    pitchStatus: "Paid",
    totalPaid: 165000,
    balance: 0,
  },
  {
    player: "Patrick Kalungi",
    annualStatus: "Paid",
    monthlyStatus: "Paid",
    pitchStatus: "Paid",
    totalPaid: 165000,
    balance: 0,
  },
  {
    player: "Joseph Wakabi",
    annualStatus: "Paid",
    monthlyStatus: "Paid",
    pitchStatus: "Partial",
    totalPaid: 160000,
    balance: 5000,
  },
  {
    player: "Denis Zimba",
    annualStatus: "Overdue",
    monthlyStatus: "Paid",
    pitchStatus: "Paid",
    totalPaid: 15000,
    balance: 150000,
  },
  {
    player: "Eria Musumba",
    annualStatus: "Paid",
    monthlyStatus: "Overdue",
    pitchStatus: "Overdue",
    totalPaid: 150000,
    balance: 15000,
  },
  {
    player: "Hood Sentongo",
    annualStatus: "Paid",
    monthlyStatus: "Paid",
    pitchStatus: "Paid",
    totalPaid: 165000,
    balance: 0,
  },
]

const expenseData = [
  { date: "2025-04-05", description: "Pitch Rental", category: "Facilities", amount: 200000 },
  { date: "2025-04-03", description: "Equipment Purchase", category: "Equipment", amount: 150000 },
  { date: "2025-04-02", description: "Refreshments", category: "Food & Drinks", amount: 75000 },
  { date: "2025-03-28", description: "Transport for Away Game", category: "Transport", amount: 120000 },
  { date: "2025-03-25", description: "First Aid Supplies", category: "Medical", amount: 50000 },
  { date: "2025-03-20", description: "Referee Payment", category: "Officials", amount: 80000 },
]

const financialSummaryData = [
  { month: "January", totalIncome: 825000, totalExpenses: 450000, balance: 375000 },
  { month: "February", totalIncome: 720000, totalExpenses: 380000, balance: 340000 },
  { month: "March", totalIncome: 650000, totalExpenses: 420000, balance: 230000 },
  { month: "April", totalIncome: 1080000, totalExpenses: 550000, balance: 530000 },
]

const overduePaymentsData = [
  { player: "Denis Zimba", type: "Annual", amount: 150000, dueDate: "2025-03-15", daysPastDue: 24 },
  { player: "Eria Musumba", type: "Monthly", amount: 10000, dueDate: "2025-03-30", daysPastDue: 9 },
  { player: "Eria Musumba", type: "Pitch", amount: 5000, dueDate: "2025-03-30", daysPastDue: 9 },
  { player: "Salongo Mur", type: "Pitch", amount: 5000, dueDate: "2025-04-01", daysPastDue: 7 },
  { player: "Byamugisha Al", type: "Monthly", amount: 10000, dueDate: "2025-04-03", daysPastDue: 5 },
]

const annualReportData = [
  { period: "Q1 2025", income: 2195000, expenses: 1250000, players: 25, newMembers: 3, balance: 945000 },
  { period: "Q2 2025", income: 2450000, expenses: 1350000, players: 27, newMembers: 2, balance: 1100000 },
  { period: "Q3 2025", income: 2680000, expenses: 1450000, players: 28, newMembers: 1, balance: 1230000 },
  { period: "Q4 2025", income: 2870000, expenses: 1550000, players: 30, newMembers: 2, balance: 1320000 },
  { period: "Total 2025", income: 10195000, expenses: 5600000, players: 30, newMembers: 8, balance: 4595000 },
]

export function ReportsList() {
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reports = [
    {
      id: "1",
      title: "Monthly Payment Summary",
      description: "Summary of all payments collected in the current month",
      icon: <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: "bg-blue-500",
      data: monthlyPaymentData,
      columns: [
        { key: "date", label: "Date", format: (value: string) => new Date(value).toLocaleDateString() },
        { key: "player", label: "Player" },
        { key: "type", label: "Payment Type" },
        {
          key: "amount",
          label: "Amount",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
        { key: "status", label: "Status" },
      ],
    },
    {
      id: "2",
      title: "Player Payment Status",
      description: "Overview of payment status for all players",
      icon: <Users className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: "bg-green-500",
      data: playerStatusData,
      columns: [
        { key: "player", label: "Player" },
        { key: "annualStatus", label: "Annual Status" },
        { key: "monthlyStatus", label: "Monthly Status" },
        { key: "pitchStatus", label: "Pitch Status" },
        {
          key: "totalPaid",
          label: "Total Paid",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
        {
          key: "balance",
          label: "Balance",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
      ],
    },
    {
      id: "3",
      title: "Expense Report",
      description: "Detailed breakdown of all expenses",
      icon: <Receipt className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: "bg-purple-500",
      data: expenseData,
      columns: [
        { key: "date", label: "Date", format: (value: string) => new Date(value).toLocaleDateString() },
        { key: "description", label: "Description" },
        { key: "category", label: "Category" },
        {
          key: "amount",
          label: "Amount",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
      ],
    },
    {
      id: "4",
      title: "Financial Summary",
      description: "Complete financial overview with income and expenses",
      icon: <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: "bg-indigo-500",
      data: financialSummaryData,
      columns: [
        { key: "month", label: "Month" },
        {
          key: "totalIncome",
          label: "Total Income",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
        {
          key: "totalExpenses",
          label: "Total Expenses",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
        {
          key: "balance",
          label: "Balance",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
      ],
    },
    {
      id: "5",
      title: "Overdue Payments",
      description: "List of players with overdue payments",
      icon: <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: "bg-red-500",
      data: overduePaymentsData,
      columns: [
        { key: "player", label: "Player" },
        { key: "type", label: "Payment Type" },
        {
          key: "amount",
          label: "Amount",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
        { key: "dueDate", label: "Due Date", format: (value: string) => new Date(value).toLocaleDateString() },
        {
          key: "daysPastDue",
          label: "Days Overdue",
          isNumeric: true,
        },
      ],
    },
    {
      id: "6",
      title: "Annual Report",
      description: "Yearly financial summary and statistics",
      icon: <FileText className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: "bg-orange-500",
      data: annualReportData,
      columns: [
        { key: "period", label: "Period" },
        {
          key: "income",
          label: "Income",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
        {
          key: "expenses",
          label: "Expenses",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
        {
          key: "players",
          label: "Players",
          isNumeric: true,
        },
        {
          key: "newMembers",
          label: "New Members",
          isNumeric: true,
        },
        {
          key: "balance",
          label: "Balance",
          format: (value: number) => `UGX ${value.toLocaleString()}`,
          isNumeric: true,
        },
      ],
    },
  ]

  const handleReportClick = (report: any) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="dashboard-card border-0 overflow-hidden cursor-pointer transition-all hover:translate-y-[-4px]"
            onClick={() => handleReportClick(report)}
          >
            <div className={`h-2 w-full ${report.color}`}></div>
            <CardHeader className="pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold">{report.title}</CardTitle>
                <div
                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full text-white flex items-center justify-center ${report.color}`}
                >
                  {report.icon}
                </div>
              </div>
              <CardDescription className="mt-2 text-xs sm:text-sm">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-white border border-gray-200 text-gray-800 hover:bg-gray-100 hover:text-gray-900 flex justify-between">
                <span>View Report</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportModal report={selectedReport} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
