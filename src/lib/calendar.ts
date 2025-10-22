import { supabase } from './supabase'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  status: 'draft' | 'published' | 'cancelled'
  created_at: string
  updated_at: string
  user_id: string
}

export interface CreateEventData {
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  status?: 'draft' | 'published' | 'cancelled'
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string
}

class CalendarService {
  // Get all events for a user
  async getEvents(userId: string): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
  }

  // Get events for a specific date range
  async getEventsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching events by date range:', error)
      return []
    }
  }

  // Create a new event
  async createEvent(userId: string, eventData: CreateEventData): Promise<CalendarEvent | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          user_id: userId,
          status: eventData.status || 'draft'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating event:', error)
      return null
    }
  }

  // Update an existing event
  async updateEvent(userId: string, eventData: UpdateEventData): Promise<CalendarEvent | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          ...eventData,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventData.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating event:', error)
      return null
    }
  }

  // Delete an event
  async deleteEvent(userId: string, eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting event:', error)
      return false
    }
  }

  // Check for scheduling conflicts
  async checkConflicts(
    userId: string, 
    startTime: string, 
    endTime: string, 
    excludeEventId?: string
  ): Promise<CalendarEvent[]> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'published')
        .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)

      if (excludeEventId) {
        query = query.neq('id', excludeEventId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error checking conflicts:', error)
      return []
    }
  }

  // Export events to ICS format
  generateICS(events: CalendarEvent[]): string {
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

  // Download ICS file
  downloadICS(events: CalendarEvent[], filename?: string): void {
    const icsContent = this.generateICS(events)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename || `meetbase-events-${new Date().toISOString().split('T')[0]}.ics`
    link.click()
  }
}

export const calendarService = new CalendarService()
