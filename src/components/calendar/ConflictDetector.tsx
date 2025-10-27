'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Event {
  id?: string
  title: string
  start_time: string
  end_time: string
  location?: string
  status: 'draft' | 'published' | 'cancelled'
}

interface ConflictDetectorProps {
  events: Event[]
  newEventStart: string
  newEventEnd: string
  excludeEventId?: string
  onConflictResolve?: (conflictId: string) => void
}

export function ConflictDetector({ 
  events, 
  newEventStart, 
  newEventEnd, 
  excludeEventId,
  onConflictResolve 
}: ConflictDetectorProps) {
  const [conflicts, setConflicts] = useState<Event[]>([])
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkConflicts()
  }, [events, newEventStart, newEventEnd, excludeEventId])

  const checkConflicts = async () => {
    if (!newEventStart || !newEventEnd) {
      setConflicts([])
      return
    }

    setIsChecking(true)
    
    const newStart = new Date(newEventStart)
    const newEnd = new Date(newEventEnd)
    
    const conflictingEvents = events.filter(event => {
      if (event.id === excludeEventId) return false
      if (event.status === 'cancelled') return false
      
      const eventStart = new Date(event.start_time)
      const eventEnd = new Date(event.end_time)
      
      // Check for overlap
      return (newStart < eventEnd && newEnd > eventStart)
    })
    
    setConflicts(conflictingEvents)
    setIsChecking(false)
  }

  const getConflictSeverity = (event: Event) => {
    const newStart = new Date(newEventStart)
    const newEnd = new Date(newEventEnd)
    const eventStart = new Date(event.start_time)
    const eventEnd = new Date(event.end_time)
    
    // Calculate overlap percentage
    const overlapStart = Math.max(newStart.getTime(), eventStart.getTime())
    const overlapEnd = Math.min(newEnd.getTime(), eventEnd.getTime())
    const overlapDuration = Math.max(0, overlapEnd - overlapStart)
    const newEventDuration = newEnd.getTime() - newStart.getTime()
    const overlapPercentage = (overlapDuration / newEventDuration) * 100
    
    if (overlapPercentage > 80) return 'high'
    if (overlapPercentage > 40) return 'medium'
    return 'low'
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  if (isChecking) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Checking for conflicts...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (conflicts.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          No scheduling conflicts detected. Your event time is available.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>{conflicts.length} scheduling conflict{conflicts.length > 1 ? 's' : ''} detected</strong>
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        {conflicts.map(conflict => {
          const severity = getConflictSeverity(conflict)
          return (
            <Card key={conflict.id} className="border-l-4 border-l-destructive">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center space-x-2">
                    {getSeverityIcon(severity)}
                    <span>{conflict.title}</span>
                  </CardTitle>
                  <Badge variant={getSeverityColor(severity)}>
                    {severity} conflict
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <strong>Time:</strong> {formatTime(conflict.start_time)} - {formatTime(conflict.end_time)}
                  </div>
                  {conflict.location && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Location:</strong> {conflict.location}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <strong>Status:</strong> {conflict.status}
                  </div>
                  
                  {onConflictResolve && conflict.id && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => conflict.id && onConflictResolve(conflict.id)}
                      >
                        Resolve Conflict
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-xs text-muted-foreground">
        <strong>Tips:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Consider rescheduling one of the conflicting events</li>
          <li>Check if the events can be combined or merged</li>
          <li>Verify if any events can be moved to a different time slot</li>
          <li>Ensure all participants are available for the new time</li>
        </ul>
      </div>
    </div>
  )
}
