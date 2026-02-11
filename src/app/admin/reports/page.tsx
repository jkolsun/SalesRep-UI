'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  Download,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

export default function ReportsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalDials: 0,
    totalConnects: 0,
    demosBooked: 0,
  })

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return

      const supabase = createClient()

      // Get total leads
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      // Get call logs stats
      const { data: callLogs } = await supabase
        .from('call_logs')
        .select('outcome')

      const logs = callLogs || []
      const connects = logs.filter(l =>
        ['ANSWERED', 'CALLBACK_SCHEDULED', 'DEMO_BOOKED'].includes(l.outcome)
      )
      const demos = logs.filter(l => l.outcome === 'DEMO_BOOKED')

      setStats({
        totalLeads: leadsCount || 0,
        totalDials: logs.length,
        totalConnects: connects.length,
        demosBooked: demos.length,
      })

      setIsLoading(false)
    }

    fetchReportData()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const connectRate = stats.totalDials > 0
    ? Math.round((stats.totalConnects / stats.totalDials) * 100)
    : 0
  const demoRate = stats.totalConnects > 0
    ? Math.round((stats.demosBooked / stats.totalConnects) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400">Insights into sales performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="thisMonth">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Total Leads</p>
            <p className="text-3xl font-bold text-white">{stats.totalLeads}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Total Dials</p>
            <p className="text-3xl font-bold text-white">{stats.totalDials}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Connect Rate</p>
            <p className="text-3xl font-bold text-teal-400">{connectRate}%</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Demos Booked</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.demosBooked}</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {stats.totalDials === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Activity Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Once your sales reps start making calls, detailed analytics and reports will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Show basic funnel if there's data */}
      {stats.totalDials > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Total Leads</span>
                  <span className="text-sm text-gray-400">{stats.totalLeads}</span>
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Dials Made</span>
                  <span className="text-sm text-gray-400">{stats.totalDials}</span>
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: stats.totalLeads > 0 ? `${Math.min((stats.totalDials / stats.totalLeads) * 100, 100)}%` : '0%' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Connects</span>
                  <span className="text-sm text-gray-400">{stats.totalConnects} ({connectRate}%)</span>
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-600"
                    style={{ width: stats.totalDials > 0 ? `${(stats.totalConnects / stats.totalDials) * 100}%` : '0%' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Demos Booked</span>
                  <span className="text-sm text-gray-400">{stats.demosBooked} ({demoRate}%)</span>
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-600"
                    style={{ width: stats.totalConnects > 0 ? `${(stats.demosBooked / stats.totalConnects) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
