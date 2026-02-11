'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Phone,
  PhoneCall,
  Calendar,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { formatDateTime, getRelativeTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

interface Callback {
  id: string
  scheduled_at: string
  notes: string | null
  lead: {
    company_name: string
    contact_name: string | null
    phone: string
  }
}

interface CallLog {
  id: string
  outcome: string
  created_at: string
  notes: string | null
  lead: {
    company_name: string
  }
}

interface DailyStats {
  dials: number
  connects: number
  demos: number
}

export default function RepDashboardPage() {
  const { profile, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [callbacks, setCallbacks] = useState<Callback[]>([])
  const [recentActivity, setRecentActivity] = useState<CallLog[]>([])
  const [stats, setStats] = useState<DailyStats>({ dials: 0, connects: 0, demos: 0 })

  const dialGoal = 80
  const connectGoal = 15
  const demoGoal = 3

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      const supabase = createClient()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Fetch callbacks due today
      const { data: callbacksData } = await supabase
        .from('callbacks')
        .select(`
          id,
          scheduled_at,
          notes,
          lead:leads(company_name, contact_name, phone)
        `)
        .eq('rep_id', user.id)
        .eq('is_completed', false)
        .gte('scheduled_at', today.toISOString())
        .lte('scheduled_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5)

      // Fetch recent call logs
      const { data: activityData } = await supabase
        .from('call_logs')
        .select(`
          id,
          outcome,
          created_at,
          notes,
          lead:leads(company_name)
        `)
        .eq('rep_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch today's stats
      const { data: todayCallsData } = await supabase
        .from('call_logs')
        .select('outcome')
        .eq('rep_id', user.id)
        .gte('created_at', today.toISOString())

      const todayStats = {
        dials: todayCallsData?.length || 0,
        connects: todayCallsData?.filter(c => ['ANSWERED', 'CALLBACK_SCHEDULED', 'DEMO_BOOKED'].includes(c.outcome)).length || 0,
        demos: todayCallsData?.filter(c => c.outcome === 'DEMO_BOOKED').length || 0,
      }

      // Transform callbacks to handle Supabase's nested relation format
      const transformedCallbacks: Callback[] = (callbacksData || []).map((item: any) => ({
        id: item.id,
        scheduled_at: item.scheduled_at,
        notes: item.notes,
        lead: Array.isArray(item.lead) ? item.lead[0] : item.lead,
      })).filter((item: Callback) => item.lead)

      // Transform call logs to handle Supabase's nested relation format
      const transformedActivity: CallLog[] = (activityData || []).map((item: any) => ({
        id: item.id,
        outcome: item.outcome,
        created_at: item.created_at,
        notes: item.notes,
        lead: Array.isArray(item.lead) ? item.lead[0] : item.lead,
      })).filter((item: CallLog) => item.lead)

      setCallbacks(transformedCallbacks)
      setRecentActivity(transformedActivity)
      setStats(todayStats)
      setIsLoading(false)
    }

    fetchDashboardData()
  }, [user])

  const dialProgress = (stats.dials / dialGoal) * 100
  const connectProgress = (stats.connects / connectGoal) * 100
  const demoProgress = (stats.demos / demoGoal) * 100

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-400">Here&apos;s your sales activity for today</p>
        </div>
        <Link href="/rep/dialer" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">
            <Phone className="mr-2 h-5 w-5" />
            Start Calling
          </Button>
        </Link>
      </div>

      {/* Daily Goals */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/rep/dialer">
          <Card className="stat-card cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-teal-400" />
                  <span className="text-sm text-gray-400">Dials</span>
                  <ArrowRight className="h-3 w-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {stats.dials}
                  <span className="text-sm font-normal text-gray-500">
                    /{dialGoal}
                  </span>
                </span>
              </div>
              <Progress value={Math.min(dialProgress, 100)} className="h-2" />
              <p className="mt-2 text-xs text-gray-500">
                {dialGoal - stats.dials > 0 ? `${dialGoal - stats.dials} more to hit your goal` : 'Goal reached!'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-gray-400">Connects</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {stats.connects}
                <span className="text-sm font-normal text-gray-500">
                  /{connectGoal}
                </span>
              </span>
            </div>
            <Progress value={Math.min(connectProgress, 100)} className="h-2" />
            <p className="mt-2 text-xs text-gray-500">
              {stats.dials > 0 ? `${Math.round((stats.connects / stats.dials) * 100)}% connect rate today` : 'Make your first call'}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Demos Booked</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {stats.demos}
                <span className="text-sm font-normal text-gray-500">
                  /{demoGoal}
                </span>
              </span>
            </div>
            <Progress value={Math.min(demoProgress, 100)} className="h-2" />
            <p className="mt-2 text-xs text-gray-500">
              {demoGoal - stats.demos > 0 ? `${demoGoal - stats.demos} more to hit your goal` : 'Goal reached!'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Callbacks Due */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" />
              Callbacks Due Today
            </CardTitle>
            {callbacks.length > 0 && (
              <Badge variant="warning" className="bg-orange-500/20 text-orange-400">
                {callbacks.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {callbacks.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No callbacks scheduled for today</p>
              </div>
            ) : (
              <>
                {callbacks.map((callback) => (
                  <div
                    key={callback.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <div>
                      <p className="font-medium text-white">{callback.lead?.company_name}</p>
                      <p className="text-sm text-gray-400">{callback.lead?.contact_name || '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-orange-400">
                        {formatDateTime(new Date(callback.scheduled_at))}
                      </p>
                      <p className="text-xs text-gray-500">{callback.lead?.phone}</p>
                    </div>
                  </div>
                ))}
                <Link href="/rep/callbacks">
                  <Button variant="ghost" className="w-full mt-2">
                    View All Callbacks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No recent calls</p>
                <Link href="/rep/dialer">
                  <Button variant="outline" className="mt-4">
                    Start Calling
                  </Button>
                </Link>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.outcome === 'DEMO_BOOKED'
                        ? 'bg-emerald-400'
                        : activity.outcome === 'ANSWERED' || activity.outcome === 'CALLBACK_SCHEDULED'
                        ? 'bg-teal-400'
                        : activity.outcome === 'VOICEMAIL'
                        ? 'bg-yellow-400'
                        : 'bg-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {activity.lead?.company_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.outcome.replace(/_/g, ' ')}
                      {activity.notes && ` • ${activity.notes}`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {getRelativeTime(new Date(activity.created_at))}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
