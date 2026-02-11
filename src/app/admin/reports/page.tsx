'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Calendar,
  Clock,
  Trophy,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Demo data
const pipelineFunnel = [
  { stage: 'New Leads', count: 850, percentage: 100 },
  { stage: 'Contacted', count: 612, percentage: 72 },
  { stage: 'Callback Scheduled', count: 245, percentage: 29 },
  { stage: 'Demo Booked', count: 156, percentage: 18 },
  { stage: 'Demo Completed', count: 124, percentage: 15 },
  { stage: 'Closed Won', count: 42, percentage: 5 },
]

const leaderboard = [
  { rank: 1, name: 'Sarah Williams', demos: 24, closes: 8, revenue: 19200, closeRate: 33.3 },
  { rank: 2, name: 'Mike Thompson', demos: 18, closes: 6, revenue: 14400, closeRate: 33.3 },
  { rank: 3, name: 'Emily Davis', demos: 15, closes: 4, revenue: 9600, closeRate: 26.7 },
  { rank: 4, name: 'James Brown', demos: 12, closes: 3, revenue: 7200, closeRate: 25 },
  { rank: 5, name: 'Carlos Rodriguez', demos: 8, closes: 2, revenue: 4800, closeRate: 25 },
]

const leadSourceROI = [
  { source: 'Phoenix Restoration Companies', leads: 250, demos: 24, closes: 8, roi: '32%' },
  { source: 'Atlanta Water Damage Specialists', leads: 175, demos: 18, closes: 5, roi: '28%' },
  { source: 'Texas Personal Injury Firms', leads: 300, demos: 6, closes: 2, roi: '6.7%' },
  { source: 'Denver Fire & Smoke Restoration', leads: 100, demos: 15, closes: 6, roi: '60%' },
]

const timeOfDayAnalysis = [
  { hour: '9 AM', dials: 145, connects: 22, rate: 15.2 },
  { hour: '10 AM', dials: 178, connects: 31, rate: 17.4 },
  { hour: '11 AM', dials: 156, connects: 28, rate: 17.9 },
  { hour: '12 PM', dials: 89, connects: 11, rate: 12.4 },
  { hour: '1 PM', dials: 112, connects: 15, rate: 13.4 },
  { hour: '2 PM', dials: 167, connects: 29, rate: 17.4 },
  { hour: '3 PM', dials: 189, connects: 35, rate: 18.5 },
  { hour: '4 PM', dials: 145, connects: 24, rate: 16.6 },
  { hour: '5 PM', dials: 67, connects: 8, rate: 11.9 },
]

export default function ReportsPage() {
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

      {/* Pipeline Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Sales Pipeline Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineFunnel.map((stage, i) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{stage.stage}</span>
                  <span className="text-sm text-gray-400">
                    {stage.count} ({stage.percentage}%)
                  </span>
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-end pr-3"
                    style={{ width: `${stage.percentage}%` }}
                  >
                    <span className="text-xs font-medium text-white">
                      {stage.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Conversion Rate (Lead to Close)</p>
                <p className="text-2xl font-bold text-emerald-400">4.9%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Average Deal Size</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(2400)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Rep Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Rep</TableHead>
                  <TableHead>Demos</TableHead>
                  <TableHead>Closes</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Close Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((rep) => (
                  <TableRow key={rep.rank}>
                    <TableCell>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          rep.rank === 1
                            ? 'bg-yellow-500 text-black'
                            : rep.rank === 2
                            ? 'bg-gray-400 text-black'
                            : rep.rank === 3
                            ? 'bg-orange-600 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {rep.rank}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{rep.name}</TableCell>
                    <TableCell>{rep.demos}</TableCell>
                    <TableCell>{rep.closes}</TableCell>
                    <TableCell className="text-emerald-400">
                      {formatCurrency(rep.revenue)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          rep.closeRate >= 30
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }
                      >
                        {rep.closeRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lead Source ROI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Lead Source Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Demos</TableHead>
                  <TableHead>Closes</TableHead>
                  <TableHead>Close Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadSourceROI.map((source) => (
                  <TableRow key={source.source}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {source.source}
                    </TableCell>
                    <TableCell>{source.leads}</TableCell>
                    <TableCell>{source.demos}</TableCell>
                    <TableCell>{source.closes}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          parseFloat(source.roi) >= 30
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : parseFloat(source.roi) >= 15
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }
                      >
                        {source.roi}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Time of Day Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            Best Time to Call
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-9 gap-2">
            {timeOfDayAnalysis.map((hour) => (
              <div key={hour.hour} className="text-center">
                <div
                  className={`mb-2 rounded-lg p-3 ${
                    hour.rate >= 17
                      ? 'bg-emerald-500/20 border border-emerald-500/30'
                      : hour.rate >= 15
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <p className="text-xs text-gray-400">{hour.hour}</p>
                  <p
                    className={`text-lg font-bold ${
                      hour.rate >= 17
                        ? 'text-emerald-400'
                        : hour.rate >= 15
                        ? 'text-blue-400'
                        : 'text-white'
                    }`}
                  >
                    {hour.rate}%
                  </p>
                  <p className="text-xs text-gray-500">{hour.connects} connects</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-emerald-500/40" />
              <span className="text-gray-400">Best (17%+ connect rate)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500/40" />
              <span className="text-gray-400">Good (15-17%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-white/10" />
              <span className="text-gray-400">Below Average</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
