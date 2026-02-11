import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function generateMeetingLink(): string {
  const id = Math.random().toString(36).substring(2, 10)
  return `https://meet.brightautomations.org/${id}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-blue-500/20 text-blue-400',
    ASSIGNED: 'bg-purple-500/20 text-purple-400',
    CONTACTED: 'bg-yellow-500/20 text-yellow-400',
    CALLBACK_SCHEDULED: 'bg-orange-500/20 text-orange-400',
    DEMO_BOOKED: 'bg-emerald-500/20 text-emerald-400',
    DEMO_COMPLETED: 'bg-teal-500/20 text-teal-400',
    CLOSED_WON: 'bg-green-500/20 text-green-400',
    CLOSED_LOST: 'bg-red-500/20 text-red-400',
    DO_NOT_CONTACT: 'bg-gray-500/20 text-gray-400',
    BAD_DATA: 'bg-gray-500/20 text-gray-400',
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    HOT: 'bg-red-500/20 text-red-400',
    WARM: 'bg-orange-500/20 text-orange-400',
    COLD: 'bg-blue-500/20 text-blue-400',
  }
  return colors[priority] || 'bg-gray-500/20 text-gray-400'
}
