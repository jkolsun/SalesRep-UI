'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Phone, AlertCircle, Calendar, MapPin, Loader2 } from 'lucide-react'
import { formatPhoneNumber } from '@/lib/utils'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

interface Callback {
  id: string
  scheduled_at: string
  notes: string | null
  lead: {
    id: string
    company_name: string
    contact_name: string | null
    phone: string
    city: string | null
    state: string | null
  }
}

function CallbackCard({
  callback,
  isOverdue = false,
  isNext = false,
}: {
  callback: Callback
  isOverdue?: boolean
  isNext?: boolean
}) {
  const scheduledDate = new Date(callback.scheduled_at)

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all ${
        isOverdue
          ? 'border-red-500/50 bg-red-500/10'
          : isNext
          ? 'border-teal-500/50 bg-teal-500/10 ring-2 ring-teal-500/20'
          : 'border-white/10 bg-white/5 hover:border-teal-500/30'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex flex-col items-center min-w-[60px] ${isOverdue ? 'text-red-400' : isNext ? 'text-teal-400' : 'text-gray-400'}`}>
          <span className="text-xs font-medium uppercase">
            {isOverdue ? 'Overdue' : scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
          {isNext && <Badge className="mt-1 bg-teal-500 text-white text-[10px]">NEXT</Badge>}
        </div>

        <div className={`w-px h-full absolute left-[76px] top-0 ${isOverdue ? 'bg-red-500/30' : 'bg-white/10'}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{callback.lead?.company_name}</h3>
              <p className="text-sm text-gray-400">{callback.lead?.contact_name || '-'}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {formatPhoneNumber(callback.lead?.phone || '')}
                </span>
                {callback.lead?.city && callback.lead?.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {callback.lead.city}, {callback.lead.state}
                  </span>
                )}
              </div>
            </div>

            <Link href="/rep/dialer">
              <Button
                size="sm"
                variant={isOverdue ? 'destructive' : isNext ? 'default' : 'outline'}
                className="shrink-0"
              >
                <Phone className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Call</span>
              </Button>
            </Link>
          </div>

          {callback.notes && (
            <p className="mt-2 text-sm text-gray-400 bg-white/5 rounded-lg p-2 border-l-2 border-teal-500/50">
              {callback.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function getRelativeDay(date: Date): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function CallbacksPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [overdue, setOverdue] = useState<Callback[]>([])
  const [today, setToday] = useState<Callback[]>([])
  const [upcoming, setUpcoming] = useState<Callback[]>([])

  useEffect(() => {
    const fetchCallbacks = async () => {
      if (!user) return

      const supabase = createClient()
      const now = new Date()
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(now)
      todayEnd.setHours(23, 59, 59, 999)

      // Fetch all uncompleted callbacks
      const { data, error } = await supabase
        .from('callbacks')
        .select(`
          id,
          scheduled_at,
          notes,
          lead:leads(id, company_name, contact_name, phone, city, state)
        `)
        .eq('rep_id', user.id)
        .eq('is_completed', false)
        .order('scheduled_at', { ascending: true })

      if (error) {
        console.error('Error fetching callbacks:', error)
        setIsLoading(false)
        return
      }

      // Transform data to handle Supabase's nested relation format
      const callbacks: Callback[] = (data || []).map((item: any) => ({
        id: item.id,
        scheduled_at: item.scheduled_at,
        notes: item.notes,
        lead: Array.isArray(item.lead) ? item.lead[0] : item.lead,
      })).filter((item: Callback) => item.lead)

      // Categorize callbacks
      const overdueCallbacks: Callback[] = []
      const todayCallbacks: Callback[] = []
      const upcomingCallbacks: Callback[] = []

      callbacks.forEach(callback => {
        const scheduledDate = new Date(callback.scheduled_at)
        if (scheduledDate < now && scheduledDate < todayStart) {
          overdueCallbacks.push(callback)
        } else if (scheduledDate >= todayStart && scheduledDate <= todayEnd) {
          if (scheduledDate < now) {
            overdueCallbacks.push(callback)
          } else {
            todayCallbacks.push(callback)
          }
        } else {
          upcomingCallbacks.push(callback)
        }
      })

      setOverdue(overdueCallbacks)
      setToday(todayCallbacks)
      setUpcoming(upcomingCallbacks)
      setIsLoading(false)
    }

    fetchCallbacks()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const totalCallbacks = overdue.length + today.length + upcoming.length

  // Group upcoming by day
  const upcomingByDay = upcoming.reduce((acc, callback) => {
    const day = getRelativeDay(new Date(callback.scheduled_at))
    if (!acc[day]) acc[day] = []
    acc[day].push(callback)
    return acc
  }, {} as Record<string, Callback[]>)

  if (totalCallbacks === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Callbacks</h1>
          <p className="text-sm sm:text-base text-gray-400">No scheduled callbacks</p>
        </div>
        <Card>
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No callbacks scheduled</h3>
            <p className="text-gray-400 text-center mb-6 max-w-sm">
              When you schedule callbacks with leads, they'll appear here.
            </p>
            <Link href="/rep/dialer">
              <Button>
                <Phone className="mr-2 h-4 w-4" />
                Start Calling
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Callbacks</h1>
          <p className="text-sm sm:text-base text-gray-400">{totalCallbacks} scheduled callbacks</p>
        </div>
        <div className="flex items-center gap-2">
          {overdue.length > 0 && (
            <Badge variant="destructive" className="h-8 px-4 text-sm animate-pulse">
              <AlertCircle className="mr-2 h-4 w-4" />
              {overdue.length} Overdue
            </Badge>
          )}
          <Badge className="h-8 px-4 text-sm bg-teal-500/20 text-teal-400">
            <Clock className="mr-2 h-4 w-4" />
            {today.length} Today
          </Badge>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className={`${overdue.length > 0 ? 'border-red-500/30' : ''}`}>
          <CardContent className="pt-4 pb-4 text-center">
            <p className={`text-2xl font-bold ${overdue.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {overdue.length}
            </p>
            <p className="text-xs text-gray-500">Overdue</p>
          </CardContent>
        </Card>
        <Card className="border-teal-500/30">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-teal-400">{today.length}</p>
            <p className="text-xs text-gray-500">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{upcoming.length}</p>
            <p className="text-xs text-gray-500">Upcoming</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue - Priority Section */}
      {overdue.length > 0 && (
        <Card className="border-red-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              Overdue - Call Now!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdue.map((callback) => (
              <CallbackCard key={callback.id} callback={callback} isOverdue />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today's Callbacks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-400" />
            Today&apos;s Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {today.length > 0 ? (
            today.map((callback, idx) => (
              <CallbackCard
                key={callback.id}
                callback={callback}
                isNext={idx === 0 && overdue.length === 0}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No more callbacks for today!</p>
              <p className="text-sm text-gray-600 mt-1">Great job staying on top of your calls</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming - Grouped by Day */}
      {Object.keys(upcomingByDay).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              Upcoming Callbacks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(upcomingByDay).map(([day, dayCallbacks]) => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-400">{day}</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <Badge variant="outline" className="text-xs">{dayCallbacks.length}</Badge>
                </div>
                <div className="space-y-3">
                  {dayCallbacks.map((callback) => (
                    <CallbackCard key={callback.id} callback={callback} />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
