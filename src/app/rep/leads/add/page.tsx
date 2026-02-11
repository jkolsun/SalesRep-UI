'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
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
  Upload,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Plus,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

type Step = 'upload' | 'mapping' | 'preview' | 'complete'

const requiredFields = ['company_name', 'contact_name', 'phone']
const optionalFields = [
  'contact_title',
  'email',
  'website',
  'city',
  'state',
  'notes',
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

export default function AddLeadsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual')

  // Manual form state
  const [manualForm, setManualForm] = useState({
    companyName: '',
    contactName: '',
    contactTitle: '',
    phone: '',
    email: '',
    website: '',
    city: '',
    state: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // CSV import state
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvData, setCsvData] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)

  // Manual form handlers
  const handleManualChange = (field: string, value: string) => {
    setManualForm({ ...manualForm, [field]: value })
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualForm.companyName || !manualForm.contactName || !manualForm.phone) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in company name, contact name, and phone number.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: 'Lead Added!',
      description: `${manualForm.companyName} has been added to your leads.`,
      variant: 'success',
    })

    setIsSubmitting(false)
    router.push('/rep/leads')
  }

  // CSV import handlers
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = e.target.files?.[0]
      if (!uploadedFile) return

      if (!uploadedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV file',
          variant: 'destructive',
        })
        return
      }

      setFile(uploadedFile)

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lines = text.split('\n').filter((line) => line.trim())
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
        const data = lines.slice(1, 11).map((line) => line.split(',').map((c) => c.trim()))

        setCsvHeaders(headers)
        setCsvData(data)

        // Auto-map matching headers
        const autoMapping: Record<string, string> = {}
        headers.forEach((header) => {
          const normalized = header.replace(/[^a-z]/g, '')
          if (normalized.includes('company') || normalized.includes('business')) {
            autoMapping.company_name = header
          } else if (normalized.includes('contact') && normalized.includes('name')) {
            autoMapping.contact_name = header
          } else if (normalized.includes('firstname') || normalized === 'first') {
            autoMapping.contact_name = header
          } else if (normalized.includes('phone') || normalized.includes('tel')) {
            autoMapping.phone = header
          } else if (normalized.includes('email')) {
            autoMapping.email = header
          } else if (normalized.includes('title') || normalized.includes('position')) {
            autoMapping.contact_title = header
          } else if (normalized.includes('website') || normalized.includes('url')) {
            autoMapping.website = header
          } else if (normalized.includes('city')) {
            autoMapping.city = header
          } else if (normalized.includes('state')) {
            autoMapping.state = header
          }
        })

        setMapping(autoMapping)
        setStep('mapping')
      }
      reader.readAsText(uploadedFile)
    },
    []
  )

  const handleMappingChange = (field: string, header: string) => {
    if (header === 'none') {
      const newMapping = { ...mapping }
      delete newMapping[field]
      setMapping(newMapping)
    } else {
      setMapping({ ...mapping, [field]: header })
    }
  }

  const isValidMapping = () => {
    return requiredFields.every((field) => mapping[field])
  }

  const getMappedValue = (row: string[], field: string) => {
    const header = mapping[field]
    if (!header) return ''
    const index = csvHeaders.indexOf(header)
    return index >= 0 ? row[index] : ''
  }

  const handleImport = async () => {
    setImporting(true)

    // Simulate import
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: 'Import Complete',
      description: `Successfully imported ${csvData.length} leads to your list`,
      variant: 'success',
    })

    setStep('complete')
    setImporting(false)
  }

  const resetCsvImport = () => {
    setStep('upload')
    setFile(null)
    setCsvHeaders([])
    setCsvData([])
    setMapping({})
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Add Leads</h1>
          <p className="text-sm sm:text-base text-gray-400">Add new leads to your list</p>
        </div>
        <Link href="/rep/leads">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'csv')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="gap-2">
            <Plus className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="csv" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            CSV Import
          </TabsTrigger>
        </TabsList>

        {/* Manual Entry Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-teal-400" />
                Add Lead Manually
              </CardTitle>
              <CardDescription>
                Enter the lead information below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-6">
                {/* Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <Building2 className="h-4 w-4" />
                    Company Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="companyName">
                        Company Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        value={manualForm.companyName}
                        onChange={(e) => handleManualChange('companyName', e.target.value)}
                        placeholder="e.g., ServiceMaster Restore"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={manualForm.website}
                        onChange={(e) => handleManualChange('website', e.target.value)}
                        placeholder="e.g., www.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={manualForm.city}
                        onChange={(e) => handleManualChange('city', e.target.value)}
                        placeholder="e.g., Phoenix"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={manualForm.state}
                        onValueChange={(v) => handleManualChange('state', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <User className="h-4 w-4" />
                    Contact Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">
                        Contact Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="contactName"
                        value={manualForm.contactName}
                        onChange={(e) => handleManualChange('contactName', e.target.value)}
                        placeholder="e.g., John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactTitle">Title</Label>
                      <Input
                        id="contactTitle"
                        value={manualForm.contactTitle}
                        onChange={(e) => handleManualChange('contactTitle', e.target.value)}
                        placeholder="e.g., Owner, Manager"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          id="phone"
                          type="tel"
                          value={manualForm.phone}
                          onChange={(e) => handleManualChange('phone', e.target.value)}
                          placeholder="(555) 123-4567"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          value={manualForm.email}
                          onChange={(e) => handleManualChange('email', e.target.value)}
                          placeholder="john@example.com"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={manualForm.notes}
                    onChange={(e) => handleManualChange('notes', e.target.value)}
                    placeholder="Add any relevant notes about this lead..."
                    rows={3}
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4">
                  <Link href="/rep/leads">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Adding Lead...</>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lead
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV Import Tab */}
        <TabsContent value="csv">
          {/* Progress Steps */}
          {step !== 'complete' && (
            <div className="flex items-center gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2">
              {['Upload', 'Map Columns', 'Import'].map((label, i) => {
                const stepIndex = ['upload', 'mapping', 'preview'].indexOf(step)
                const isActive = i === stepIndex
                const isComplete = i < stepIndex

                return (
                  <div key={label} className="flex items-center gap-2 shrink-0">
                    <div
                      className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-medium ${
                        isComplete
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-teal-500 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {isComplete ? <CheckCircle className="h-4 w-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs sm:text-sm ${
                        isActive || isComplete ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {label}
                    </span>
                    {i < 2 && (
                      <ArrowRight className="h-4 w-4 text-gray-600 mx-1 sm:mx-2" />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-teal-400" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Select a CSV file containing your leads data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 sm:p-12 text-center hover:border-teal-500/50 transition-colors">
                  <FileSpreadsheet className="h-10 w-10 sm:h-12 sm:w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-base sm:text-lg text-white mb-2">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Browse Files
                      </span>
                    </Button>
                  </label>
                </div>

                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-white">Required columns:</p>
                  <div className="flex flex-wrap gap-2">
                    {requiredFields.map((field) => (
                      <Badge key={field} variant="secondary">
                        {field.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-4">
                    Optional: {optionalFields.map((f) => f.replace(/_/g, ' ')).join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Mapping */}
          {step === 'mapping' && (
            <Card>
              <CardHeader>
                <CardTitle>Map CSV Columns</CardTitle>
                <CardDescription>
                  Match your CSV columns to the lead fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white">
                    Required Fields
                  </h3>
                  {requiredFields.map((field) => (
                    <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label className="sm:w-32 sm:text-right text-sm">
                        {field.replace(/_/g, ' ')}
                        <span className="text-red-400 ml-1">*</span>
                      </Label>
                      <Select
                        value={mapping[field] || 'none'}
                        onValueChange={(v) => handleMappingChange(field, v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Not mapped --</SelectItem>
                          {csvHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mapping[field] ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white">
                    Optional Fields
                  </h3>
                  {optionalFields.map((field) => (
                    <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label className="sm:w-32 sm:text-right text-sm">
                        {field.replace(/_/g, ' ')}
                      </Label>
                      <Select
                        value={mapping[field] || 'none'}
                        onValueChange={(v) => handleMappingChange(field, v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Not mapped --</SelectItem>
                          {csvHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mapping[field] && (
                        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('preview')}
                    disabled={!isValidMapping()}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview & Import</CardTitle>
                  <CardDescription>
                    Review your data before importing ({csvData.length} leads)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead className="hidden sm:table-cell">Email</TableHead>
                          <TableHead className="hidden sm:table-cell">Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {getMappedValue(row, 'company_name')}
                            </TableCell>
                            <TableCell>{getMappedValue(row, 'contact_name')}</TableCell>
                            <TableCell>{getMappedValue(row, 'phone')}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {getMappedValue(row, 'email') || '-'}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {getMappedValue(row, 'city') && getMappedValue(row, 'state')
                                ? `${getMappedValue(row, 'city')}, ${getMappedValue(row, 'state')}`
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <>Importing...</>
                  ) : (
                    <>
                      Import {csvData.length} Leads
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Import Complete!
                </h2>
                <p className="text-gray-400 mb-6">
                  Successfully imported {csvData.length} leads to your list
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link href="/rep/leads">
                    <Button variant="outline">View My Leads</Button>
                  </Link>
                  <Button onClick={resetCsvImport}>
                    Import Another File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
