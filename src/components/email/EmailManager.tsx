'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'
import { EmailTemplates } from './EmailTemplates'
import { BulkEmailSender } from './BulkEmailSender'
import { EmailHistory } from './EmailHistory'
import { emailClientService, EmailTemplate } from '@/lib/email-client'
import { toast } from 'sonner'

interface Event {
  id: string
  name: string
  date: string
  duration: number
  location?: string
  is_public: boolean
  max_attendees?: number
  created_at: string
}

interface Guest {
  id: string
  event_id: string
  name: string
  email: string
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
  invited_at: string
  responded_at?: string
}

interface EmailManagerProps {
  events: Event[]
  guests: Guest[]
}

interface EmailStats {
  totalSent: number
  totalDelivered: number
  totalFailed: number
  deliveryRate: number
  pendingEmails: number
}

export function EmailManager({ events, guests }: EmailManagerProps) {
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  // Track per-event sending state to show feedback and prevent double-clicks
  const [sendingEventId, setSendingEventId] = useState<string | null>(null)
  const [sendingAction, setSendingAction] = useState<'invite' | 'remind' | null>(null)

  // Calculate email statistics
  useEffect(() => {
    // Test emailClientService availability
    console.log('[Email] Service check', { 
      hasGenerateInvitation: typeof emailClientService.generateEventInvitation === 'function',
      hasGenerateReminder: typeof emailClientService.generateRSVPReminder === 'function',
      hasSendBulkEmails: typeof emailClientService.sendBulkEmails === 'function'
    })
    
    const calculateStats = () => {
      // Mock data for demonstration
      const totalSent = guests.length * 2 // Assuming 2 emails per guest on average
      const totalDelivered = Math.floor(totalSent * 0.95) // 95% delivery rate
      const totalFailed = totalSent - totalDelivered
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
      const pendingEmails = guests.filter(g => g.status === 'pending').length

      setEmailStats({
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate,
        pendingEmails
      })
      setLoading(false)
    }

    calculateStats()
  }, [guests])

  const handleSendInvitations = async (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    const eventGuests = guests.filter(g => String(g.event_id) === String(eventId))
    console.log('[Email] Invites: matched guests', { eventId, count: eventGuests.length, eventGuests })
    if (eventGuests.length === 0) {
      alert('No guests found for this event')
      return
    }

    try {
      setSendingEventId(eventId)
      setSendingAction('invite')

      console.log('[Email] Starting invitation process', { eventId, eventName: event.name })
      
      // Generate invitation template
      const template = emailClientService.generateEventInvitation({
        eventName: event.name,
        eventDate: event.date,
        eventTime: new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        eventLocation: event.location || undefined,
        eventDescription: undefined,
        organizerName: 'Event Organizer',
        rsvpLink: `${window.location.origin}/book/${event.id}`,
        eventPassword: undefined
      })

      // Send emails
      const recipients = eventGuests.map(g => g.email)
      console.log('[Email] Sending to recipients', { recipients, template: template.subject })
      const result = await emailClientService.sendBulkEmails(recipients, template)
      console.log('[Email] Send result', result)
      toast.success('Invitations sent', {
        description: `Sent: ${result.sent}, Failed: ${result.failed}`,
      })
    } catch (error) {
      console.error('[Email] Invitation sending failed', error)
      toast.error('Failed to send invitations', {
        description: (error as Error).message,
      })
    } finally {
      setSendingEventId(null)
      setSendingAction(null)
    }
  }

  const handleSendReminders = async (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    const eventGuests = guests.filter(g => String(g.event_id) === String(eventId) && g.status === 'pending')
    console.log('[Email] Reminders: matched pending guests', { eventId, count: eventGuests.length, eventGuests })
    if (eventGuests.length === 0) {
      alert('No pending guests found for this event')
      return
    }

    try {
      setSendingEventId(eventId)
      setSendingAction('remind')

      console.log('[Email] Starting reminder process', { eventId, eventName: event.name })
      
      const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      // Generate reminder template
      const template = emailClientService.generateRSVPReminder({
        eventName: event.name,
        eventDate: event.date,
        eventTime: new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        eventLocation: event.location || undefined,
        rsvpLink: `${window.location.origin}/book/${event.id}`,
        daysUntilEvent
      })

      // Send emails
      const recipients = eventGuests.map(g => g.email)
      const result = await emailClientService.sendBulkEmails(recipients, template)
      toast.success('Reminders sent', {
        description: `Sent: ${result.sent}, Failed: ${result.failed}`,
      })
    } catch (error) {
      console.error('[Email] Reminder sending failed', error)
      toast.error('Failed to send reminders', {
        description: (error as Error).message,
      })
    } finally {
      setSendingEventId(null)
      setSendingAction(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Email Management</h2>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Management</h2>
          <p className="text-muted-foreground">
            Manage event invitations, reminders, and notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send All
          </Button>
        </div>
      </div>

      {/* Email Statistics */}
      {emailStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailStats.totalSent}</div>
              <p className="text-xs text-muted-foreground">
                All time emails
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{emailStats.totalDelivered}</div>
              <p className="text-xs text-muted-foreground">
                {emailStats.deliveryRate.toFixed(1)}% delivery rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{emailStats.totalFailed}</div>
              <p className="text-xs text-muted-foreground">
                Delivery failures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{emailStats.pendingEmails}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => {
              const eventGuests = guests.filter(g => String(g.event_id) === String(event.id))
              const pendingGuests = eventGuests.filter(g => g.status === 'pending').length
              
              return (
                <div
                  key={event.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors overflow-hidden ${
                    selectedEvent?.id === event.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{event.name}</h3>
                    <Badge variant="outline">
                      {eventGuests.length} guests
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {pendingGuests} pending
                    </span>
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSendInvitations(event.id)
                        }}
                        disabled={sendingEventId === event.id && sendingAction === 'invite'}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {sendingEventId === event.id && sendingAction === 'invite' ? 'Sending...' : 'Invite'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSendReminders(event.id)
                        }}
                        disabled={sendingEventId === event.id && sendingAction === 'remind'}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {sendingEventId === event.id && sendingAction === 'remind' ? 'Sending...' : 'Remind'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Email Management Tabs */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Email</TabsTrigger>
          <TabsTrigger value="history">Email History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            <EmailTemplates />
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <div className="space-y-6">
            <BulkEmailSender 
              selectedEvent={selectedEvent}
              guests={guests}
            />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-6">
            <EmailHistory />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
