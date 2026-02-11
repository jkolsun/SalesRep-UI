'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Phone,
  PhoneOff,
  Voicemail,
  XCircle,
  SkipForward,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Mail,
  UserCircle,
  Sparkles,
  Loader2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { formatPhoneNumber, generateMeetingLink } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

interface Lead {
  id: string
  company_name: string
  contact_name: string | null
  contact_title: string | null
  phone: string
  email: string | null
  website: string | null
  industry: string | null
  sub_industry: string | null
  city: string | null
  state: string | null
  timezone: string | null
  notes: string | null
  priority: string | null
}

type DispositionModalType = 'connected' | 'callback' | 'demo' | null

// Research data type
type ResearchData = {
  summary: string
  recentNews: string[]
  services: string[]
  talkingPoints: string[]
} | null

export default function DialerPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [notes, setNotes] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [modalType, setModalType] = useState<DispositionModalType>(null)
  const [callbackDate, setCallbackDate] = useState('')
  const [callbackTime, setCallbackTime] = useState('')
  const [demoDate, setDemoDate] = useState('')
  const [demoTime, setDemoTime] = useState('')
  const [demoLink, setDemoLink] = useState('')
  const [isResearching, setIsResearching] = useState(false)
  const [researchData, setResearchData] = useState<ResearchData>(null)
  const [showResearch, setShowResearch] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const lead = leads[currentIndex]

  // Fetch leads assigned to this rep
  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('assigned_to', user.id)
        .in('status', ['NEW', 'CONTACTED', 'CALLBACK'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching leads:', error)
        toast({
          title: 'Error',
          description: 'Failed to load leads',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      setLeads(data || [])
      setIsLoading(false)
    }

    fetchLeads()
  }, [user])

  // Load/reset fields when lead changes
  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || '')
      setContactEmail(lead.email || '')
      setOwnerName(lead.contact_name || '')
      setEmailOptIn(false)
      setResearchData(null)
      setShowResearch(false)
    }
  }, [lead])

  // Research company
  const researchCompany = async () => {
    if (!lead) return
    setIsResearching(true)
    setShowResearch(true)

    // TODO: Replace with actual Serper API call when API key is added
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const researchResult: ResearchData = {
      summary: `${lead.company_name} is a ${(lead.industry || 'business').toLowerCase()} company based in ${lead.city || 'Unknown'}, ${lead.state || 'Unknown'}. They specialize in their industry services and have been serving the local community.`,
      recentNews: [
        'Company information available',
        'Check their website for recent updates',
      ],
      services: lead.sub_industry
        ? [lead.sub_industry, 'Related services']
        : ['Services not specified'],
      talkingPoints: [
        `Ask about their current automation tools`,
        `Mention efficiency gains for ${(lead.industry || 'their').toLowerCase()} companies`,
        lead.city ? `Reference their ${lead.city} market presence` : 'Discuss their market presence',
      ],
    }

    setResearchData(researchResult)
    setIsResearching(false)

    toast({
      title: 'Research Complete',
      description: `Found insights for ${lead.company_name}`,
    })
  }

  const copyPhone = useCallback(() => {
    if (!lead) return
    navigator.clipboard.writeText(lead.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [lead])

  const goToNext = useCallback(() => {
    if (currentIndex < leads.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, leads.length])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  // Log call disposition to database
  const logDisposition = useCallback(
    async (disposition: string, advance: boolean = true) => {
      if (!user || !lead) return

      setIsSaving(true)
      const supabase = createClient()

      // Create call log entry
      const { error: logError } = await supabase.from('call_logs').insert({
        lead_id: lead.id,
        rep_id: user.id,
        disposition,
        notes: notes || null,
        contact_email: contactEmail || null,
        contact_name: ownerName || null,
        email_opt_in: emailOptIn,
      })

      if (logError) {
        console.error('Error logging call:', logError)
        toast({
          title: 'Error',
          description: 'Failed to log call',
          variant: 'destructive',
        })
        setIsSaving(false)
        return
      }

      // Update lead status if needed
      let newStatus = lead.priority
      if (disposition === 'Not Interested') {
        newStatus = 'NOT_INTERESTED'
      } else if (disposition === 'Wrong Number / Bad Data') {
        newStatus = 'BAD_DATA'
      } else if (disposition === 'DEMO_BOOKED') {
        newStatus = 'DEMO_SCHEDULED'
      }

      if (newStatus !== lead.priority) {
        await supabase
          .from('leads')
          .update({
            status: newStatus,
            contact_name: ownerName || lead.contact_name,
            email: contactEmail || lead.email,
            notes: notes || lead.notes,
          })
          .eq('id', lead.id)
      }

      setIsSaving(false)

      toast({
        title: 'Call Logged',
        description: `${lead.company_name} - ${disposition}`,
        variant: disposition === 'DEMO_BOOKED' ? 'success' : 'default',
      })

      if (advance) {
        goToNext()
      }
    },
    [user, lead, notes, contactEmail, ownerName, emailOptIn, goToNext]
  )

  const handleNoAnswer = () => logDisposition('No Answer')
  const handleVoicemail = () => logDisposition('Voicemail Left')
  const handleBadData = () => logDisposition('Wrong Number / Bad Data')
  const handleSkip = () => goToNext()

  const handleConnected = () => {
    setModalType('connected')
  }

  const handleConnectedDisposition = (outcome: string) => {
    if (outcome === 'callback') {
      setModalType('callback')
    } else if (outcome === 'demo') {
      setDemoLink(generateMeetingLink())
      setModalType('demo')
    } else {
      logDisposition(`Connected - ${outcome}`)
      setModalType(null)
    }
  }

  const handleScheduleCallback = async () => {
    if (!callbackDate || !callbackTime || !user || !lead) return

    setIsSaving(true)
    const supabase = createClient()
    const scheduledAt = new Date(`${callbackDate}T${callbackTime}`)

    // Create callback entry
    const { error } = await supabase.from('callbacks').insert({
      lead_id: lead.id,
      rep_id: user.id,
      scheduled_at: scheduledAt.toISOString(),
      notes: notes || null,
    })

    if (error) {
      console.error('Error scheduling callback:', error)
      toast({
        title: 'Error',
        description: 'Failed to schedule callback',
        variant: 'destructive',
      })
      setIsSaving(false)
      return
    }

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: 'CALLBACK' })
      .eq('id', lead.id)

    setIsSaving(false)
    await logDisposition(`Callback Scheduled - ${callbackDate} ${callbackTime}`, true)
    setModalType(null)
    setCallbackDate('')
    setCallbackTime('')
  }

  const handleBookDemo = async () => {
    if (!demoDate || !demoTime || !user || !lead) return

    setIsSaving(true)
    const supabase = createClient()
    const scheduledAt = new Date(`${demoDate}T${demoTime}`)

    // Update lead with demo info
    const { error } = await supabase
      .from('leads')
      .update({
        status: 'DEMO_SCHEDULED',
        demo_scheduled_at: scheduledAt.toISOString(),
        demo_link: demoLink || null,
        contact_name: ownerName || lead.contact_name,
        email: contactEmail || lead.email,
      })
      .eq('id', lead.id)

    if (error) {
      console.error('Error booking demo:', error)
      toast({
        title: 'Error',
        description: 'Failed to book demo',
        variant: 'destructive',
      })
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    await logDisposition('DEMO_BOOKED', true)

    toast({
      title: 'Demo Booked!',
      description: `${lead.company_name} scheduled for ${demoDate}`,
      variant: 'success',
    })

    setModalType(null)
    setDemoDate('')
    setDemoTime('')
    setDemoLink('')
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
        case '1':
          handleConnected()
          break
        case '2':
          handleNoAnswer()
          break
        case '3':
          handleVoicemail()
          break
        case '4':
          handleBadData()
          break
        case 'n':
        case 'N':
          document.getElementById('notes-field')?.focus()
          break
        case 'ArrowRight':
          goToNext()
          break
        case 'ArrowLeft':
          goToPrev()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrev])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  // No leads state
  if (leads.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No leads to call</h3>
            <p className="text-gray-400 text-center mb-6 max-w-sm">
              You don&apos;t have any leads assigned to you yet. Contact your admin to get leads assigned.
            </p>
            <Link href="/rep/dashboard">
              <Button>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dialer</h1>
          <p className="text-gray-400">
            Lead {currentIndex + 1} of {leads.length} remaining
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrev}
            disabled={currentIndex === 0 || isSaving}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex === leads.length - 1 || isSaving}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lead Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600/20 to-teal-400/10 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {lead.priority && (
                  <Badge
                    className={
                      lead.priority === 'HOT'
                        ? 'bg-red-500/20 text-red-400'
                        : lead.priority === 'WARM'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-teal-500/20 text-teal-400'
                    }
                  >
                    {lead.priority}
                  </Badge>
                )}
                {lead.industry && <Badge variant="secondary">{lead.industry}</Badge>}
                {lead.sub_industry && <Badge variant="outline">{lead.sub_industry}</Badge>}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {lead.company_name}
              </h2>
              <p className="text-lg sm:text-xl text-gray-300">
                {lead.contact_name || 'No contact name'}{' '}
                {lead.contact_title && (
                  <span className="text-gray-500">• {lead.contact_title}</span>
                )}
              </p>
            </div>
            {/* Research Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={researchCompany}
              disabled={isResearching}
              className="shrink-0 border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
            >
              {isResearching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">Research</span>
            </Button>
          </div>
        </div>

        {/* Research Panel - Collapsible */}
        {showResearch && (
          <div className="border-b border-white/10 bg-gradient-to-r from-teal-500/5 to-transparent p-4">
            {isResearching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 text-teal-400 animate-spin mr-3" />
                <span className="text-gray-400">Researching {lead.company_name}...</span>
              </div>
            ) : researchData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    Quick Insights
                    <Badge className="bg-teal-500/20 text-teal-400 text-xs">AI</Badge>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResearch(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    Hide
                  </Button>
                </div>

                {/* Summary */}
                <p className="text-sm text-gray-300">{researchData.summary}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Services */}
                  <div className="rounded-lg bg-white/5 p-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Services</h4>
                    <ul className="space-y-1">
                      {researchData.services.map((service, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-1">
                          <span className="text-teal-400 mt-1">•</span>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recent News */}
                  <div className="rounded-lg bg-white/5 p-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Recent Activity</h4>
                    <ul className="space-y-1">
                      {researchData.recentNews.map((news, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-1">
                          <span className="text-orange-400 mt-1">•</span>
                          {news}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Talking Points */}
                  <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3">
                    <h4 className="text-xs font-semibold text-teal-400 uppercase mb-2">Talking Points</h4>
                    <ul className="space-y-1">
                      {researchData.talkingPoints.map((point, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-1">
                          <span className="text-teal-400 mt-1">→</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {lead.website && (
                  <a
                    href={`https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit {lead.website}
                  </a>
                )}
              </div>
            ) : null}
          </div>
        )}

        <CardContent className="p-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Phone className="h-5 w-5 text-teal-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-lg font-medium text-white">
                  {formatPhoneNumber(lead.phone)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyPhone}
                className="h-8 w-8"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <MapPin className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-lg font-medium text-white">
                  {lead.city && lead.state ? `${lead.city}, ${lead.state}` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <Clock className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Timezone</p>
                <p className="text-lg font-medium text-white">
                  {lead.timezone?.split('/')[1]?.replace('_', ' ') || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <Globe className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Website</p>
                <p className="text-lg font-medium text-white truncate">
                  {lead.website || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Data Collection */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Owner/Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="owner-name" className="text-gray-400 flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Owner/Decision Maker
                </Label>
                <Input
                  id="owner-name"
                  placeholder="Contact name..."
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-gray-400 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="email@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Email Opt-In */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <Checkbox
                id="email-optin"
                checked={emailOptIn}
                onCheckedChange={(checked) => setEmailOptIn(checked === true)}
              />
              <Label htmlFor="email-optin" className="text-sm text-gray-300 cursor-pointer">
                Contact agreed to receive email updates & marketing
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes-field" className="text-gray-400">
                Call Notes <span className="kbd ml-2">N</span>
              </Label>
              <Textarea
                id="notes-field"
                placeholder="Add notes about this call..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
            <Button
              size="xl"
              className="dialer-btn bg-emerald-500 hover:bg-emerald-600 min-h-[56px] sm:min-h-[64px]"
              onClick={handleConnected}
              disabled={isSaving}
            >
              <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Connected</span>
              <span className="kbd ml-auto hidden sm:inline">1</span>
            </Button>
            <Button
              size="xl"
              variant="secondary"
              className="dialer-btn min-h-[56px] sm:min-h-[64px]"
              onClick={handleNoAnswer}
              disabled={isSaving}
            >
              <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">No Answer</span>
              <span className="kbd ml-auto hidden sm:inline">2</span>
            </Button>
            <Button
              size="xl"
              variant="secondary"
              className="dialer-btn min-h-[56px] sm:min-h-[64px]"
              onClick={handleVoicemail}
              disabled={isSaving}
            >
              <Voicemail className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Voicemail</span>
              <span className="kbd ml-auto hidden sm:inline">3</span>
            </Button>
            <Button
              size="xl"
              variant="danger"
              className="dialer-btn min-h-[56px] sm:min-h-[64px]"
              onClick={handleBadData}
              disabled={isSaving}
            >
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Wrong #</span>
              <span className="kbd ml-auto hidden sm:inline">4</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={handleSkip}
            disabled={isSaving}
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip (no log)
          </Button>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Help */}
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
        <span>
          <span className="kbd mr-1">1-4</span> Quick actions
        </span>
        <span>
          <span className="kbd mr-1">N</span> Focus notes
        </span>
        <span>
          <span className="kbd mr-1">←</span>
          <span className="kbd mr-1">→</span> Navigate
        </span>
      </div>

      {/* Connected Modal */}
      <Dialog open={modalType === 'connected'} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Connected - What happened?</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              size="lg"
              variant="success"
              className="h-20"
              onClick={() => handleConnectedDisposition('demo')}
            >
              <Calendar className="mr-2 h-6 w-6" />
              Book Demo
            </Button>
            <Button
              size="lg"
              variant="warning"
              className="h-20 bg-orange-500 hover:bg-orange-600"
              onClick={() => handleConnectedDisposition('callback')}
            >
              <Clock className="mr-2 h-6 w-6" />
              Schedule Callback
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-20"
              onClick={() => handleConnectedDisposition('Send Info')}
            >
              Send Info
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20"
              onClick={() => handleConnectedDisposition('Not Interested')}
            >
              Not Interested
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Callback Modal */}
      <Dialog open={modalType === 'callback'} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Callback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={callbackDate}
                  onChange={(e) => setCallbackDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleCallback} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Schedule Callback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demo Booking Modal */}
      <Dialog open={modalType === 'demo'} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Demo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={demoDate}
                  onChange={(e) => setDemoDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={demoTime}
                  onChange={(e) => setDemoTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input
                value={demoLink}
                onChange={(e) => setDemoLink(e.target.value)}
                placeholder="Auto-generated or paste your own"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button onClick={handleBookDemo} variant="success" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Book Demo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
