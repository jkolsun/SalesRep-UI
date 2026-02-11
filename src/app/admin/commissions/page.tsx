'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Download } from 'lucide-react'

export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Commissions</h1>
          <p className="text-gray-400">Manage and track sales commissions</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards - All Zeros */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Pending Approval</p>
            <p className="text-3xl font-bold text-orange-400">$0.00</p>
            <p className="text-xs text-gray-500 mt-1">0 commission(s)</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Approved (Ready to Pay)</p>
            <p className="text-3xl font-bold text-blue-400">$0.00</p>
            <p className="text-xs text-gray-500 mt-1">0 commission(s)</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Paid This Month</p>
            <p className="text-3xl font-bold text-emerald-400">$0.00</p>
            <p className="text-xs text-gray-500 mt-1">0 commission(s)</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Rejected</p>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-16 text-center">
          <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Commissions Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Commissions will appear here when your sales reps book demos and close deals.
            Set up your commission structure in Settings to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
