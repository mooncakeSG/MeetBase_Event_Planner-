'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, MapPin, Users, Filter, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
import { EventCard } from '@/components/events/EventCard'
import { EventModal } from '@/components/events/EventModal'
import { useEventStore, useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface Event {
  id?: string
  name: string
  description?: string | null
  date: string
  duration: number
  location?: string | null
  is_public: boolean
  max_attendees?: number | null
  created_at?: string
  updated_at?: string
  user_id?: string
  event_password?: string | null
}

export default function EventsPage() {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past' | 'draft' | 'published'>('all')
  const { events, setEvents, addEvent, updateEvent, deleteEvent } = useEventStore()
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
      },
      {
        id: '3',
        name: 'Client Presentation',
        description: 'Quarterly business review with key clients',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 90,
        location: 'Virtual Meeting',
        is_public: false,
        max_attendees: 25,
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
    if (selectedEvent && selectedEvent.id) {
      updateEvent(selectedEvent.id, eventData)
    } else {
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      addEvent(newEvent)
    }
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId)
    }
  }

  // Filter and search events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const now = new Date()
    const eventDate = new Date(event.date)
    
    let matchesFilter = true
    switch (filterStatus) {
      case 'upcoming':
        matchesFilter = eventDate > now
        break
      case 'past':
        matchesFilter = eventDate <= now
        break
      case 'draft':
        matchesFilter = !event.is_public
        break
      case 'published':
        matchesFilter = event.is_public
        break
      default:
        matchesFilter = true
    }
    
    return matchesSearch && matchesFilter
  })

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date())
  const pastEvents = events.filter(event => new Date(event.date) <= new Date())
  const publishedEvents = events.filter(event => event.is_public)
  const draftEvents = events.filter(event => !event.is_public)

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground">
              Manage and organize your events
            </p>
          </div>
          <Button onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{publishedEvents.length}</p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold">{draftEvents.length}</p>
                </div>
                <Edit className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('upcoming')}
              size="sm"
            >
              Upcoming
            </Button>
            <Button
              variant={filterStatus === 'past' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('past')}
              size="sm"
            >
              Past
            </Button>
            <Button
              variant={filterStatus === 'published' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('published')}
              size="sm"
            >
              Published
            </Button>
            <Button
              variant={filterStatus === 'draft' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('draft')}
              size="sm"
            >
              Drafts
            </Button>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first event.'
                  }
                </p>
                <Button onClick={handleCreateEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="event-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        <Badge variant={event.is_public ? 'default' : 'secondary'}>
                          {event.is_public ? 'Published' : 'Draft'}
                        </Badge>
                        {new Date(event.date) <= new Date() && (
                          <Badge variant="outline">Past</Badge>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-muted-foreground mb-3">{event.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(event.date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.date), 'h:mm a')} - {format(new Date(new Date(event.date).getTime() + event.duration * 60 * 1000), 'h:mm a')}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                        {event.max_attendees && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Max {event.max_attendees} attendees
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => event.id && handleEditEvent(event)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => event.id && handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
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
