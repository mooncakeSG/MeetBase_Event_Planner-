'use client'

import { format } from 'date-fns'
import { Calendar, Clock, MapPin, Users, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface Event {
  id?: string
  name: string
  description?: string | null
  date: string
  duration: number
  location?: string | null
  is_public: boolean
  max_attendees?: number | null
  created_at?: string
  updated_at?: string
}

interface EventCardProps {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (eventId: string) => void
  onView?: (eventId: string) => void
}

export function EventCard({ event, onEdit, onDelete, onView }: EventCardProps) {
  const eventDate = new Date(event.date)
  const endTime = new Date(eventDate.getTime() + event.duration * 60000)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  return (
    <Card className="event-card group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {event.name}
            </CardTitle>
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => event.id && onView?.(event.id)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(event)}>
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => event.id && onDelete?.(event.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(eventDate, 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              {format(eventDate, 'h:mm a')} - {format(endTime, 'h:mm a')}
              <span className="ml-1">({formatDuration(event.duration)})</span>
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          
          {event.max_attendees && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>Max {event.max_attendees} attendees</span>
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          <Badge variant={event.is_public ? 'default' : 'secondary'}>
            {event.is_public ? 'Public' : 'Private'}
          </Badge>
          {eventDate < new Date() && (
            <Badge variant="outline" className="text-muted-foreground">
              Past Event
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => event.id && onView?.(event.id)}
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit?.(event)}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
