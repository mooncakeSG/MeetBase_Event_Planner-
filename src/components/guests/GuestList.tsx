'use client'

import { useState, useEffect } from 'react'
import { Plus, Mail, User, CheckCircle, XCircle, Clock, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GuestModal } from './GuestModal'

interface Guest {
  id: string
  event_id: string
  name: string
  email: string
  role?: string | null
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
  invite_link: string | null
  invited_at: string
  responded_at: string | null
  notes: string | null
}

interface GuestListProps {
  eventId: string
  eventName: string
}

export function GuestList({ eventId, eventName }: GuestListProps) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(false)

  // Role mapping for display
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

  // Mock data for development
  useEffect(() => {
    const mockGuests: Guest[] = [
      {
        id: '1',
        event_id: eventId,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'speaker',
        status: 'confirmed',
        invite_link: `https://meetbase.com/book/${eventId}?guest=1`,
        invited_at: new Date().toISOString(),
        responded_at: new Date().toISOString(),
        notes: 'Keynote speaker for the main session'
      },
      {
        id: '2',
        event_id: eventId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'vip',
        status: 'pending',
        invite_link: `https://meetbase.com/book/${eventId}?guest=2`,
        invited_at: new Date().toISOString(),
        responded_at: null,
        notes: null
      }
    ]
    setGuests(mockGuests)
  }, [eventId])

  const handleAddGuest = () => {
    setSelectedGuest(null)
    setIsGuestModalOpen(true)
  }

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsGuestModalOpen(true)
  }

  const handleDeleteGuest = (guestId: string) => {
    if (confirm('Are you sure you want to remove this guest?')) {
      setGuests(guests.filter(g => g.id !== guestId))
    }
  }

  const handleResendInvite = (guest: Guest) => {
    // TODO: Implement resend invite functionality
    console.log('Resending invite to:', guest.email)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const confirmedCount = guests.filter(g => g.status === 'confirmed').length
  const pendingCount = guests.filter(g => g.status === 'pending').length
  const declinedCount = guests.filter(g => g.status === 'declined').length

  return (
    <div className="space-y-6">
      {/* Guest Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Declined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{declinedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Guest List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Guest List</h3>
          <p className="text-sm text-muted-foreground">
            Manage guests for "{eventName}"
          </p>
        </div>
        <Button onClick={handleAddGuest}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Guest List */}
      <div className="space-y-4">
        {guests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No guests yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add guests to start building your event guest list.
              </p>
              <Button onClick={handleAddGuest}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Guest
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <Card key={guest.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{guest.name}</h4>
                          {getStatusIcon(guest.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{guest.email}</p>
                        {guest.role && (
                          <p className="text-xs text-primary font-medium mt-1">
                            {getRoleLabel(guest.role)}
                          </p>
                        )}
                        {guest.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{guest.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(guest.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditGuest(guest)}>
                            Edit Guest
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResendInvite(guest)}>
                            Resend Invite
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Remove Guest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Guest Modal */}
      <GuestModal
        isOpen={isGuestModalOpen}
        onClose={() => {
          setIsGuestModalOpen(false)
          setSelectedGuest(null)
        }}
        onSubmit={(guestData) => {
          if (selectedGuest) {
            // Update existing guest
            setGuests(guests.map(g => 
              g.id === selectedGuest.id ? { ...g, ...guestData } : g
            ))
          } else {
            // Add new guest
            const newGuest: Guest = {
              id: Date.now().toString(),
              event_id: eventId,
              ...guestData,
              status: 'pending',
              invite_link: `https://meetbase.com/book/${eventId}?guest=${Date.now()}`,
              invited_at: new Date().toISOString(),
              responded_at: null,
            }
            setGuests([...guests, newGuest])
          }
          setIsGuestModalOpen(false)
          setSelectedGuest(null)
        }}
        guest={selectedGuest}
        eventName={eventName}
      />
    </div>
  )
}
