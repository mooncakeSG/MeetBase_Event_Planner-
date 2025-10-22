'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react'

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

interface GuestEngagementProps {
  guests: Guest[]
  analyticsData: AnalyticsData
}

export function GuestEngagement({ guests, analyticsData }: GuestEngagementProps) {
  // Calculate engagement metrics
  const totalGuests = guests.length
  const respondedGuests = guests.filter(g => g.responded_at).length
  const confirmedGuests = guests.filter(g => g.status === 'confirmed').length
  const pendingGuests = guests.filter(g => g.status === 'pending').length

  // Response time analysis
  const responseTimes = guests
    .filter(g => g.responded_at)
    .map(g => {
      const invited = new Date(g.invited_at)
      const responded = new Date(g.responded_at!)
      return (responded.getTime() - invited.getTime()) / (1000 * 60 * 60) // hours
    })

  const averageResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0

  const quickResponders = responseTimes.filter(time => time <= 2).length // within 2 hours
  const slowResponders = responseTimes.filter(time => time > 24).length // after 24 hours

  // Engagement by time of day
  const engagementByHour = guests.reduce((acc, guest) => {
    const hour = new Date(guest.invited_at).getHours()
    const key = `${hour}:00`
    if (!acc[key]) {
      acc[key] = { total: 0, responded: 0 }
    }
    acc[key].total++
    if (guest.responded_at) {
      acc[key].responded++
    }
    return acc
  }, {} as Record<string, { total: number; responded: number }>)

  const bestEngagementHour = Object.entries(engagementByHour)
    .map(([hour, data]) => ({
      hour,
      rate: data.total > 0 ? (data.responded / data.total) * 100 : 0,
      total: data.total
    }))
    .sort((a, b) => b.rate - a.rate)[0]

  // Guest behavior patterns
  const repeatGuests = guests.reduce((acc, guest) => {
    const email = guest.email.toLowerCase()
    acc[email] = (acc[email] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const uniqueGuests = Object.keys(repeatGuests).length
  const repeatGuestCount = Object.values(repeatGuests).filter(count => count > 1).length
  const loyaltyRate = uniqueGuests > 0 ? (repeatGuestCount / uniqueGuests) * 100 : 0

  // Engagement trends over time
  const now = new Date()
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const recentGuests = guests.filter(g => new Date(g.invited_at) >= last7Days)
  const monthlyGuests = guests.filter(g => new Date(g.invited_at) >= last30Days)

  const recentEngagement = recentGuests.length > 0 
    ? (recentGuests.filter(g => g.responded_at).length / recentGuests.length) * 100
    : 0

  const monthlyEngagement = monthlyGuests.length > 0 
    ? (monthlyGuests.filter(g => g.responded_at).length / monthlyGuests.length) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.guestEngagementScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {respondedGuests} of {totalGuests} responded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Responders</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{quickResponders}</div>
            <p className="text-xs text-muted-foreground">
              Responded within 2 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageResponseTime > 0 ? `${averageResponseTime.toFixed(1)}h` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Time to respond
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guest Loyalty</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {repeatGuestCount} repeat guests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Quick (≤2h)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{quickResponders}</span>
                  <span className="text-xs text-muted-foreground">
                    {respondedGuests > 0 ? ((quickResponders / respondedGuests) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Normal (2-24h)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">
                    {respondedGuests - quickResponders - slowResponders}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {respondedGuests > 0 ? (((respondedGuests - quickResponders - slowResponders) / respondedGuests) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Slow (&gt;24h)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{slowResponders}</span>
                  <span className="text-xs text-muted-foreground">
                    {respondedGuests > 0 ? ((slowResponders / respondedGuests) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Engagement Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bestEngagementHour && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Peak Hour</span>
                  <Badge variant="secondary">{bestEngagementHour.hour}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Engagement Rate</span>
                  <span className="text-sm font-bold">{bestEngagementHour.rate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Invites</span>
                  <span className="text-sm text-muted-foreground">{bestEngagementHour.total}</span>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Send invitations during peak hours for better engagement rates.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recent (7 days)</span>
                <span className="text-sm font-bold">{recentEngagement.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {recentGuests.length} guests invited
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly (30 days)</span>
                <span className="text-sm font-bold">{monthlyEngagement.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {monthlyGuests.length} guests invited
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall</span>
                <span className="text-sm font-bold">{analyticsData.guestEngagementScore.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {totalGuests} total guests
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Unique Guests</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {uniqueGuests} unique email addresses
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Repeat Guests</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {repeatGuestCount} guests invited to multiple events
              </p>
            </div>
          </div>
          
          {loyaltyRate > 0 && (
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                <strong>Loyalty Insight:</strong> {loyaltyRate.toFixed(1)}% of your guests are repeat attendees, 
                indicating strong engagement with your events.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
