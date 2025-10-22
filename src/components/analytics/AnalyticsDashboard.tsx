'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  Download,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { EventMetrics } from './EventMetrics'
import { AttendanceAnalytics } from './AttendanceAnalytics'
import { GuestEngagement } from './GuestEngagement'
import { EventPopularity } from './EventPopularity'

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
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
  invited_at: string
  responded_at?: string
}

interface AnalyticsDashboardProps {
  events: Event[]
  guests: Guest[]
}

export function AnalyticsDashboard({ events, guests }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Calculate analytics data
  useEffect(() => {
    const calculateAnalytics = () => {
      const now = new Date()
      const totalEvents = events.length
      const totalGuests = guests.length
      
      // Attendance rate calculation
      const confirmedGuests = guests.filter(g => g.status === 'confirmed').length
      const attendanceRate = totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0
      
      // Event status breakdown
      const upcomingEvents = events.filter(e => new Date(e.date) > now).length
      const completedEvents = events.filter(e => new Date(e.date) <= now).length
      
      // Average event duration
      const totalDuration = events.reduce((sum, event) => sum + event.duration, 0)
      const averageEventDuration = totalEvents > 0 ? totalDuration / totalEvents : 0
      
      // Most popular event type (simplified - using location as type)
      const eventTypes = events.reduce((acc, event) => {
        const type = event.location || 'Online'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      const mostPopularEventType = Object.entries(eventTypes)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Online'
      
      // Peak event time (simplified - using hour of day)
      const eventHours = events.map(e => new Date(e.date).getHours())
      const hourCounts = eventHours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {} as Record<number, number>)
      const peakHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 14
      const peakEventTime = `${peakHour}:00`
      
      // Guest engagement score (based on response rate)
      const respondedGuests = guests.filter(g => g.responded_at).length
      const guestEngagementScore = totalGuests > 0 ? (respondedGuests / totalGuests) * 100 : 0
      
      // Mock revenue (for future paid events)
      const revenueGenerated = completedEvents * 50 // $50 per completed event
      
      setAnalyticsData({
        totalEvents,
        totalGuests,
        attendanceRate,
        upcomingEvents,
        completedEvents,
        averageEventDuration,
        mostPopularEventType,
        peakEventTime,
        guestEngagementScore,
        revenueGenerated
      })
      setLoading(false)
    }

    calculateAnalytics()
  }, [events, guests])

  const handleRefresh = () => {
    setLoading(true)
    setLastUpdated(new Date())
    // Simulate refresh delay
    setTimeout(() => setLoading(false), 1000)
  }

  const handleExportAnalytics = () => {
    if (!analyticsData) return
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Events', analyticsData.totalEvents],
      ['Total Guests', analyticsData.totalGuests],
      ['Attendance Rate (%)', analyticsData.attendanceRate.toFixed(1)],
      ['Upcoming Events', analyticsData.upcomingEvents],
      ['Completed Events', analyticsData.completedEvents],
      ['Average Duration (min)', analyticsData.averageEventDuration.toFixed(1)],
      ['Most Popular Type', analyticsData.mostPopularEventType],
      ['Peak Event Time', analyticsData.peakEventTime],
      ['Guest Engagement (%)', analyticsData.guestEngagementScore.toFixed(1)],
      ['Revenue Generated ($)', analyticsData.revenueGenerated]
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `meetbase-analytics-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading analytics...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground">Create some events to see analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.guestEngagementScore.toFixed(1)}% engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.totalGuests > 0 ? `${guests.filter(g => g.status === 'confirmed').length} confirmed` : 'No guests yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.revenueGenerated}</div>
            <p className="text-xs text-muted-foreground">
              From {analyticsData.completedEvents} events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Event Metrics</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="engagement">Guest Engagement</TabsTrigger>
          <TabsTrigger value="popularity">Event Popularity</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <EventMetrics 
            events={events}
            analyticsData={analyticsData}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceAnalytics 
            events={events}
            guests={guests}
            analyticsData={analyticsData}
          />
        </TabsContent>

        <TabsContent value="engagement">
          <GuestEngagement 
            guests={guests}
            analyticsData={analyticsData}
          />
        </TabsContent>

        <TabsContent value="popularity">
          <EventPopularity 
            events={events}
            analyticsData={analyticsData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
