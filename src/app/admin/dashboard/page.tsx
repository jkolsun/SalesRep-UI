'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Phone,
  PhoneCall,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Clock,
  ArrowRight,
  Activity,
  Loader2,
} from 'lucide-react'
import { formatCurrency, getRelativeTime, getInitials } from '@/lib/utils'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

interface KPIs {
  totalDials: number
  totalConnects: number
  connectRate: number
  demosBooked: number
  demosCompleted: number
  noShowRate: number
  closes: number
  closeRate: number
  revenueClose: number
}

interface Rep {
  id: string
  full_name: string
  email: string
  dialCount: number
  connectCount: number
  demosBooked: number
  lastActivity: Date | null
  status: 'active' | 'idle'
}

interface ActivityItem {
  id: string
  rep_name: string
  disposition: string
  company_name: string
  created_at: string
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [kpis, setKpis] = useState<KPIs>({
    totalDials: 0,
    totalConnects: 0,
    connectRate: 0,
    demosBooked: 0,
    demosCompleted: 0,
    noShowRate: 0,
    closes: 0,
    closeRate: 0,
    revenueClose: 0,
  })
  const [reps, setReps] = useState<Rep[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [totalLeads, setTotalLeads] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      const supabase = createClient()
      const now = new Date()
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)

      // Fetch call logs for today
      const { data: callLogs } = await supabase
        .from('call_logs')
        .select('*')
        .gte('created_at', todayStart.toISOString())

      // Calculate KPIs from call logs
      const logs = callLogs || []
      const totalDials = logs.length
      const connects = logs.filter(l => l.disposition?.includes('Connected') || l.disposition === 'DEMO_BOOKED')
      const demos = logs.filter(l => l.disposition === 'DEMO_BOOKED')

      setKpis({
        totalDials,
        totalConnects: connects.length,
        connectRate: totalDials > 0 ? Math.round((connects.length / totalDials) * 100) : 0,
        demosBooked: demos.length,
        demosCompleted: 0, // Would need a separate demos table with completion status
        noShowRate: 0,
        closes: 0,
        closeRate: 0,
        revenueClose: 0,
      })

      // Fetch reps with their stats
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'rep')
        .eq('is_active', true)

      if (profiles) {
        const repsWithStats = await Promise.all(
          profiles.map(async (profile) => {
            // Get rep's call logs for today
            const { data: repLogs } = await supabase
              .from('call_logs')
              .select('*')
              .eq('rep_id', profile.id)
              .gte('created_at', todayStart.toISOString())
              .order('created_at', { ascending: false })

            const repCallLogs = repLogs || []
            const lastLog = repCallLogs[0]
            const lastActivityTime = lastLog ? new Date(lastLog.created_at) : null
            const hoursSinceActivity = lastActivityTime
              ? (now.getTime() - lastActivityTime.getTime()) / (1000 * 60 * 60)
              : Infinity

            return {
              id: profile.id,
              full_name: profile.full_name || profile.email,
              email: profile.email,
              dialCount: repCallLogs.length,
              connectCount: repCallLogs.filter(l => l.disposition?.includes('Connected') || l.disposition === 'DEMO_BOOKED').length,
              demosBooked: repCallLogs.filter(l => l.disposition === 'DEMO_BOOKED').length,
              lastActivity: lastActivityTime,
              status: hoursSinceActivity < 1 ? 'active' as const : 'idle' as const,
            }
          })
        )
        setReps(repsWithStats)
      }

      // Fetch recent activity (last 10 call logs with lead info)
      const { data: activityData } = await supabase
        .from('call_logs')
        .select(`
          id,
          disposition,
          created_at,
          rep:profiles!call_logs_rep_id_fkey(full_name),
          lead:leads!call_logs_lead_id_fkey(company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (activityData) {
        setRecentActivity(
          activityData.map((item: any) => ({
            id: item.id,
            rep_name: item.rep?.full_name || 'Unknown Rep',
            disposition: item.disposition,
            company_name: item.lead?.company_name || 'Unknown Company',
            created_at: item.created_at,
          }))
        )
      }

      // Fetch total leads count
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      setTotalLeads(count || 0)

      setIsLoading(false)
    }

    fetchDashboardData()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const activeReps = reps.filter(r => r.status === 'active').length
  const dialGoal = 80
  const demoGoal = 3

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Real-time overview of sales operations</p>
        </div>
        <Badge className="bg-teal-500/20 text-teal-400">
          Today&apos;s Stats
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-gray-400">Total Dials</span>
            </div>
            <p className="text-2xl font-bold text-white">{kpis.totalDials}</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <PhoneCall className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-gray-400">Connects</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {kpis.totalConnects}
              <span className="text-sm text-gray-500 ml-1">
                ({kpis.connectRate}%)
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-gray-400">Demos Booked</span>
            </div>
            <p className="text-2xl font-bold text-white">{kpis.demosBooked}</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-teal-400" />
              <span className="text-xs text-gray-400">Active Reps</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {activeReps}
              <span className="text-sm text-gray-500 ml-1">
                /{reps.length}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <span className="text-xs text-gray-400">Total Leads</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalLeads}</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-gray-400">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(kpis.revenueClose)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Rep Performance Cards */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Rep Performance
              </CardTitle>
              <Link href="/admin/reps">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {reps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reps found</p>
                  <p className="text-sm text-gray-600 mt-1">Add reps to start tracking performance</p>
                </div>
              ) : (
                reps.map((rep) => {
                  const dialProgress = (rep.dialCount / dialGoal) * 100
                  const demoProgress = (rep.demosBooked / demoGoal) * 100
                  const isOnTrack = dialProgress >= 50 && demoProgress >= 33
                  const connectRate = rep.dialCount > 0
                    ? Math.round((rep.connectCount / rep.dialCount) * 100)
                    : 0

                  return (
                    <div
                      key={rep.id}
                      className={`rounded-lg border p-4 ${
                        rep.status === 'idle'
                          ? 'border-orange-500/30 bg-orange-500/5'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{getInitials(rep.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{rep.full_name}</p>
                            <p className="text-xs text-gray-500">
                              {rep.lastActivity
                                ? `Last active ${getRelativeTime(rep.lastActivity)}`
                                : 'No activity today'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              rep.status === 'active'
                                ? 'bg-emerald-400'
                                : 'bg-orange-400'
                            }`}
                          />
                          <Badge
                            className={
                              isOnTrack
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-orange-500/20 text-orange-400'
                            }
                          >
                            {isOnTrack ? 'On Track' : 'Behind'}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Dials</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">
                              {rep.dialCount}/{dialGoal}
                            </p>
                            <Progress value={Math.min(dialProgress, 100)} className="h-1 w-12" />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Connects</p>
                          <p className="font-medium text-white">{rep.connectCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Demos</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">
                              {rep.demosBooked}/{demoGoal}
                            </p>
                            <Progress value={Math.min(demoProgress, 100)} className="h-1 w-12" />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Connect %</p>
                          <p className="font-medium text-white">{connectRate}%</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          {/* Idle Rep Alerts */}
          {reps.filter(r => r.status === 'idle').length > 0 && (
            <Card className="border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <AlertCircle className="h-5 w-5" />
                  Idle Reps
                  <Badge variant="destructive" className="ml-auto">
                    {reps.filter(r => r.status === 'idle').length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reps.filter(r => r.status === 'idle').map((rep) => (
                  <div
                    key={rep.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <Clock className="h-4 w-4 text-orange-400 mt-0.5" />
                    <p className="text-gray-300">
                      {rep.full_name} {rep.lastActivity
                        ? `last active ${getRelativeTime(rep.lastActivity)}`
                        : 'no activity today'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        activity.disposition === 'DEMO_BOOKED'
                          ? 'bg-emerald-400'
                          : activity.disposition?.includes('Connected')
                          ? 'bg-blue-400'
                          : 'bg-yellow-400'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-gray-300">
                        <span className="font-medium text-white">
                          {activity.rep_name}
                        </span>{' '}
                        {activity.disposition?.toLowerCase().replace('_', ' ')}{' '}
                        <span className="text-white">{activity.company_name}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(activity.created_at))}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
