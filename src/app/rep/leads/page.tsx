'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Search, Phone, User, Plus, Loader2, Users } from 'lucide-react'
import { formatPhoneNumber, getStatusColor, getPriorityColor, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

interface Lead {
  id: string
  company_name: string
  contact_name: string | null
  phone: string
  status: string
  priority: string
  industry: string | null
  city: string | null
  state: string | null
  last_contacted_at: string | null
}

export default function RepLeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching leads:', error)
      } else {
        setLeads(data || [])
      }
      setIsLoading(false)
    }

    fetchLeads()
  }, [user])

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.contact_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      lead.phone.includes(search)

    const matchesStatus =
      statusFilter === 'all' || lead.status === statusFilter

    const matchesPriority =
      priorityFilter === 'all' || lead.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Leads</h1>
          <p className="text-sm sm:text-base text-gray-400">
            {filteredLeads.length} leads assigned to you
          </p>
        </div>
        <Link href="/rep/leads/add">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search by company, contact, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="CALLBACK_SCHEDULED">Callback Scheduled</SelectItem>
                <SelectItem value="DEMO_BOOKED">Demo Booked</SelectItem>
                <SelectItem value="DO_NOT_CONTACT">Do Not Contact</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="HOT">Hot</SelectItem>
                <SelectItem value="WARM">Warm</SelectItem>
                <SelectItem value="COLD">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table or Empty State */}
      <Card>
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No leads yet</h3>
            <p className="text-gray-400 text-center mb-6 max-w-sm">
              {leads.length === 0
                ? "You don't have any leads assigned yet. Ask your admin to assign leads or add your own."
                : 'No leads match your current filters.'}
            </p>
            <Link href="/rep/leads/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Lead
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Contacted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.company_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      {lead.contact_name || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {formatPhoneNumber(lead.phone)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(lead.priority)}>
                      {lead.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.city && lead.state ? `${lead.city}, ${lead.state}` : '-'}
                  </TableCell>
                  <TableCell>
                    {lead.last_contacted_at ? formatDate(new Date(lead.last_contacted_at)) : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Link href="/rep/dialer">
                      <Button size="sm" variant="outline">
                        <Phone className="mr-2 h-3 w-3" />
                        Call
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
