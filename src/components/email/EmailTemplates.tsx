'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Mail, 
  Edit, 
  Eye, 
  Copy, 
  Save,
  Send,
  Calendar,
  Clock,
  MapPin,
  User
} from 'lucide-react'
import { emailClientService, EmailTemplate, EventInvitationData, RSVPReminderData, EventUpdateData } from '@/lib/email-client'
import { toast } from 'sonner'

interface EmailTemplatesProps {
  className?: string
}

export function EmailTemplates({}: EmailTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'invitation' | 'reminder' | 'update'>('invitation')
  const [previewMode, setPreviewMode] = useState(false)
  const [customSubject, setCustomSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  // Sample data for template preview
  const sampleData = {
    invitation: {
      eventName: 'Team Meeting',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      eventTime: '14:00',
      eventLocation: 'Conference Room A',
      eventDescription: 'Weekly team sync to discuss project progress and upcoming milestones.',
      organizerName: 'John Smith',
      rsvpLink: 'https://meetbase.com/book/123',
      eventPassword: undefined
    },
    reminder: {
      eventName: 'Team Meeting',
      eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      eventTime: '14:00',
      eventLocation: 'Conference Room A',
      rsvpLink: 'https://meetbase.com/book/123',
      daysUntilEvent: 2
    },
    update: {
      eventName: 'Team Meeting',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      eventTime: '15:00',
      eventLocation: 'Conference Room B',
      changes: [
        'Event time changed from 2:00 PM to 3:00 PM',
        'Location changed from Conference Room A to Conference Room B',
        'Added coffee and snacks to the agenda'
      ],
      rsvpLink: 'https://meetbase.com/book/123'
    }
  }

  const generateTemplate = (): EmailTemplate => {
    const data = sampleData[selectedTemplate]
    
    switch (selectedTemplate) {
      case 'invitation':
        return emailClientService.generateEventInvitation(data as EventInvitationData)
      case 'reminder':
        return emailClientService.generateRSVPReminder(data as RSVPReminderData)
      case 'update':
        return emailClientService.generateEventUpdate(data as EventUpdateData)
      default:
        return emailClientService.generateEventInvitation(data as EventInvitationData)
    }
  }

  const template = generateTemplate()

  const handlePreview = () => {
    setPreviewMode(!previewMode)
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(template.html)
    alert('Template copied to clipboard!')
  }

  const [sendingTest, setSendingTest] = useState(false)

  const handleSendTest = async () => {
    try {
      const to = window.prompt('Enter a test recipient email address:', 'guest@example.com')
      if (!to) return
      setSendingTest(true)

      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject: customSubject || template.subject,
          html: template.html,
          text: undefined,
        })
      })

      const data = await res.json()
      if (!res.ok) {
        console.error('Send test failed:', data)
        toast.error('Failed to send test email', {
          description: data.error || 'Unknown error',
        })
        return
      }

      // If Ethereal fallback is used, provide preview URL
      if (data.previewUrl) {
        console.log('Ethereal preview URL:', data.previewUrl)
        toast.success('Test email sent (dev preview)', {
          description: 'Opening preview in a new tab',
          action: {
            label: 'Open Preview',
            onClick: () => window.open(data.previewUrl, '_blank')
          }
        })
        window.open(data.previewUrl, '_blank')
      } else {
        toast.success('Test email sent')
      }
    } catch (error) {
      console.error('Send test error:', error)
      toast.error('Failed to send test email')
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Template Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${
            selectedTemplate === 'invitation' 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => setSelectedTemplate('invitation')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Event Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Send invitations to guests for new events
            </p>
            <Badge variant="secondary">Most Popular</Badge>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${
            selectedTemplate === 'reminder' 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => setSelectedTemplate('reminder')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">RSVP Reminder</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Send reminders to guests who haven&apos;t responded
            </p>
            <Badge variant="outline">Automated</Badge>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${
            selectedTemplate === 'update' 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => setSelectedTemplate('update')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Event Update</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Notify guests about event changes
            </p>
            <Badge variant="outline">Important</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Template Customization */}
      <Card className="relative z-10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customize Template</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" onClick={handleCopyTemplate}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleSendTest}>
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="transition-all duration-300 ease-in-out">
            {!previewMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={customSubject || template.subject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Enter custom subject..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Custom Message</Label>
                    <Textarea
                      id="message"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Add a custom message to the template..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Email Preview</h3>
                  <Badge variant="outline">HTML</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Subject:</strong> {customSubject || template.subject}</p>
                  <p><strong>To:</strong> guest@example.com</p>
                  <p><strong>From:</strong> MeetBase &lt;noreply@meetbase.com&gt;</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-muted px-4 py-2 text-sm font-medium border-b">
                  Email Content Preview
                </div>
                <div 
                  className="p-4 max-h-96 overflow-y-auto bg-white"
                  style={{ 
                    minHeight: '200px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  <div 
                    className="email-preview-content"
                    style={{
                      maxWidth: '100%',
                      overflow: 'hidden',
                      wordWrap: 'break-word'
                    }}
                    dangerouslySetInnerHTML={{ __html: template.html }}
                  />
                </div>
              </div>
            </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Template Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Event details integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Personalized greetings</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Location information</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Time zone support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">RSVP links</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded text-xs">{"{eventName}"}</code>
              <span className="text-muted-foreground ml-2">Event name</span>
            </div>
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded text-xs">{"{eventDate}"}</code>
              <span className="text-muted-foreground ml-2">Event date</span>
            </div>
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded text-xs">{"{eventTime}"}</code>
              <span className="text-muted-foreground ml-2">Event time</span>
            </div>
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded text-xs">{"{eventLocation}"}</code>
              <span className="text-muted-foreground ml-2">Event location</span>
            </div>
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded text-xs">{"{rsvpLink}"}</code>
              <span className="text-muted-foreground ml-2">RSVP link</span>
            </div>
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded text-xs">{"{organizerName}"}</code>
              <span className="text-muted-foreground ml-2">Organizer name</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
