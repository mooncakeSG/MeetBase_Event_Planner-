'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User, Mail, FileText, Loader2, UserCheck } from 'lucide-react'
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
import { AIHelper } from '../events/AIHelper'

const guestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().optional(),
  notes: z.string().optional(),
})

type GuestFormData = z.infer<typeof guestSchema>

interface Guest {
  id?: string
  name: string
  email: string
  role?: string | null
  notes?: string | null
}

interface GuestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Guest) => void
  guest?: Guest | null
  eventName?: string
}

const roleOptions = [
  { value: 'speaker', label: 'Speaker/Presenter' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'attendee', label: 'Attendee' },
  { value: 'vip', label: 'VIP Guest' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'media', label: 'Media/Press' },
  { value: 'staff', label: 'Staff/Volunteer' },
  { value: 'vendor', label: 'Vendor/Supplier' },
  { value: 'partner', label: 'Business Partner' },
  { value: 'other', label: 'Other' },
]

export function GuestModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  guest, 
  eventName = 'your event'
}: GuestModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
  })

  const watchedName = watch('name')
  const watchedEmail = watch('email')
  const watchedRole = watch('role')

  useEffect(() => {
    if (guest) {
      setValue('name', guest.name)
      setValue('email', guest.email)
      setValue('role', guest.role || '')
      setValue('notes', guest.notes || '')
    } else {
      reset()
    }
  }, [guest, reset])

  const handleFormSubmit = async (data: GuestFormData) => {
    setIsLoading(true)
    try {
      onSubmit(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {guest ? 'Edit Guest' : 'Add Guest'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Guest Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Guest Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter guest name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter guest email"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role (Optional)</Label>
            <Select onValueChange={(value) => setValue('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select guest role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <div className="space-y-2">
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Add any special notes about this guest..."
                rows={3}
              />
              <AIHelper
                prompt={`Write professional notes for a ${watchedRole ? roleOptions.find(r => r.value === watchedRole)?.label.toLowerCase() || 'guest' : 'guest'} attending ${eventName}`}
                context={`Guest: ${watchedName || 'Guest'}, Role: ${watchedRole ? roleOptions.find(r => r.value === watchedRole)?.label : 'Not specified'}, Event: ${eventName}`}
                onSuggestion={(suggestion) => setValue('notes', suggestion)}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {guest ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                guest ? 'Update Guest' : 'Add Guest'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
