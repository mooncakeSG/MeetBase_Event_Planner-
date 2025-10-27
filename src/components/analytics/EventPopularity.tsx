'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Calendar, Clock, MapPin, Users, Star } from 'lucide-react'

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

interface EventPopularityProps {
  events: Event[]
  analyticsData: AnalyticsData
}

export function EventPopularity({ events, analyticsData }: EventPopularityProps) {
  // Calculate popularity metrics
  const now = new Date()
  
  // Event type popularity
  const eventTypes = events.reduce((acc, event) => {
    const type = event.location || 'Online'
    if (!acc[type]) {
      acc[type] = { count: 0, totalGuests: 0, avgDuration: 0 }
    }
    acc[type].count++
    acc[type].totalGuests += event.max_attendees || 0
    acc[type].avgDuration += event.duration
    return acc
  }, {} as Record<string, { count: number; totalGuests: number; avgDuration: number }>)

  // Calculate averages for each type
  Object.keys(eventTypes).forEach(type => {
    const data = eventTypes[type]
    data.avgDuration = data.avgDuration / data.count
  })

  const sortedEventTypes = Object.entries(eventTypes)
    .map(([type, data]) => ({
      type,
      count: data.count,
      totalGuests: data.totalGuests,
      avgDuration: data.avgDuration,
      popularity: data.count / analyticsData.totalEvents * 100
    }))
    .sort((a, b) => b.popularity - a.popularity)

  // Time-based popularity
  const eventsByHour = events.reduce((acc, event) => {
    const hour = new Date(event.date).getHours()
    const key = `${hour}:00`
    if (!acc[key]) {
      acc[key] = { count: 0, totalGuests: 0 }
    }
    acc[key].count++
    acc[key].totalGuests += event.max_attendees || 0
    return acc
  }, {} as Record<string, { count: number; totalGuests: number }>)

  const sortedHours = Object.entries(eventsByHour)
    .map(([hour, data]) => ({
      hour,
      count: data.count,
      totalGuests: data.totalGuests,
      popularity: data.count / analyticsData.totalEvents * 100
    }))
    .sort((a, b) => b.popularity - a.popularity)

  // Day of week popularity
  const eventsByDay = events.reduce((acc, event) => {
    const day = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })
    if (!acc[day]) {
      acc[day] = { count: 0, totalGuests: 0 }
    }
    acc[day].count++
    acc[day].totalGuests += event.max_attendees || 0
    return acc
  }, {} as Record<string, { count: number; totalGuests: number }>)

  const sortedDays = Object.entries(eventsByDay)
    .map(([day, data]) => ({
      day,
      count: data.count,
      totalGuests: data.totalGuests,
      popularity: data.count / analyticsData.totalEvents * 100
    }))
    .sort((a, b) => b.popularity - a.popularity)

  // Duration popularity
  const durationRanges = {
    'Short (≤30min)': events.filter(e => e.duration <= 30).length,
    'Medium (30-60min)': events.filter(e => e.duration > 30 && e.duration <= 60).length,
    'Long (1-2h)': events.filter(e => e.duration > 60 && e.duration <= 120).length,
    'Extended (2h+)': events.filter(e => e.duration > 120).length
  }

  const sortedDurations = Object.entries(durationRanges)
    .map(([range, count]) => ({
      range,
      count,
      popularity: count / analyticsData.totalEvents * 100
    }))
    .sort((a, b) => b.popularity - a.popularity)

  // Public vs Private popularity
  const publicEvents = events.filter(e => e.is_public).length
  const privateEvents = events.filter(e => !e.is_public).length
  const publicPopularity = (publicEvents / analyticsData.totalEvents) * 100
  const privatePopularity = (privateEvents / analyticsData.totalEvents) * 100

  // Most popular event (by name frequency)
  const eventNames = events.reduce((acc, event) => {
    const name = event.name.toLowerCase()
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostPopularEventName = Object.entries(eventNames)
    .sort(([,a], [,b]) => b - a)[0]

  return (
    <div className="space-y-6">
      {/* Popularity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Type</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.mostPopularEventType}</div>
            <p className="text-xs text-muted-foreground">
              {sortedEventTypes[0]?.popularity.toFixed(1)}% of all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.peakEventTime}</div>
            <p className="text-xs text-muted-foreground">
              {sortedHours[0]?.popularity.toFixed(1)}% of events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedDays[0]?.day || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {sortedDays[0]?.popularity.toFixed(1)}% of events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Event Type Popularity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedEventTypes.slice(0, 5).map((type, index) => (
            <div key={type.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <span className="text-sm font-medium">{type.type}</span>
                  <Badge variant="outline">{type.count} events</Badge>
                </div>
                <span className="text-sm font-bold">{type.popularity.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${type.popularity}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Avg duration: {type.avgDuration.toFixed(0)} min</span>
                <span>Total capacity: {type.totalGuests} guests</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Time-based Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedHours.slice(0, 5).map((time, index) => (
              <div key={time.hour} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <span className="text-sm font-medium">{time.hour}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{time.popularity.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">({time.count} events)</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Days</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedDays.slice(0, 5).map((day, index) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <span className="text-sm font-medium">{day.day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{day.popularity.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">({day.count} events)</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Duration Popularity */}
      <Card>
        <CardHeader>
          <CardTitle>Event Duration Popularity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedDurations.map((duration, index) => (
            <div key={duration.range} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <span className="text-sm font-medium">{duration.range}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{duration.popularity.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">({duration.count} events)</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${duration.popularity}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Event Visibility & Popularity Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Public Events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{publicPopularity.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">({publicEvents} events)</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${publicPopularity}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Private Events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{privatePopularity.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">({privateEvents} events)</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${privatePopularity}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popularity Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mostPopularEventName && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Most Popular Event Name</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  &ldquo;{mostPopularEventName[0]}&rdquo; appears in {mostPopularEventName[1]} events
                </p>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                <strong>Insight:</strong> Your most popular event type is {analyticsData.mostPopularEventType} 
                at {analyticsData.peakEventTime}, suggesting this combination resonates well with your audience.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
