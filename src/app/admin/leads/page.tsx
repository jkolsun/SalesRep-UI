'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  Upload,
  Download,
  MoreHorizontal,
  User,
  Phone,
  Building2,
  UserPlus,
  Trash2,
  Edit,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  formatPhoneNumber,
  getStatusColor,
  getPriorityColor,
} from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

interface Lead {
  id: string
  company_name: string
  contact_name: string | null
  contact_title: string | null
  phone: string
  email: string | null
  email_opt_in: boolean
  status: string
  priority: string | null
  industry: string | null
  city: string | null
  state: string | null
  assigned_to: string | null
  source: string | null
  created_at: string
  assigned_rep?: {
    full_name: string | null
  }
}

interface Rep {
  id: string
  full_name: string | null
  email: string
}

export default function AdminLeadsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [reps, setReps] = useState<Rep[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [repFilter, setRepFilter] = useState<string>('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      const supabase = createClient()

      // Fetch leads with assigned rep info
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_rep:profiles!leads_assigned_to_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

      if (leadsError) {
        console.error('Error fetching leads:', leadsError)
      } else {
        setLeads(leadsData || [])
      }

      // Fetch reps for assignment dropdown
      const { data: repsData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'rep')
        .eq('is_active', true)

      setReps(repsData || [])
      setIsLoading(false)
    }

    fetchData()
  }, [user])

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.contact_name || '').toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search)

    const matchesStatus =
      statusFilter === 'all' || lead.status === statusFilter

    const matchesIndustry =
      industryFilter === 'all' || lead.industry === industryFilter

    const matchesRep =
      repFilter === 'all' ||
      (repFilter === 'unassigned' && !lead.assigned_to) ||
      lead.assigned_to === repFilter

    return matchesSearch && matchesStatus && matchesIndustry && matchesRep
  })

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((l) => l !== id))
    } else {
      setSelectedLeads([...selectedLeads, id])
    }
  }

  const handleAssignRep = async (repId: string) => {
    if (selectedLeads.length === 0) return

    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: repId, status: 'ASSIGNED' })
      .in('id', selectedLeads)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign leads',
        variant: 'destructive',
      })
      return
    }

    // Refresh leads
    const { data: updatedLeads } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_rep:profiles!leads_assigned_to_fkey(full_name)
      `)
      .order('created_at', { ascending: false })

    setLeads(updatedLeads || [])
    setSelectedLeads([])

    toast({
      title: 'Leads Assigned',
      description: `${selectedLeads.length} lead(s) have been assigned.`,
      variant: 'success',
    })
  }

  const handleDeleteLeads = async () => {
    if (selectedLeads.length === 0) return

    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', selectedLeads)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete leads',
        variant: 'destructive',
      })
      return
    }

    setLeads(leads.filter((l) => !selectedLeads.includes(l.id)))
    setSelectedLeads([])

    toast({
      title: 'Leads Deleted',
      description: `${selectedLeads.length} lead(s) have been deleted.`,
    })
  }

  // Export opted-in leads for Constant Contact
  const exportToConstantContact = () => {
    const optedInLeads = leads.filter(
      (lead) => lead.email_opt_in && lead.email && selectedLeads.includes(lead.id)
    )

    if (optedInLeads.length === 0) {
      toast({
        title: 'No Opted-In Leads',
        description: 'None of the selected leads have opted in to email marketing.',
        variant: 'destructive',
      })
      return
    }

    // Create CSV content
    const headers = ['Email', 'First Name', 'Last Name', 'Company', 'Phone', 'City', 'State']
    const rows = optedInLeads.map((lead) => {
      const [firstName, ...lastNameParts] = (lead.contact_name || '').split(' ')
      return [
        lead.email,
        firstName,
        lastNameParts.join(' '),
        lead.company_name,
        lead.phone,
        lead.city,
        lead.state,
      ].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `constant-contact-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()

    toast({
      title: 'Export Successful',
      description: `Exported ${optedInLeads.length} opted-in contacts for Constant Contact.`,
      variant: 'success',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  // Get counts for quick stats
  const optedInCount = leads.filter((l) => l.email_opt_in && l.email).length
  const unassignedCount = leads.filter((l) => !l.assigned_to).length
  const industries = Array.from(new Set(leads.map((l) => l.industry).filter(Boolean))) as string[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">All Leads</h1>
          <p className="text-sm sm:text-base text-gray-400">
            {filteredLeads.length} leads ({unassignedCount} unassigned)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-teal-500/20 text-teal-400">
            <Mail className="mr-1 h-3 w-3" />
            {optedInCount} opted-in
          </Badge>
          <Link href="/admin/leads/import">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </Link>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
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
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="CALLBACK">Callback</SelectItem>
                <SelectItem value="DEMO_SCHEDULED">Demo Scheduled</SelectItem>
                <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                <SelectItem value="BAD_DATA">Bad Data</SelectItem>
              </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry!}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={repFilter} onValueChange={setRepFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reps</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {reps.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.full_name || rep.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="border-teal-500/50 bg-teal-500/10">
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-white">
                {selectedLeads.length} lead(s) selected
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign to Rep
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {reps.map((rep) => (
                      <DropdownMenuItem
                        key={rep.id}
                        onClick={() => handleAssignRep(rep.id)}
                      >
                        {rep.full_name || rep.email}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportToConstantContact}
                  className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Export to Constant Contact
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDeleteLeads}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        {filteredLeads.length === 0 ? (
          <CardContent className="py-16">
            <div className="text-center">
              <p className="text-gray-500">No leads found</p>
              <p className="text-sm text-gray-600 mt-1">
                Import leads or add them manually to get started
              </p>
            </div>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={() => toggleSelect(lead.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{lead.company_name}</p>
                        {lead.city && lead.state && (
                          <p className="text-xs text-gray-500">
                            {lead.city}, {lead.state}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p>{lead.contact_name || '-'}</p>
                        {lead.contact_title && (
                          <p className="text-xs text-gray-500">{lead.contact_title}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.email ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {lead.email_opt_in ? (
                            <CheckCircle className="h-4 w-4 text-teal-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm truncate max-w-[160px]">{lead.email}</p>
                          {lead.email_opt_in && (
                            <p className="text-xs text-teal-400">Opted-in</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No email</span>
                    )}
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
                    {lead.priority && (
                      <Badge className={getPriorityColor(lead.priority)}>
                        {lead.priority}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.assigned_rep?.full_name ? (
                      <span className="text-white">{lead.assigned_rep.full_name}</span>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
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
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Lead
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign to Rep
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
