'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EventModal } from '@/components/events/EventModal'

interface Event {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  status: 'draft' | 'published' | 'cancelled'
  created_at: string
  updated_at: string
}

interface CalendarViewProps {
  events: Event[]
  onEventCreate: (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => void
  onEventUpdate: (id: string, event: Partial<Event>) => void
  onEventDelete: (id: string) => void
}

export function CalendarView({ events, onEventCreate, onEventUpdate, onEventDelete }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setIsEventModalOpen(true)
  }

  // Handle event click
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  // Export to .ics
  const exportToICS = () => {
    const icsContent = generateICSContent(events)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `meetbase-events-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}.ics`
    link.click()
  }

  const generateICSContent = (events: Event[]) => {
    const now = new Date()
    const nowUTC = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MeetBase//Event Management//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ]

    events.forEach(event => {
      const startDate = new Date(event.start_time)
      const endDate = new Date(event.end_time)
      
      const startUTC = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const endUTC = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      
      ics.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@meetbase.com`,
        `DTSTAMP:${nowUTC}`,
        `DTSTART:${startUTC}`,
        `DTEND:${endUTC}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
        event.location ? `LOCATION:${event.location}` : '',
        `STATUS:${event.status.toUpperCase()}`,
        'END:VEVENT'
      )
    })

    ics.push('END:VCALENDAR')
    return ics.join('\r\n')
  }

  const calendarDays = getCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={exportToICS}
            className="flex items-center space-x-2"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Export .ics</span>
          </Button>
          <Button
            onClick={() => handleDateClick(new Date())}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-border">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-muted/50 p-3 text-center text-sm font-medium">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isToday = day.toDateString() === new Date().toDateString()
              const isSelected = selectedDate?.toDateString() === day.toDateString()
              const dayEvents = getEventsForDate(day)
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] bg-background p-2 border-r border-b border-border cursor-pointer hover:bg-muted/50 ${
                    !isCurrentMonth ? 'text-muted-foreground' : ''
                  } ${isToday ? 'bg-primary/10' : ''} ${isSelected ? 'bg-primary/20' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                      {day.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 bg-primary/10 text-primary rounded cursor-pointer hover:bg-primary/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                      >
                        <div className="truncate font-medium">{event.title}</div>
                        {event.start_time && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(event.start_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setSelectedEvent(null)
          setSelectedDate(null)
        }}
        event={selectedEvent}
        onSave={(eventData) => {
          if (selectedEvent) {
            onEventUpdate(selectedEvent.id, eventData)
          } else {
            onEventCreate({
              ...eventData,
              start_time: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
              end_time: selectedDate ? new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString()
            })
          }
        }}
        onDelete={selectedEvent ? () => {
          onEventDelete(selectedEvent.id)
          setIsEventModalOpen(false)
          setSelectedEvent(null)
        } : undefined}
      />
    </div>
  )
}
