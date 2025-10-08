"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Monthly payment data
const monthlyData = [
  { name: "Jan", annual: 450000, monthly: 250000, pitch: 125000 },
  { name: "Feb", annual: 300000, monthly: 280000, pitch: 140000 },
  { name: "Mar", annual: 200000, monthly: 300000, pitch: 150000 },
  { name: "Apr", annual: 600000, monthly: 320000, pitch: 160000 },
  { name: "May", annual: 350000, monthly: 340000, pitch: 170000 },
  { name: "Jun", annual: 400000, monthly: 360000, pitch: 180000 },
]

// Expense data
const expenseData = [
  { name: "Facilities", value: 450000 },
  { name: "Equipment", value: 300000 },
  { name: "Food & Drinks", value: 200000 },
  { name: "Transport", value: 150000 },
  { name: "Medical", value: 100000 },
  { name: "Officials", value: 80000 },
]

// Payment status data
const paymentStatusData = [
  { name: "Paid", value: 65 },
  { name: "Partial", value: 20 },
  { name: "Overdue", value: 15 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function ReportsCharts() {
  const [timeRange, setTimeRange] = useState("6months")
  const isMobile = useMobile()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Financial Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trends Chart */}
        <Card className="dashboard-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Payment Trends</CardTitle>
            <CardDescription>Monthly payment collection by type</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              config={{
                annual: {
                  label: "Annual Subscription",
                  color: "hsl(var(--chart-1))",
                },
                monthly: {
                  label: "Monthly Subscription",
                  color: "hsl(var(--chart-2))",
                },
                pitch: {
                  label: "Pitch Payment",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="annual" stroke="var(--color-annual)" strokeWidth={2} />
                  <Line type="monotone" dataKey="monthly" stroke="var(--color-monthly)" strokeWidth={2} />
                  <Line type="monotone" dataKey="pitch" stroke="var(--color-pitch)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Expense Distribution Chart */}
        <Card className="dashboard-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Expense Distribution</CardTitle>
            <CardDescription>Breakdown of expenses by category</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `UGX ${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status Chart */}
        <Card className="dashboard-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Payment Status</CardTitle>
            <CardDescription>Distribution of player payment statuses</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    <Cell fill="#4ade80" /> {/* Green for Paid */}
                    <Cell fill="#facc15" /> {/* Yellow for Partial */}
                    <Cell fill="#f87171" /> {/* Red for Overdue */}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison Chart */}
        <Card className="dashboard-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison of income and expenses</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Jan", income: 825000, expenses: 450000 },
                    { name: "Feb", income: 720000, expenses: 380000 },
                    { name: "Mar", income: 650000, expenses: 420000 },
                    { name: "Apr", income: 1080000, expenses: 550000 },
                    { name: "May", income: 860000, expenses: 500000 },
                    { name: "Jun", income: 940000, expenses: 480000 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `UGX ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" fill="#3b82f6" name="Total Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Total Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
