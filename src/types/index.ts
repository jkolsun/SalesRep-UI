export type UserRole = 'ADMIN' | 'REP'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export type Industry = 'LEGAL' | 'RESTORATION'

export type LeadStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'CALLBACK_SCHEDULED'
  | 'DEMO_BOOKED'
  | 'DEMO_COMPLETED'
  | 'CLOSED_WON'
  | 'CLOSED_LOST'
  | 'DO_NOT_CONTACT'
  | 'BAD_DATA'

export type LeadSource = 'CSV_IMPORT' | 'MANUAL'
export type LeadPriority = 'HOT' | 'WARM' | 'COLD'

export type ActivityType = 'CALL' | 'VOICEMAIL' | 'EMAIL' | 'NOTE' | 'STATUS_CHANGE' | 'DEMO' | 'CALLBACK'

export type CallDisposition =
  | 'CONNECTED'
  | 'NO_ANSWER'
  | 'VOICEMAIL'
  | 'WRONG_NUMBER'
  | 'GATEKEEPER'
  | 'NOT_INTERESTED'
  | 'CALLBACK'
  | 'DEMO_BOOKED'

export type DemoStatus = 'SCHEDULED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED' | 'RESCHEDULED'
export type DemoOutcome = 'INTERESTED' | 'CLOSED_WON' | 'CLOSED_LOST' | 'FOLLOW_UP'

export type CommissionType = 'DEMO_BOOKED' | 'DEMO_COMPLETED' | 'CLOSE' | 'RESIDUAL' | 'BONUS'
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id: string
  companyName: string
  contactName: string
  contactTitle?: string
  phone: string
  email?: string
  website?: string
  industry: Industry
  subIndustry?: string
  employeeCount?: number
  revenueRange?: string
  city?: string
  state?: string
  timezone?: string
  status: LeadStatus
  assignedToId?: string
  assignedTo?: User
  source: LeadSource
  priority: LeadPriority
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  id: string
  leadId: string
  repId: string
  activityType: ActivityType
  callDisposition?: CallDisposition
  durationSeconds?: number
  notes?: string
  callbackDate?: Date
  createdAt: Date
  lead?: Lead
  rep?: User
}

export interface Demo {
  id: string
  leadId: string
  repId: string
  scheduledAt: Date
  status: DemoStatus
  meetingLink?: string
  notes?: string
  outcome?: DemoOutcome
  createdAt: Date
  lead?: Lead
  rep?: User
}

export interface Commission {
  id: string
  repId: string
  leadId: string
  demoId?: string
  type: CommissionType
  amount: number
  status: CommissionStatus
  period?: string
  notes?: string
  createdAt: Date
  paidAt?: Date
  rep?: User
  lead?: Lead
  demo?: Demo
}

export interface LeadList {
  id: string
  name: string
  industry: Industry
  totalLeads: number
  importedById: string
  importedBy?: User
  archived: boolean
  createdAt: Date
}

export interface RepStats {
  totalDials: number
  totalConnects: number
  connectRate: number
  demosBooked: number
  demosCompleted: number
  noShows: number
  closes: number
  closeRate: number
  pendingCommissions: number
  paidCommissions: number
  totalEarnings: number
}

export interface DailyStats {
  dials: number
  connects: number
  demosBooked: number
  callbacksDue: number
}

export interface CommissionRule {
  type: CommissionType
  amount: number
  description: string
  enabled: boolean
}

export interface Settings {
  companyName: string
  timezone: string
  dailyDialTarget: number
  dailyConnectTarget: number
  dailyDemoTarget: number
  commissionRules: CommissionRule[]
  leaderboardEnabled: boolean
  leaderboardAnonymized: boolean
}
