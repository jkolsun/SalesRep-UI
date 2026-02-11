'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Check,
  X,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

// Demo data
const commissions = [
  {
    id: '1',
    rep: 'Sarah Williams',
    lead: 'ServiceMaster Restore',
    type: 'DEMO_BOOKED',
    amount: 150,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    rep: 'Mike Thompson',
    lead: 'PuroClean of Atlanta',
    type: 'DEMO_BOOKED',
    amount: 150,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    rep: 'Sarah Williams',
    lead: 'Rainbow International',
    type: 'CLOSE',
    amount: 500,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    rep: 'Emily Davis',
    lead: 'SERVPRO of Downtown',
    type: 'DEMO_BOOKED',
    amount: 150,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    rep: 'James Brown',
    lead: 'Paul Davis Restoration',
    type: 'DEMO_COMPLETED',
    amount: 50,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    rep: 'Sarah Williams',
    lead: 'Belfor Property',
    type: 'DEMO_BOOKED',
    amount: 150,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '7',
    rep: 'Mike Thompson',
    lead: 'ATI Restoration',
    type: 'CLOSE',
    amount: 500,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: '8',
    rep: 'Emily Davis',
    lead: 'ServiceMaster Restore',
    type: 'DEMO_BOOKED',
    amount: 150,
    status: 'PAID',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: '9',
    rep: 'Sarah Williams',
    lead: 'Rainbow International',
    type: 'CLOSE',
    amount: 500,
    status: 'PAID',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    paidAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: '10',
    rep: 'Mike Thompson',
    lead: 'PuroClean of Atlanta',
    type: 'DEMO_BOOKED',
    amount: 150,
    status: 'REJECTED',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    notes: 'Demo was a no-show',
  },
]

export default function CommissionsPage() {
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('pending')

  const pending = commissions.filter((c) => c.status === 'PENDING')
  const approved = commissions.filter((c) => c.status === 'APPROVED')
  const paid = commissions.filter((c) => c.status === 'PAID')
  const rejected = commissions.filter((c) => c.status === 'REJECTED')

  const pendingTotal = pending.reduce((sum, c) => sum + c.amount, 0)
  const approvedTotal = approved.reduce((sum, c) => sum + c.amount, 0)
  const paidTotal = paid.reduce((sum, c) => sum + c.amount, 0)

  const toggleSelect = (id: string) => {
    if (selectedCommissions.includes(id)) {
      setSelectedCommissions(selectedCommissions.filter((c) => c !== id))
    } else {
      setSelectedCommissions([...selectedCommissions, id])
    }
  }

  const toggleSelectAll = (items: typeof commissions) => {
    const ids = items.map((c) => c.id)
    if (ids.every((id) => selectedCommissions.includes(id))) {
      setSelectedCommissions(selectedCommissions.filter((c) => !ids.includes(c)))
    } else {
      setSelectedCommissions(Array.from(new Set([...selectedCommissions, ...ids])))
    }
  }

  const handleApprove = () => {
    toast({
      title: 'Commissions Approved',
      description: `${selectedCommissions.length} commission(s) approved`,
      variant: 'success',
    })
    setSelectedCommissions([])
  }

  const handleReject = () => {
    toast({
      title: 'Commissions Rejected',
      description: `${selectedCommissions.length} commission(s) rejected`,
      variant: 'destructive',
    })
    setSelectedCommissions([])
  }

  const handleMarkPaid = () => {
    toast({
      title: 'Marked as Paid',
      description: `${selectedCommissions.length} commission(s) marked as paid`,
      variant: 'success',
    })
    setSelectedCommissions([])
  }

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="stat-card border-orange-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-orange-400" />
              <span className="text-sm text-gray-400">Pending Approval</span>
            </div>
            <p className="text-3xl font-bold text-orange-400">
              {formatCurrency(pendingTotal)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{pending.length} commission(s)</p>
          </CardContent>
        </Card>

        <Card className="stat-card border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Approved (Ready to Pay)</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {formatCurrency(approvedTotal)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{approved.length} commission(s)</p>
          </CardContent>
        </Card>

        <Card className="stat-card border-emerald-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-gray-400">Paid This Month</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {formatCurrency(paidTotal)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{paid.length} commission(s)</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-gray-400">Rejected</span>
            </div>
            <p className="text-3xl font-bold text-white">{rejected.length}</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedCommissions.length > 0 && (
        <Card className="border-blue-500/50 bg-blue-500/10">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white">
                {selectedCommissions.length} commission(s) selected
              </p>
              <div className="flex items-center gap-2">
                {activeTab === 'pending' && (
                  <>
                    <Button size="sm" variant="success" onClick={handleApprove}>
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleReject}>
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                {activeTab === 'approved' && (
                  <Button size="sm" onClick={handleMarkPaid}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commissions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="destructive" className="ml-2">
              {pending.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <Badge variant="secondary" className="ml-2">
              {approved.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <CommissionTable
            commissions={pending}
            selectedCommissions={selectedCommissions}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={() => toggleSelectAll(pending)}
            showCheckbox
          />
        </TabsContent>

        <TabsContent value="approved">
          <CommissionTable
            commissions={approved}
            selectedCommissions={selectedCommissions}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={() => toggleSelectAll(approved)}
            showCheckbox
          />
        </TabsContent>

        <TabsContent value="paid">
          <CommissionTable commissions={paid} showPaidDate />
        </TabsContent>

        <TabsContent value="rejected">
          <CommissionTable commissions={rejected} showNotes />
        </TabsContent>
      </Tabs>
    </div>
  )
}

type Commission = {
  id: string
  rep: string
  lead: string
  type: string
  amount: number
  status: string
  createdAt: Date
  paidAt?: Date
  notes?: string
}

function CommissionTable({
  commissions,
  selectedCommissions = [],
  onToggleSelect,
  onToggleSelectAll,
  showCheckbox = false,
  showPaidDate = false,
  showNotes = false,
}: {
  commissions: Commission[]
  selectedCommissions?: string[]
  onToggleSelect?: (id: string) => void
  onToggleSelectAll?: () => void
  showCheckbox?: boolean
  showPaidDate?: boolean
  showNotes?: boolean
}) {
  if (commissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          No commissions in this category
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckbox && (
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    commissions.every((c) => selectedCommissions.includes(c.id)) &&
                    commissions.length > 0
                  }
                  onCheckedChange={onToggleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Rep</TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Created</TableHead>
            {showPaidDate && <TableHead>Paid</TableHead>}
            {showNotes && <TableHead>Notes</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {commissions.map((commission) => (
            <TableRow key={commission.id}>
              {showCheckbox && (
                <TableCell>
                  <Checkbox
                    checked={selectedCommissions.includes(commission.id)}
                    onCheckedChange={() => onToggleSelect?.(commission.id)}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">{commission.rep}</TableCell>
              <TableCell>{commission.lead}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {commission.type.replace(/_/g, ' ')}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-white">
                {formatCurrency(commission.amount)}
              </TableCell>
              <TableCell className="text-gray-400">
                {formatDate(commission.createdAt)}
              </TableCell>
              {showPaidDate && (
                <TableCell className="text-emerald-400">
                  {commission.paidAt ? formatDate(commission.paidAt) : '-'}
                </TableCell>
              )}
              {showNotes && (
                <TableCell className="text-gray-500">
                  {commission.notes || '-'}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
