'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Users, TrendingUp, Calendar } from 'lucide-react'

interface Event {
  id?: string
  name: string
  date: string
  duration: number
  location?: string | null
  is_public: boolean
  max_attendees?: number | null
  created_at?: string
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

interface AnalyticsData {
  totalEvents: number
  totalGuests: number
  attendanceRate: number
  upcomingEvents: number
  completedEvents: number
  averageEventDuration: number
  mostPopularEventType: string
  peakEventTime: string
  guestEngagementScore: number
  revenueGenerated: number
}

interface AttendanceAnalyticsProps {
  events: Event[]
  guests: Guest[]
  analyticsData: AnalyticsData
}

export function AttendanceAnalytics({ events, guests, analyticsData }: AttendanceAnalyticsProps) {
  // Calculate attendance metrics
  const confirmedGuests = guests.filter(g => g.status === 'confirmed').length
  const pendingGuests = guests.filter(g => g.status === 'pending').length
  const declinedGuests = guests.filter(g => g.status === 'declined').length
  const cancelledGuests = guests.filter(g => g.status === 'cancelled').length

  // Response time analysis
  const respondedGuests = guests.filter(g => g.responded_at)
  const averageResponseTime = respondedGuests.length > 0 
    ? respondedGuests.reduce((sum, guest) => {
        const invited = new Date(guest.invited_at)
        const responded = new Date(guest.responded_at!)
        return sum + (responded.getTime() - invited.getTime())
      }, 0) / respondedGuests.length / (1000 * 60 * 60) // Convert to hours
    : 0

  // Event-specific attendance
  const eventAttendance = events.map(event => {
    const eventGuests = guests.filter(g => g.event_id === event.id)
    const eventConfirmed = eventGuests.filter(g => g.status === 'confirmed').length
    const eventTotal = eventGuests.length
    const eventRate = eventTotal > 0 ? (eventConfirmed / eventTotal) * 100 : 0
    
    return {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      totalGuests: eventTotal,
      confirmedGuests: eventConfirmed,
      attendanceRate: eventRate
    }
  }).sort((a, b) => b.attendanceRate - a.attendanceRate)

  // Weekly attendance trends
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisWeekGuests = guests.filter(g => new Date(g.invited_at) >= lastWeek)
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const lastWeekGuests = guests.filter(g => {
    const invited = new Date(g.invited_at)
    return invited >= lastWeekStart && invited < lastWeek
  })

  const thisWeekConfirmed = thisWeekGuests.filter(g => g.status === 'confirmed').length
  const lastWeekConfirmed = lastWeekGuests.filter(g => g.status === 'confirmed').length
  const weeklyGrowth = lastWeekConfirmed > 0 
    ? ((thisWeekConfirmed - lastWeekConfirmed) / lastWeekConfirmed) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedGuests}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.attendanceRate.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingGuests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Declined</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{declinedGuests}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.totalGuests > 0 
                ? ((declinedGuests / analyticsData.totalGuests) * 100).toFixed(1)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{cancelledGuests}</div>
            <p className="text-xs text-muted-foreground">
              Event cancelled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Response Time</span>
                <span className="text-sm text-muted-foreground">
                  {averageResponseTime > 0 ? `${averageResponseTime.toFixed(1)} hours` : 'No responses yet'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full"
                  style={{ 
                    width: `${Math.min((averageResponseTime / 24) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Rate</span>
                <span className="text-sm text-muted-foreground">
                  {analyticsData.guestEngagementScore.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${analyticsData.guestEngagementScore}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Week</span>
                <span className="text-sm font-bold">{thisWeekConfirmed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Week</span>
                <span className="text-sm text-muted-foreground">{lastWeekConfirmed}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className={`h-4 w-4 ${weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {weeklyGrowth >= 0 ? '+' : ''}{weeklyGrowth.toFixed(1)}% vs last week
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Attendance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Event Attendance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventAttendance.slice(0, 5).map((event, index) => (
              <div key={event.eventId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span className="text-sm font-medium">{event.eventName}</span>
                    <Badge variant="outline">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.confirmedGuests} confirmed / {event.totalGuests} total guests
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-bold">{event.attendanceRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">attendance</div>
                  </div>
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${event.attendanceRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {eventAttendance.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No events with guests yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
