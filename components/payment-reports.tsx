"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnnualReport } from "./annual-report"
import { MonthlyReport } from "./monthly-report"
import { PitchReport } from "./pitch-report"
import { MatchDayReport } from "./match-day-report"
import { DailyPaymentReport } from "./daily-payment-report"

export function PaymentReports() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payment Reports</h2>

      <Tabs defaultValue="annual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="annual">Annual</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="pitch">Pitch</TabsTrigger>
          <TabsTrigger value="match">Match Day</TabsTrigger>
        </TabsList>

        <TabsContent value="annual" className="mt-6">
          <AnnualReport />
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <MonthlyReport />
        </TabsContent>

        <TabsContent value="pitch" className="mt-6">
          <PitchReport />
        </TabsContent>

        <TabsContent value="match" className="mt-6">
          <DailyPaymentReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PaymentReports