'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Upload, MoreHorizontal, Archive, Eye, BarChart3 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

// Demo data
const leadLists = [
  {
    id: '1',
    name: 'Phoenix Restoration Companies',
    industry: 'RESTORATION',
    totalLeads: 250,
    contacted: 180,
    demos: 24,
    closes: 8,
    importedBy: 'Jared',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    archived: false,
  },
  {
    id: '2',
    name: 'Atlanta Water Damage Specialists',
    industry: 'RESTORATION',
    totalLeads: 175,
    contacted: 120,
    demos: 18,
    closes: 5,
    importedBy: 'Andrew',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    archived: false,
  },
  {
    id: '3',
    name: 'Texas Personal Injury Firms',
    industry: 'LEGAL',
    totalLeads: 300,
    contacted: 45,
    demos: 6,
    closes: 2,
    importedBy: 'Jared',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    archived: false,
  },
  {
    id: '4',
    name: 'Denver Fire & Smoke Restoration',
    industry: 'RESTORATION',
    totalLeads: 100,
    contacted: 95,
    demos: 15,
    closes: 6,
    importedBy: 'Andrew',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    archived: true,
  },
]

export default function LeadListsPage() {
  const activeLists = leadLists.filter((l) => !l.archived)
  const archivedLists = leadLists.filter((l) => l.archived)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Lists</h1>
          <p className="text-gray-400">
            {activeLists.length} active lists,{' '}
            {activeLists.reduce((sum, l) => sum + l.totalLeads, 0).toLocaleString()} total leads
          </p>
        </div>
        <Link href="/admin/leads/import">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Import New List
          </Button>
        </Link>
      </div>

      {/* Active Lists */}
      <Card>
        <CardHeader>
          <CardTitle>Active Lists</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Total Leads</TableHead>
              <TableHead>Contacted %</TableHead>
              <TableHead>Demos</TableHead>
              <TableHead>Closes</TableHead>
              <TableHead>Demo Rate</TableHead>
              <TableHead>Close Rate</TableHead>
              <TableHead>Imported</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeLists.map((list) => {
              const contactedPct = Math.round((list.contacted / list.totalLeads) * 100)
              const demoRate = Math.round((list.demos / list.contacted) * 100)
              const closeRate = list.demos > 0 ? Math.round((list.closes / list.demos) * 100) : 0

              return (
                <TableRow key={list.id}>
                  <TableCell className="font-medium">{list.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{list.industry}</Badge>
                  </TableCell>
                  <TableCell>{list.totalLeads.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${contactedPct}%` }}
                        />
                      </div>
                      <span className="text-sm">{contactedPct}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{list.demos}</TableCell>
                  <TableCell>{list.closes}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        demoRate >= 15
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : demoRate >= 10
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }
                    >
                      {demoRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        closeRate >= 30
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : closeRate >= 20
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }
                    >
                      {closeRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-white">{formatDate(list.createdAt)}</p>
                      <p className="text-xs text-gray-500">by {list.importedBy}</p>
                    </div>
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
                          View Leads
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Stats
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive List
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Archived Lists */}
      {archivedLists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-400">
              <Archive className="h-5 w-5" />
              Archived Lists
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Total Leads</TableHead>
                <TableHead>Demos</TableHead>
                <TableHead>Closes</TableHead>
                <TableHead>Imported</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archivedLists.map((list) => (
                <TableRow key={list.id} className="opacity-60">
                  <TableCell className="font-medium">{list.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{list.industry}</Badge>
                  </TableCell>
                  <TableCell>{list.totalLeads.toLocaleString()}</TableCell>
                  <TableCell>{list.demos}</TableCell>
                  <TableCell>{list.closes}</TableCell>
                  <TableCell>{formatDate(list.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
