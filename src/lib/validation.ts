import { z } from 'zod'

// Email validation schemas
export const emailSendSchema = z.object({
  to: z.union([
    z.string().email('Invalid email address'),
    z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient required')
  ]),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  html: z.string().min(1, 'HTML content is required'),
  text: z.string().optional(),
  eventId: z.string().uuid('Invalid event ID').optional()
})

export const emailResendSchema = z.object({
  emailId: z.string().uuid('Invalid email ID'),
  recipient: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  html: z.string().min(1, 'HTML content is required'),
  text: z.string().optional(),
  eventId: z.string().uuid('Invalid event ID').optional()
})

// Rate limiting schemas
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identifier required'),
  limit: z.number().int().positive('Limit must be positive'),
  windowMs: z.number().int().positive('Window must be positive')
})

// Email template validation
export const emailTemplateSchema = z.object({
  type: z.enum(['invitation', 'reminder', 'update']),
  eventName: z.string().min(1, 'Event name required'),
  eventDate: z.string().datetime('Invalid date format'),
  eventTime: z.string().optional(),
  eventLocation: z.string().optional(),
  organizerName: z.string().min(1, 'Organizer name required'),
  rsvpLink: z.string().url('Invalid RSVP link'),
  customMessage: z.string().optional()
})

// Validation helper functions
export function validateEmailSend(data: unknown) {
  return emailSendSchema.safeParse(data)
}

export function validateEmailResend(data: unknown) {
  return emailResendSchema.safeParse(data)
}

export function validateEmailTemplate(data: unknown) {
  return emailTemplateSchema.safeParse(data)
}

// Sanitization helpers
export function sanitizeEmailInput(input: string): string {
  return input.trim().toLowerCase()
}

export function sanitizeHtmlContent(html: string): string {
  // Basic HTML sanitization - in production, use a proper HTML sanitizer like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

export function validateEmailAddress(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Rate limiting validation
export function validateRateLimit(identifier: string, limit: number, windowMs: number) {
  return rateLimitSchema.safeParse({ identifier, limit, windowMs })
}
