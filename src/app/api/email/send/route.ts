import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { validateEmailSend, sanitizeHtmlContent } from '@/lib/validation'
import { logger, PerformanceMonitor, generateRequestId } from '@/lib/logger'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limiter'

// Ensure this route runs on the Node.js runtime (not edge)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const clientIdentifier = getClientIdentifier(request)
  const monitor = new PerformanceMonitor({ requestId, ip: clientIdentifier })
  
  try {
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(clientIdentifier, RATE_LIMITS.EMAIL_SEND)
    if (!rateLimitResult.allowed) {
      logger.rateLimitExceeded(clientIdentifier, RATE_LIMITS.EMAIL_SEND.limit, { requestId })
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateEmailSend(body)
    
    if (!validation.success) {
      logger.warn('Email send validation failed', { requestId }, { 
        errors: validation.error.issues,
        body: { to: body.to, subject: body.subject?.substring(0, 50) }
      })
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { to, subject, html, text, eventId } = validation.data

    // Sanitize HTML content
    const sanitizedHtml = sanitizeHtmlContent(html)

    const envHost = process.env.EMAIL_HOST
    const envPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined
    const envSecure = process.env.EMAIL_SECURE === 'true' || (envPort === 465)
    const envUser = process.env.EMAIL_USER
    const envPass = process.env.EMAIL_PASS

    let transporter: nodemailer.Transporter

    if (envHost && envPort && envUser && envPass) {
      // Use configured SMTP
      transporter = nodemailer.createTransport({
        host: envHost,
        port: envPort,
        secure: envSecure,
        auth: { user: envUser, pass: envPass },
      })
    } else {
      // Fallback: create an Ethereal test account for development
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
    }

    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'MeetBase <noreply@meetbase.com>',
      to,
      subject,
      html: sanitizedHtml,
      text: text || sanitizedHtml.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    })

    const previewUrl = nodemailer.getTestMessageUrl?.(result)

    // Log successful email send
    logger.emailSent(
      Array.isArray(to) ? to.join(', ') : to,
      subject,
      eventId,
      result.messageId,
      { requestId }
    )

    // Log to Supabase (if env available)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const provider = envHost ? 'gmail' : 'ethereal'
        await supabase.from('email_messages').insert({
          event_id: eventId || null,
          recipient: to,
          subject,
          status: 'sent',
          provider,
          message_id: result.messageId,
          error: null,
        })
      }
    } catch (logErr) {
      console.error('Email log write failed:', logErr)
    }

    monitor.end('Email sent successfully', { 
      messageId: result.messageId,
      provider: envHost ? 'gmail' : 'ethereal'
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      previewUrl: previewUrl || undefined,
    })

  } catch (error) {
    const errorMessage = (error as Error).message
    
    // Log email failure
    logger.emailFailed(
      'unknown', // We don't have recipient info in error case
      'unknown',
      error as Error,
      undefined,
      { requestId }
    )

    // Attempt to log failure to Supabase
    try {
      const body = await request.json().catch(() => ({}))
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        await supabase.from('email_messages').insert({
          event_id: body?.eventId || null,
          recipient: body?.to || 'unknown',
          subject: body?.subject || 'unknown',
          status: 'failed',
          provider: process.env.EMAIL_HOST ? 'gmail' : 'ethereal',
          message_id: null,
          error: errorMessage,
        })
      }
    } catch (logErr) {
      logger.error('Email failure log write failed', logErr as Error, { requestId })
    }

    monitor.endWithError('Email send failed', error as Error)

    return NextResponse.json({ error: 'Failed to send email', details: errorMessage }, { status: 500 })
  }
}
