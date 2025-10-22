'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Users, BarChart3, Clock, MapPin, UserPlus, CalendarDays, TrendingUp, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/MainLayout'
import { EventCard } from '@/components/events/EventCard'
import { EventModal } from '@/components/events/EventModal'
import { GuestList } from '@/components/guests/GuestList'
import { CalendarView } from '@/components/calendar/CalendarView'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { EmailManager } from '@/components/email/EmailManager'
import { useEventStore, useAuthStore } from '@/lib/store'
import { authService } from '@/lib/auth'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  name: string
  description: string | null
  date: string
  duration: number
  location: string | null
  is_public: boolean
  max_attendees: number | null
  created_at: string
  updated_at: string
  user_id?: string
  event_password?: string | null
}

export default function Dashboard() {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [activeTab, setActiveTab] = useState<'events' | 'guests' | 'calendar' | 'analytics' | 'email'>('events')
  const { events, setEvents, addEvent, updateEvent, deleteEvent, setLoading } = useEventStore()
  const { user, loading } = useAuthStore()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Mock data for demonstration
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: '1',
        name: 'Team Meeting',
        description: 'Weekly team sync meeting',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        location: 'Conference Room A',
        is_public: false,
        max_attendees: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Product Launch',
        description: 'Launch of our new product line',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 120,
        location: 'Main Auditorium',
        is_public: true,
        max_attendees: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
    setEvents(mockEvents)
  }, [setEvents])

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setIsEventModalOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const handleEventSubmit = (eventData: Event) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, eventData)
    } else {
      addEvent({ ...eventData, id: Date.now().toString() })
    }
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId)
    }
  }

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date())
  const pastEvents = events.filter(event => new Date(event.date) <= new Date())

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your events and track performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant={activeTab === 'guests' ? 'default' : 'outline'}
              onClick={() => setActiveTab('guests')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Manage Guests
            </Button>
            <Button onClick={handleCreateEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDays className="h-4 w-4 mr-2 inline" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2 inline" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="h-4 w-4 mr-2 inline" />
            Email
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'guests'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Guests
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                Next event in 2 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'events' ? (
          <>
            {/* Upcoming Events */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Upcoming Events</h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Create your first event to get started with event planning.
                    </p>
                    <Button onClick={handleCreateEvent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Recent Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.slice(0, 3).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'calendar' ? (
          /* Calendar View */
          <CalendarView
            events={events.map(event => ({
              id: event.id,
              title: event.name,
              description: event.description || undefined,
              start_time: event.date,
              end_time: new Date(new Date(event.date).getTime() + event.duration * 60 * 1000).toISOString(),
              location: event.location || undefined,
              status: event.is_public ? 'published' : 'draft',
              created_at: event.created_at,
              updated_at: event.updated_at
            }))}
            onEventCreate={(eventData) => {
              const newEvent = {
                id: Date.now().toString(),
                name: eventData.title,
                description: eventData.description || null,
                date: eventData.start_time,
                duration: Math.round((new Date(eventData.end_time).getTime() - new Date(eventData.start_time).getTime()) / (1000 * 60)),
                location: eventData.location || null,
                is_public: eventData.status === 'published',
                max_attendees: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              addEvent(newEvent)
            }}
            onEventUpdate={(id, eventData) => {
              const updatedEvent = {
                name: eventData.title || '',
                description: eventData.description || null,
                date: eventData.start_time || '',
                duration: eventData.end_time ? Math.round((new Date(eventData.end_time).getTime() - new Date(eventData.start_time || '').getTime()) / (1000 * 60)) : 60,
                location: eventData.location || null,
                is_public: eventData.status === 'published',
                updated_at: new Date().toISOString()
              }
              updateEvent(id, updatedEvent)
            }}
            onEventDelete={deleteEvent}
          />
        ) : activeTab === 'analytics' ? (
          /* Analytics Dashboard */
          <AnalyticsDashboard
            events={events}
            guests={[
              // Mock guest data for analytics
              {
                id: '1',
                event_id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                status: 'confirmed',
                invited_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                responded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                id: '2',
                event_id: '1',
                name: 'Jane Smith',
                email: 'jane@example.com',
                status: 'pending',
                invited_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                id: '3',
                event_id: '2',
                name: 'Bob Johnson',
                email: 'bob@example.com',
                status: 'confirmed',
                invited_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                responded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]}
          />
        ) : activeTab === 'email' ? (
          /* Email Management */
          <EmailManager
            events={events}
            guests={[
              // Mock guest data for email management
              {
                id: '1',
                event_id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                status: 'confirmed',
                invited_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                responded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                id: '2',
                event_id: '1',
                name: 'Jane Smith',
                email: 'jane@example.com',
                status: 'pending',
                invited_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                id: '3',
                event_id: '2',
                name: 'Bob Johnson',
                email: 'bob@example.com',
                status: 'confirmed',
                invited_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                responded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]}
          />
        ) : (
          /* Guest Management */
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Guest Management</h2>
            {selectedEvent ? (
              <GuestList 
                eventId={selectedEvent.id} 
                eventName={selectedEvent.name}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Event</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Choose an event to manage its guest list.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                    {upcomingEvents.slice(0, 2).map((event) => (
                      <Button
                        key={event.id}
                        variant="outline"
                        onClick={() => setSelectedEvent(event)}
                        className="justify-start"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setSelectedEvent(null)
        }}
        onSubmit={handleEventSubmit}
        event={selectedEvent}
        title={selectedEvent ? 'Edit Event' : 'Create Event'}
        existingEvents={events.map(event => ({
          id: event.id,
          name: event.name,
          start_time: event.date,
          end_time: new Date(new Date(event.date).getTime() + event.duration * 60 * 1000).toISOString(),
          location: event.location || undefined,
          status: event.is_public ? 'published' : 'draft'
        }))}
      />
    </MainLayout>
  )
}
