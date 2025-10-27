'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/MainLayout'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { useAuthStore } from '@/lib/store'
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

interface Guest {
  id: string
  event_id: string
  name: string
  email: string
  role?: string | null
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
  invite_link: string | null
  invited_at: string
  responded_at?: string
  notes: string | null
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
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
      },
      {
        id: '4',
        name: 'Workshop Series',
        description: 'Technical skills development workshop',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 180,
        location: 'Training Center',
        is_public: true,
        max_attendees: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]

    const mockGuests: Guest[] = [
      {
        id: '1',
        event_id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'speaker',
        status: 'confirmed',
        invite_link: 'https://meetbase.com/book/1?guest=1',
        invited_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        responded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Keynote speaker for the main session'
      },
      {
        id: '2',
        event_id: '1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'vip',
        status: 'pending',
        invite_link: 'https://meetbase.com/book/1?guest=2',
        invited_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        responded_at: undefined,
        notes: null
      },
      {
        id: '3',
        event_id: '2',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'attendee',
        status: 'confirmed',
        invite_link: 'https://meetbase.com/book/2?guest=3',
        invited_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        responded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Interested in product demos'
      },
      {
        id: '4',
        event_id: '2',
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: 'sponsor',
        status: 'declined',
        invite_link: 'https://meetbase.com/book/2?guest=4',
        invited_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        responded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Schedule conflict'
      },
      {
        id: '5',
        event_id: '3',
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        role: 'attendee',
        status: 'confirmed',
        invite_link: 'https://meetbase.com/book/3?guest=5',
        invited_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        responded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Looking forward to the presentation'
      },
      {
        id: '6',
        event_id: '4',
        name: 'Diana Lee',
        email: 'diana@example.com',
        role: 'attendee',
        status: 'confirmed',
        invite_link: 'https://meetbase.com/book/4?guest=6',
        invited_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        responded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Excited about the workshop'
      }
    ]

    setEvents(mockEvents)
    setGuests(mockGuests)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExportAnalytics = () => {
    // Create CSV data
    const csvData = [
      ['Event Name', 'Date', 'Total Invites', 'Confirmed', 'Pending', 'Declined', 'Attendance Rate'],
      ...events.map(event => {
        const eventGuests = guests.filter(g => g.event_id === event.id)
        const confirmed = eventGuests.filter(g => g.status === 'confirmed').length
        const pending = eventGuests.filter(g => g.status === 'pending').length
        const declined = eventGuests.filter(g => g.status === 'declined').length
        const attendanceRate = eventGuests.length > 0 ? ((confirmed / eventGuests.length) * 100).toFixed(1) + '%' : '0%'
        
        return [
          event.name,
          new Date(event.date).toLocaleDateString(),
          eventGuests.length.toString(),
          confirmed.toString(),
          pending.toString(),
          declined.toString(),
          attendanceRate
        ]
      })
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meetbase_analytics_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Calculate summary stats
  const totalEvents = events.length
  const totalGuests = guests.length
  const confirmedGuests = guests.filter(g => g.status === 'confirmed').length
  const attendanceRate = totalGuests > 0 ? ((confirmedGuests / totalGuests) * 100).toFixed(1) : '0'

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
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Track event performance and guest engagement
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportAnalytics}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{totalEvents}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                  <p className="text-2xl font-bold">{totalGuests}</p>
                  <p className="text-xs text-muted-foreground">All events</p>
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
                  <p className="text-2xl font-bold text-green-600">{confirmedGuests}</p>
                  <p className="text-xs text-muted-foreground">RSVPs</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold">{attendanceRate}%</p>
                  <p className="text-xs text-muted-foreground">Average</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard events={events} guests={guests} />
      </div>
    </MainLayout>
  )
}
