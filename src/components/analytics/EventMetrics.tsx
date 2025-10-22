'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Users, Calendar } from 'lucide-react'

interface Event {
  id: string
  name: string
  date: string
  duration: number
  location?: string
  is_public: boolean
  max_attendees?: number
  created_at: string
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

interface EventMetricsProps {
  events: Event[]
  analyticsData: AnalyticsData
}

export function EventMetrics({ events, analyticsData }: EventMetricsProps) {
  // Calculate additional metrics
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  
  const thisMonthEvents = events.filter(e => new Date(e.created_at) >= thisMonth).length
  const lastMonthEvents = events.filter(e => {
    const created = new Date(e.created_at)
    return created >= lastMonth && created < thisMonth
  }).length
  
  const eventGrowth = lastMonthEvents > 0 
    ? ((thisMonthEvents - lastMonthEvents) / lastMonthEvents) * 100 
    : 0

  // Event duration distribution
  const durationRanges = {
    '0-30min': events.filter(e => e.duration <= 30).length,
    '30-60min': events.filter(e => e.duration > 30 && e.duration <= 60).length,
    '1-2hours': events.filter(e => e.duration > 60 && e.duration <= 120).length,
    '2+hours': events.filter(e => e.duration > 120).length
  }

  // Event status breakdown
  const publicEvents = events.filter(e => e.is_public).length
  const privateEvents = events.filter(e => !e.is_public).length

  // Recent events (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentEvents = events.filter(e => new Date(e.created_at) >= sevenDaysAgo).length

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Growth</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventGrowth > 0 ? '+' : ''}{eventGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {thisMonthEvents} this month vs {lastMonthEvents} last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.averageEventDuration.toFixed(0)} min
            </div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events created in last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Duration Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Duration Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(durationRanges).map(([range, count]) => {
              const percentage = analyticsData.totalEvents > 0 
                ? (count / analyticsData.totalEvents) * 100 
                : 0
              
              return (
                <div key={range} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{range}</span>
                    <span className="text-sm text-muted-foreground">{count} events</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% of total events
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Event Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Event Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Public Events</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{publicEvents}</Badge>
                <span className="text-sm text-muted-foreground">
                  {analyticsData.totalEvents > 0 
                    ? ((publicEvents / analyticsData.totalEvents) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Private Events</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{privateEvents}</Badge>
                <span className="text-sm text-muted-foreground">
                  {analyticsData.totalEvents > 0 
                    ? ((privateEvents / analyticsData.totalEvents) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Event Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Most Popular Type</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {analyticsData.mostPopularEventType}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Peak Event Time</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {analyticsData.peakEventTime}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
