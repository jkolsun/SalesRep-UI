'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  X,
  Users,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type Step = 'upload' | 'mapping' | 'preview' | 'complete'

const requiredFields = ['company_name', 'contact_name', 'phone']
const optionalFields = [
  'contact_title',
  'email',
  'website',
  'industry',
  'sub_industry',
  'employee_count',
  'city',
  'state',
]

const reps = [
  { id: '1', name: 'Sarah Williams' },
  { id: '2', name: 'Mike Thompson' },
  { id: '3', name: 'Emily Davis' },
  { id: '4', name: 'James Brown' },
  { id: '5', name: 'Carlos Rodriguez' },
]

export default function ImportLeadsPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvData, setCsvData] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [listName, setListName] = useState('')
  const [industry, setIndustry] = useState<string>('RESTORATION')
  const [autoAssign, setAutoAssign] = useState(false)
  const [selectedReps, setSelectedReps] = useState<string[]>([])
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [importing, setImporting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = useCallback((uploadedFile: File) => {
    if (!uploadedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      })
      return
    }

    setFile(uploadedFile)
    setListName(uploadedFile.name.replace('.csv', ''))

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
  }, [])

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = e.target.files?.[0]
      if (!uploadedFile) return
      processFile(uploadedFile)
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) {
        processFile(droppedFile)
      }
    },
    [processFile]
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
      description: `Successfully imported ${csvData.length} leads`,
      variant: 'success',
    })

    setStep('complete')
    setImporting(false)
  }

  const toggleRep = (repId: string) => {
    if (selectedReps.includes(repId)) {
      setSelectedReps(selectedReps.filter((id) => id !== repId))
    } else {
      setSelectedReps([...selectedReps, repId])
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Import Leads</h1>
        <p className="text-gray-400">Upload a CSV file to import leads in bulk</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {['Upload', 'Map Columns', 'Preview & Import'].map((label, i) => {
          const stepIndex = ['upload', 'mapping', 'preview'].indexOf(step)
          const isActive = i === stepIndex
          const isComplete = i < stepIndex || step === 'complete'

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
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
                className={`text-sm ${
                  isActive || isComplete ? 'text-white' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
              {i < 2 && (
                <ArrowRight className="h-4 w-4 text-gray-600 mx-2" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file containing your leads data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                isDragging
                  ? 'border-teal-500 bg-teal-500/10 scale-[1.02]'
                  : 'border-white/20 hover:border-teal-500/50'
              }`}
            >
              <FileSpreadsheet
                className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                  isDragging ? 'text-teal-400' : 'text-gray-500'
                }`}
              />
              <p className="text-lg text-white mb-2">
                {isDragging ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'}
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
              <div className="flex gap-2">
                {requiredFields.map((field) => (
                  <Badge key={field} variant="secondary">
                    {field.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Optional: {optionalFields.map((f) => f.replace(/_/g, ' ')).join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Mapping */}
      {step === 'mapping' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Map CSV Columns</CardTitle>
              <CardDescription>
                Match your CSV columns to the lead fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white">
                    Required Fields
                  </h3>
                  {requiredFields.map((field) => (
                    <div key={field} className="flex items-center gap-4">
                      <Label className="w-32 text-right">
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
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white">
                    Optional Fields
                  </h3>
                  {optionalFields.map((field) => (
                    <div key={field} className="flex items-center gap-4">
                      <Label className="w-32 text-right">
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
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep('preview')}
                  disabled={!isValidMapping()}
                >
                  Continue to Preview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <div className="space-y-6">
          {/* Import Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>List Name</Label>
                  <Input
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="e.g., Phoenix Restoration Companies"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESTORATION">Restoration</SelectItem>
                      <SelectItem value="LEGAL">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="skipDuplicates"
                    checked={skipDuplicates}
                    onCheckedChange={(c) => setSkipDuplicates(!!c)}
                  />
                  <Label htmlFor="skipDuplicates">
                    Skip duplicate leads (match on phone or email)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="autoAssign"
                    checked={autoAssign}
                    onCheckedChange={(c) => setAutoAssign(!!c)}
                  />
                  <Label htmlFor="autoAssign">
                    Auto-assign leads to reps (round-robin)
                  </Label>
                </div>

                {autoAssign && (
                  <div className="ml-6 space-y-2">
                    <Label className="text-gray-400">Select reps to assign to:</Label>
                    <div className="flex flex-wrap gap-2">
                      {reps.map((rep) => (
                        <Button
                          key={rep.id}
                          variant={selectedReps.includes(rep.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleRep(rep.id)}
                        >
                          {selectedReps.includes(rep.id) && (
                            <CheckCircle className="mr-2 h-3 w-3" />
                          )}
                          {rep.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Showing first {csvData.length} of {csvData.length} records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{getMappedValue(row, 'company_name')}</TableCell>
                        <TableCell>{getMappedValue(row, 'contact_name')}</TableCell>
                        <TableCell>{getMappedValue(row, 'phone')}</TableCell>
                        <TableCell>{getMappedValue(row, 'email') || '-'}</TableCell>
                        <TableCell>{getMappedValue(row, 'city') || '-'}</TableCell>
                        <TableCell>{getMappedValue(row, 'state') || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('mapping')}>
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
            <h2 className="text-2xl font-bold text-white mb-2">Import Complete!</h2>
            <p className="text-gray-400 mb-6">
              Successfully imported {csvData.length} leads to &quot;{listName}&quot;
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/admin/leads')}>
                View All Leads
              </Button>
              <Button
                onClick={() => {
                  setStep('upload')
                  setFile(null)
                  setCsvHeaders([])
                  setCsvData([])
                  setMapping({})
                }}
              >
                Import Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
