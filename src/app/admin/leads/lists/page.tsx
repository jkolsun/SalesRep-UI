'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'

export default function LeadListsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Lists</h1>
          <p className="text-gray-400">Manage your imported lead lists</p>
        </div>
        <Link href="/admin/leads/import">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Import New List
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-16 text-center">
          <FileSpreadsheet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Lead Lists Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Import your first lead list to start tracking performance by source.
            You can import CSV files with company and contact information.
          </p>
          <Link href="/admin/leads/import">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Import Your First List
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
