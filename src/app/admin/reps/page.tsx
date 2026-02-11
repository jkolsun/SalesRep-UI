'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  UserPlus,
  MoreHorizontal,
  Eye,
  Mail,
  TrendingUp,
  Calendar,
  Loader2,
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

interface Rep {
  id: string
  full_name: string
  email: string
  created_at: string
  totalDials: number
  totalConnects: number
  demosBooked: number
  leadsAssigned: number
}

export default function RepsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [reps, setReps] = useState<Rep[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newRepName, setNewRepName] = useState('')
  const [newRepEmail, setNewRepEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchReps = async () => {
      if (!user) return

      const supabase = createClient()

      // Fetch all rep profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'rep')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reps:', error)
        setIsLoading(false)
        return
      }

      // Get stats for each rep
      const repsWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get call logs count
          const { count: dialCount } = await supabase
            .from('call_logs')
            .select('*', { count: 'exact', head: true })
            .eq('rep_id', profile.id)

          // Get connects count
          const { data: connectLogs } = await supabase
            .from('call_logs')
            .select('disposition')
            .eq('rep_id', profile.id)

          const connectCount = (connectLogs || []).filter(
            (l) => l.disposition?.includes('Connected') || l.disposition === 'DEMO_BOOKED'
          ).length

          const demosBooked = (connectLogs || []).filter(
            (l) => l.disposition === 'DEMO_BOOKED'
          ).length

          // Get leads assigned count
          const { count: leadsCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', profile.id)

          return {
            id: profile.id,
            full_name: profile.full_name || profile.email,
            email: profile.email,
            created_at: profile.created_at,
            totalDials: dialCount || 0,
            totalConnects: connectCount,
            demosBooked,
            leadsAssigned: leadsCount || 0,
          }
        })
      )

      setReps(repsWithStats)
      setIsLoading(false)
    }

    fetchReps()
  }, [user])

  // All reps are considered active (no is_active column in database)
  const activeReps = reps

  const handleAddRep = async () => {
    if (!newRepName || !newRepEmail) return

    setIsSaving(true)
    const supabase = createClient()

    // Create invitation (in production, this would send an email)
    // For now, we'll just show a success message
    toast({
      title: 'Invite Sent',
      description: `Invitation email would be sent to ${newRepEmail}. For now, the user can sign up at /signup.`,
      variant: 'success',
    })

    setShowAddDialog(false)
    setNewRepName('')
    setNewRepEmail('')
    setIsSaving(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Reps</h1>
          <p className="text-gray-400">
            {reps.length} total reps
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Rep
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Total Dials (All Reps)</p>
            <p className="text-3xl font-bold text-white">
              {reps.reduce((sum, r) => sum + r.totalDials, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Total Connects</p>
            <p className="text-3xl font-bold text-white">
              {reps.reduce((sum, r) => sum + r.totalConnects, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Total Demos Booked</p>
            <p className="text-3xl font-bold text-white">
              {reps.reduce((sum, r) => sum + r.demosBooked, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Total Leads Assigned</p>
            <p className="text-3xl font-bold text-teal-400">
              {reps.reduce((sum, r) => sum + r.leadsAssigned, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Reps Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Reps</CardTitle>
        </CardHeader>
        {activeReps.length === 0 ? (
          <CardContent>
            <p className="text-gray-500 text-center py-8">No active reps found</p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rep</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Dials</TableHead>
                <TableHead>Connect %</TableHead>
                <TableHead>Demos</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeReps.map((rep) => {
                const connectRate =
                  rep.totalDials > 0
                    ? Math.round((rep.totalConnects / rep.totalDials) * 100)
                    : 0

                return (
                  <TableRow key={rep.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(rep.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{rep.full_name}</p>
                          <Badge className="bg-emerald-500/20 text-emerald-400">
                            ACTIVE
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-500" />
                        {rep.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formatDate(new Date(rep.created_at))}
                      </div>
                    </TableCell>
                    <TableCell>{rep.leadsAssigned}</TableCell>
                    <TableCell>{rep.totalDials.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          connectRate >= 15
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }
                      >
                        {connectRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-white">{rep.demosBooked}</p>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            View Stats
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>


      {/* Add Rep Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Sales Rep</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={newRepName}
                onChange={(e) => setNewRepName(e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newRepEmail}
                onChange={(e) => setNewRepEmail(e.target.value)}
                placeholder="john@brightautomations.org"
              />
            </div>
            <p className="text-sm text-gray-500">
              The user will need to sign up at the signup page with this email address.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRep} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
