'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock, MapPin, Users, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AIHelper } from './AIHelper'
import { ConflictDetector } from '@/components/calendar/ConflictDetector'

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.string().min(1, 'Duration is required'),
  location: z.string().optional(),
  is_public: z.boolean(),
  max_attendees: z.string().optional(),
  event_password: z.string().optional(),
})

type EventFormData = z.infer<typeof eventSchema>

interface Event {
  id?: string
  name: string
  description?: string | null
  date: string
  duration: number
  location?: string | null
  is_public: boolean
  max_attendees?: number | null
  event_password?: string | null
  created_at?: string
  updated_at?: string
  user_id?: string
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Event) => void
  event?: Event | null
  title?: string
  existingEvents?: Array<{
    id: string
    name: string
    start_time: string
    end_time: string
    location?: string
    status: 'draft' | 'published' | 'cancelled'
  }>
}

const durationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
  { value: '480', label: '8 hours' },
]

export function EventModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  event, 
  title = 'Create Event',
  existingEvents = []
}: EventModalProps) {
  const [isPublic, setIsPublic] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      is_public: false,
    },
  })

  const watchedName = watch('name')
  const watchedDescription = watch('description')
  const watchedDate = watch('date')
  const watchedTime = watch('time')
  const watchedDuration = watch('duration')

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date)
      setValue('name', event.name)
      setValue('description', event.description || '')
      setValue('date', format(eventDate, 'yyyy-MM-dd'))
      setValue('time', format(eventDate, 'HH:mm'))
      setValue('duration', event.duration.toString())
      setValue('location', event.location || '')
      setValue('is_public', event.is_public)
      setValue('max_attendees', event.max_attendees?.toString() || '')
      setValue('event_password', event.event_password || '')
      setIsPublic(event.is_public)
    } else {
      reset()
      setIsPublic(false)
    }
  }, [event, setValue, reset])

  const handleFormSubmit = (data: EventFormData) => {
    const eventDate = new Date(`${data.date}T${data.time}`)
    
    const eventData: Event = {
      id: event?.id,
      name: data.name,
      description: data.description || null,
      date: eventDate.toISOString(),
      duration: parseInt(data.duration),
      location: data.location || null,
      is_public: data.is_public,
      max_attendees: data.max_attendees ? parseInt(data.max_attendees) : null,
      event_password: data.event_password || null,
    }

    onSubmit(eventData)
    onClose()
  }

  const handleClose = () => {
    reset()
    setIsPublic(false)
    setShowPassword(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Event Name with AI Helper */}
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <div className="space-y-2">
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter event name"
                className={errors.name ? 'border-destructive' : ''}
              />
              <AIHelper
                prompt={`Suggest 3 professional names for a ${watchedName || 'business'} event`}
                context={watchedDescription || 'General event planning'}
                onSuggestion={(suggestion) => setValue('name', suggestion)}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description with AI Helper */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="space-y-2">
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your event..."
                rows={3}
              />
              <AIHelper
                prompt={`Write a professional description for a ${watchedName || 'business'} event`}
                context={watchedDescription || 'General event planning'}
                onSuggestion={(suggestion) => setValue('description', suggestion)}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                {...register('time')}
                className={errors.time ? 'border-destructive' : ''}
              />
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Duration and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Select onValueChange={(value) => setValue('duration', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Event location"
              />
            </div>
          </div>

          {/* Conflict Detection */}
          {watchedDate && watchedTime && watchedDuration && (
            <div className="space-y-2">
              <Label>Schedule Conflicts</Label>
              <ConflictDetector
                events={existingEvents}
                newEventStart={watchedDate && watchedTime ? `${watchedDate}T${watchedTime}` : ''}
                newEventEnd={watchedDate && watchedTime && watchedDuration ? 
                  new Date(new Date(`${watchedDate}T${watchedTime}`).getTime() + parseInt(watchedDuration) * 60 * 1000).toISOString() : ''
                }
                excludeEventId={event?.id}
              />
            </div>
          )}

          {/* Event Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                checked={isPublic}
                onChange={(e) => {
                  setIsPublic(e.target.checked)
                  setValue('is_public', e.target.checked)
                }}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_public">Make this event public</Label>
            </div>

            {!isPublic && (
              <div className="space-y-2">
                <Label htmlFor="event_password">Event Password (Optional)</Label>
                <Input
                  id="event_password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('event_password')}
                  placeholder="Set a password for this event"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show_password"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="show_password" className="text-sm">
                    Show password
                  </Label>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="max_attendees">Max Attendees (Optional)</Label>
              <Input
                id="max_attendees"
                type="number"
                {...register('max_attendees')}
                placeholder="Maximum number of attendees"
                min="1"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
