import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null

// Ensure Node.js runtime for this API route
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { emailId, recipient, subject, html, text, eventId } = await request.json()

    // Validation
    if (!emailId || !recipient || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: emailId, recipient, subject, html' },
        { status: 400 }
      )
    }

    // Verify the email exists and is failed
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      )
    }

    const { data: originalEmail, error: fetchError } = await supabase
      .from('email_messages')
      .select('*')
      .eq('id', emailId)
      .single()

    if (fetchError || !originalEmail) {
      return NextResponse.json(
        { error: 'Email record not found' },
        { status: 404 }
      )
    }

    if (originalEmail.status !== 'failed') {
      return NextResponse.json(
        { error: 'Can only resend failed emails' },
        { status: 400 }
      )
    }

    // Set up email transporter
    const emailHost = process.env.EMAIL_HOST
    const emailPort = process.env.EMAIL_PORT
    const emailSecure = process.env.EMAIL_SECURE === 'true'
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS
    const emailFrom = process.env.EMAIL_FROM || 'MeetBase <noreply@meetbase.com>'

    let transporter
    let emailProvider = 'unknown'

    if (emailHost && emailPort && emailUser && emailPass) {
      // Use provided SMTP settings (e.g., Gmail)
      transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort),
        secure: emailSecure,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      })
      emailProvider = 'gmail'
    } else {
      // Fallback to Ethereal for development
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
      emailProvider = 'ethereal'
    }

    // Send the email
    const result = await transporter.sendMail({
      from: emailFrom,
      to: recipient,
      subject: `[RESEND] ${subject}`, // Mark as resend
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    })

    // Log the resend attempt
    const { error: logError } = await supabase.from('email_messages').insert({
      event_id: eventId,
      recipient: recipient,
      subject: `[RESEND] ${subject}`,
      status: 'sent',
      provider: emailProvider,
      message_id: result.messageId,
      error: null,
      resend_of: emailId, // Track the original email this is resending
    })

    if (logError) {
      console.error('Supabase resend log error:', logError)
    }

    // Update original email record to mark as resent
    const { error: updateError } = await supabase
      .from('email_messages')
      .update({ 
        error: `Resent successfully at ${new Date().toISOString()}` 
      })
      .eq('id', emailId)

    if (updateError) {
      console.error('Supabase update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      provider: emailProvider,
      originalEmailId: emailId
    })

  } catch (error) {
    console.error('Email resend error:', error)

    // Log the failed resend attempt
    if (supabase) {
      try {
        const { emailId, recipient, subject, eventId } = await request.json()
        const { error: logError } = await supabase.from('email_messages').insert({
          event_id: eventId,
          recipient: recipient,
          subject: `[RESEND FAILED] ${subject}`,
          status: 'failed',
          provider: 'unknown',
          message_id: null,
          error: `Resend failed: ${(error as Error).message}`,
        })
        if (logError) {
          console.error('Supabase resend failure log error:', logError)
        }
      } catch (logErr) {
        console.error('Failed to log resend failure:', logErr)
      }
    }

    return NextResponse.json(
      { error: 'Failed to resend email', details: (error as Error).message },
      { status: 500 }
    )
  }
}
