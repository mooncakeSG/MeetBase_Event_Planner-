'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Search, Filter, Mail, Phone, Calendar, MoreVertical, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
import { GuestModal } from '@/components/guests/GuestModal'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface Guest {
  id?: string
  name: string
  email: string
  role?: string | null
  notes?: string | null
}

interface Event {
  id?: string
  name: string
  date: string
  location?: string | null
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'declined' | 'cancelled'>('all')
  const [filterEvent, setFilterEvent] = useState<string>('all')
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
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: 'Conference Room A'
      },
      {
        id: '2',
        name: 'Product Launch',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Main Auditorium'
      }
    ]

    const mockGuests: Guest[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'speaker',
        notes: 'Keynote speaker for the main session'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'vip',
        notes: null
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'attendee',
        notes: 'Interested in product demos'
      },
      {
        id: '4',
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: 'sponsor',
        notes: 'Schedule conflict'
      }
    ]

    setEvents(mockEvents)
    setGuests(mockGuests)
  }, [])

  const handleAddGuest = () => {
    setSelectedGuest(null)
    setIsGuestModalOpen(true)
  }

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsGuestModalOpen(true)
  }

  const handleGuestSubmit = (guestData: Guest) => {
    if (selectedGuest) {
      setGuests(guests.map(g => g.id === selectedGuest.id ? { ...g, ...guestData } : g))
    } else {
      const newGuest = {
        ...guestData,
        id: Date.now().toString()
      }
      setGuests([...guests, newGuest])
    }
    setIsGuestModalOpen(false)
    setSelectedGuest(null)
  }

  const handleDeleteGuest = (guestId: string) => {
    if (confirm('Are you sure you want to delete this guest?')) {
      setGuests(guests.filter(g => g.id !== guestId))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'default',
      pending: 'secondary',
      declined: 'destructive',
      cancelled: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getRoleLabel = (role: string | null | undefined) => {
    if (!role) return null
    const roleMap: { [key: string]: string } = {
      'speaker': 'Speaker/Presenter',
      'organizer': 'Organizer',
      'attendee': 'Attendee',
      'vip': 'VIP Guest',
      'sponsor': 'Sponsor',
      'media': 'Media/Press',
      'staff': 'Staff/Volunteer',
      'vendor': 'Vendor/Supplier',
      'partner': 'Business Partner',
      'other': 'Other'
    }
    return roleMap[role] || role
  }

  // Filter and search guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const confirmedGuests = guests.filter(g => g.role === 'speaker' || g.role === 'vip')
  const pendingGuests = guests.filter(g => g.role === 'attendee')
  const declinedGuests = guests.filter(g => g.role === 'sponsor')

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
            <h1 className="text-3xl font-bold">Guests</h1>
            <p className="text-muted-foreground">
              Manage your event guests and track RSVPs
            </p>
          </div>
          <Button onClick={handleAddGuest}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                  <p className="text-2xl font-bold">{guests.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{confirmedGuests.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingGuests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Declined</p>
                  <p className="text-2xl font-bold text-red-600">{declinedGuests.length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('confirmed')}
              size="sm"
            >
              Confirmed
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('pending')}
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === 'declined' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('declined')}
              size="sm"
            >
              Declined
            </Button>
          </div>
        </div>

        {/* Guests List */}
        <div className="space-y-4">
          {filteredGuests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No guests found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterStatus !== 'all' || filterEvent !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first guest.'
                  }
                </p>
                <Button onClick={handleAddGuest}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Guest
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredGuests.map((guest) => {
              return (
                <Card key={guest.id} className="event-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{guest.name}</h3>
                            {getStatusBadge(guest.role || 'attendee')}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {guest.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {guest.role || 'attendee'}
                            </div>
                          </div>
                          
                          {guest.role && (
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs">
                                {getRoleLabel(guest.role)}
                              </Badge>
                            </div>
                          )}
                          
                          {guest.notes && (
                            <p className="text-sm text-muted-foreground">{guest.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditGuest(guest)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => guest.id && handleDeleteGuest(guest.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Guest Modal */}
      <GuestModal
        isOpen={isGuestModalOpen}
        onClose={() => {
          setIsGuestModalOpen(false)
          setSelectedGuest(null)
        }}
        onSubmit={handleGuestSubmit}
        guest={selectedGuest}
        eventName="Event"
      />
    </MainLayout>
  )
}
