'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface Event {
  id: string
  name: string
  description: string | null
  date: string
  duration: number
  location: string | null
  is_public: boolean
  max_attendees: number | null
}

interface GuestResponse {
  status: 'confirmed' | 'declined'
  message?: string
}

export default function BookEventPage() {
  const params = useParams()
  const eventId = params.event_id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [response, setResponse] = useState<GuestResponse | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [message, setMessage] = useState('')

  // Mock event data for development
  useEffect(() => {
    const mockEvent: Event = {
      id: eventId,
      name: 'Team Building Workshop',
      description: 'Join us for an exciting team building workshop focused on collaboration and communication.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      location: 'Conference Room A, 123 Business St',
      is_public: true,
      max_attendees: 20
    }
    
    setTimeout(() => {
      setEvent(mockEvent)
      setLoading(false)
    }, 1000)
  }, [eventId])

  const handleRSVP = async (status: 'confirmed' | 'declined') => {
    if (!guestName.trim() || !guestEmail.trim()) {
      alert('Please enter your name and email')
      return
    }

    setResponse({ status, message })
    
    // TODO: Send RSVP to backend
    console.log('RSVP:', { status, guestName, guestEmail, message })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.date)
  const endTime = new Date(eventDate.getTime() + event.duration * 60000)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MeetBase</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {response ? (
          /* RSVP Confirmation */
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                {response.status === 'confirmed' ? (
                  <CheckCircle className="h-16 w-16 text-green-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-600" />
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {response.status === 'confirmed' ? 'You\'re In!' : 'RSVP Declined'}
              </h1>
              <p className="text-muted-foreground mb-4">
                {response.status === 'confirmed' 
                  ? 'Thank you for confirming your attendance. We look forward to seeing you!'
                  : 'We\'re sorry you can\'t make it. Thank you for letting us know.'
                }
              </p>
              {response.message && (
                <p className="text-sm text-muted-foreground italic">
                  "{response.message}"
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Event Details and RSVP Form */
          <div className="space-y-6">
            {/* Event Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
              {event.description && (
                <p className="text-lg text-muted-foreground">{event.description}</p>
              )}
            </div>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{format(eventDate, 'EEEE, MMMM dd, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(eventDate, 'h:mm a')} - {format(endTime, 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Duration: {formatDuration(event.duration)}</span>
                </div>

                {event.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.max_attendees && (
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>Max {event.max_attendees} attendees</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Badge variant={event.is_public ? 'default' : 'secondary'}>
                    {event.is_public ? 'Public Event' : 'Private Event'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* RSVP Form */}
            <Card>
              <CardHeader>
                <CardTitle>RSVP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Your Name *</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Your Email *</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Message (Optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Add a message for the event organizer..."
                  />
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => handleRSVP('confirmed')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    I'll Attend
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleRSVP('declined')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Can't Attend
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
