'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send, 
  Users, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { emailClientService, EmailTemplate } from '@/lib/email-client'

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

interface BulkEmailSenderProps {
  selectedEvent: Event | null
  guests: Guest[]
}

interface EmailCampaign {
  id: string
  name: string
  template: 'invitation' | 'reminder' | 'update'
  recipients: string[]
  status: 'draft' | 'sending' | 'sent' | 'failed'
  sentAt?: string
  results?: {
    sent: number
    failed: number
  }
}

export function BulkEmailSender({ selectedEvent, guests }: BulkEmailSenderProps) {
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [emailType, setEmailType] = useState<'invitation' | 'reminder' | 'update'>('invitation')
  const [customSubject, setCustomSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])

  // Filter guests based on selected event
  const eventGuests = selectedEvent 
    ? guests.filter(g => g.event_id === selectedEvent.id)
    : guests

  // Auto-select all guests when event changes
  useEffect(() => {
    if (selectedEvent) {
      setSelectedGuests(eventGuests.map(g => g.id))
    }
  }, [selectedEvent, eventGuests])

  const handleGuestSelection = (guestId: string, checked: boolean) => {
    if (checked) {
      setSelectedGuests([...selectedGuests, guestId])
    } else {
      setSelectedGuests(selectedGuests.filter(id => id !== guestId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuests(eventGuests.map(g => g.id))
    } else {
      setSelectedGuests([])
    }
  }

  const handleSendBulkEmail = async () => {
    if (!selectedEvent || selectedGuests.length === 0) {
      alert('Please select an event and guests')
      return
    }

    setIsSending(true)

    try {
      const selectedGuestEmails = eventGuests
        .filter(g => selectedGuests.includes(g.id))
        .map(g => g.email)

      // Generate email template based on type
      let template: EmailTemplate
      
      switch (emailType) {
        case 'invitation':
          template = emailClientService.generateEventInvitation({
            eventName: selectedEvent.name,
            eventDate: selectedEvent.date,
            eventTime: new Date(selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            eventLocation: selectedEvent.location || undefined,
            eventDescription: undefined,
            organizerName: 'Event Organizer',
            rsvpLink: `${window.location.origin}/book/${selectedEvent.id}`,
            eventPassword: undefined
          })
          break
        case 'reminder':
          const daysUntilEvent = Math.ceil((new Date(selectedEvent.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          template = emailClientService.generateRSVPReminder({
            eventName: selectedEvent.name,
            eventDate: selectedEvent.date,
            eventTime: new Date(selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            eventLocation: selectedEvent.location || undefined,
            rsvpLink: `${window.location.origin}/book/${selectedEvent.id}`,
            daysUntilEvent
          })
          break
        case 'update':
          template = emailClientService.generateEventUpdate({
            eventName: selectedEvent.name,
            eventDate: selectedEvent.date,
            eventTime: new Date(selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            eventLocation: selectedEvent.location || undefined,
            changes: ['Event details have been updated'],
            rsvpLink: `${window.location.origin}/book/${selectedEvent.id}`
          })
          break
      }

      // Send bulk emails
      const result = await emailClientService.sendBulkEmails(selectedGuestEmails, template)

      // Create campaign record
      const campaign: EmailCampaign = {
        id: Date.now().toString(),
        name: `${emailType} for ${selectedEvent.name}`,
        template: emailType,
        recipients: selectedGuestEmails,
        status: 'sent',
        sentAt: new Date().toISOString(),
        results: result
      }

      setCampaigns([campaign, ...campaigns])
      
      alert(`Bulk email sent! ${result.sent} delivered, ${result.failed} failed`)
      
    } catch (error) {
      console.error('Failed to send bulk email:', error)
      alert('Failed to send bulk email. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'sending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'sending':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                emailType === 'invitation' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setEmailType('invitation')}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium">Invitation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Send event invitations
              </p>
            </div>

            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                emailType === 'reminder' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setEmailType('reminder')}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Reminder</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Send RSVP reminders
              </p>
            </div>

            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                emailType === 'update' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setEmailType('update')}
            >
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Update</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Send event updates
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Custom Subject</Label>
              <Input
                id="subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter custom subject (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add custom message (optional)"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Recipients</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedGuests.length} of {eventGuests.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(selectedGuests.length !== eventGuests.length)}
              >
                {selectedGuests.length === eventGuests.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedEvent ? (
            <div className="space-y-3">
              {eventGuests.map(guest => (
                <div key={guest.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedGuests.includes(guest.id)}
                    onCheckedChange={(checked) => handleGuestSelection(guest.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{guest.name}</p>
                        <p className="text-sm text-muted-foreground">{guest.email}</p>
                      </div>
                      <Badge 
                        variant={
                          guest.status === 'confirmed' ? 'default' :
                          guest.status === 'pending' ? 'secondary' :
                          guest.status === 'declined' ? 'destructive' : 'outline'
                        }
                      >
                        {guest.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select an event to see guests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Ready to Send</h3>
              <p className="text-sm text-muted-foreground">
                {selectedGuests.length} recipients selected
              </p>
            </div>
            <Button
              onClick={handleSendBulkEmail}
              disabled={!selectedEvent || selectedGuests.length === 0 || isSending}
              className="min-w-[120px]"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign History */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaigns.slice(0, 5).map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(campaign.status)}
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.recipients.length} recipients
                        {campaign.sentAt && ` • ${new Date(campaign.sentAt).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    {campaign.results && (
                      <span className="text-sm text-muted-foreground">
                        {campaign.results.sent} sent, {campaign.results.failed} failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
