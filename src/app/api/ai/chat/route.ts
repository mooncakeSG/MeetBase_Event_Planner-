import { NextRequest, NextResponse } from 'next/server'
import { logger, PerformanceMonitor, generateRequestId } from '@/lib/logger'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limiter'

// Ensure Node.js runtime for this API route
export const runtime = 'nodejs'

// BaseMind system prompt
const SYSTEM_PROMPT = `You are BaseMind, the in-app AI assistant for MeetBase. You help users understand and navigate MeetBase by providing clear, concise instructions. 

MeetBase is an AI-powered event management platform with these key features:
- Event creation and management
- Guest invitations and RSVP tracking
- Email templates and bulk sending
- Calendar integration and scheduling
- Analytics and reporting
- AI-powered suggestions for event content

Your behavior rules:
- Answer directly without small talk
- Use short bullet points for clarity
- Stay strictly within MeetBase's functionality
- Avoid speculation or off-topic replies
- Keep responses under 100 words
- Use direct verbs and short responses
- Summarize in steps, not paragraphs

If a feature doesn't exist, say: "That feature is in development. Check Settings → Feedback for updates."

Current MeetBase pages and features:
- Dashboard: Overview of events and quick actions
- Events: Create, edit, and manage events
- Guests: Manage guest lists and invitations
- Analytics: View event performance metrics
- Email: Send invitations, reminders, and updates
- Calendar: View events in calendar format
- Settings: User preferences and configuration

Always provide step-by-step guidance for MeetBase features.`

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const clientIdentifier = getClientIdentifier(request)
  const monitor = new PerformanceMonitor({ requestId, ip: clientIdentifier })

  try {
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(clientIdentifier, RATE_LIMITS.API_GENERAL)
    if (!rateLimitResult.allowed) {
      logger.rateLimitExceeded(clientIdentifier, RATE_LIMITS.API_GENERAL.limit, { requestId })
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    const body = await request.json()
    const { message, context } = body

    if (!message || typeof message !== 'string') {
      logger.warn('Invalid chat request', { requestId }, { body })
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Log the chat request
    logger.info('BaseMind chat request', { requestId }, {
      message: message.substring(0, 100),
      currentPage: context?.currentPage
    })

    // Check if OpenAI integration is enabled
    const openaiApiKey = process.env.OPENAI_API_KEY
    const openaiModel = process.env.OPENAI_MODEL || 'openai/gpt-oss-20b'
    
    let response: string
    
    if (openaiApiKey && process.env.AI_ASSISTANT_ENABLED === 'true') {
      // Use actual AI API
      response = await callOpenAI(message, context, openaiApiKey, openaiModel)
    } else {
      // Fallback to rule-based responses
      response = generateBaseMindResponse(message, context)
    }

    logger.info('BaseMind chat response generated', { requestId }, {
      responseLength: response.length
    })

    monitor.end('BaseMind chat completed', { 
      messageLength: message.length,
      responseLength: response.length
    })

    return NextResponse.json({
      response,
      requestId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('BaseMind chat error', error as Error, { requestId })
    monitor.endWithError('BaseMind chat failed', error as Error)

    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

// OpenAI/Groq API integration
async function callOpenAI(message: string, context: any, apiKey: string, model: string): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Current page: ${context?.currentPage || 'unknown'}\n\nUser question: ${message}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'
    
  } catch (error) {
    console.error('OpenAI API call failed:', error)
    // Fallback to rule-based response
    return generateBaseMindResponse(message, context)
  }
}

// Rule-based response system (fallback)
function generateBaseMindResponse(message: string, context?: any): string {
  const lowerMessage = message.toLowerCase()

  // Event creation
  if (lowerMessage.includes('create') && lowerMessage.includes('event')) {
    return `To create a new event:

• Go to Events page
• Click "Create Event" button
• Fill in event details (name, date, time, location)
• Add description and set duration
• Click "Save Event"
• Use AI suggestions for better content`
  }

  // Guest invitations
  if (lowerMessage.includes('invite') && lowerMessage.includes('guest')) {
    return `To invite guests:

• Open your event from Events page
• Click "Add Guests" or go to Guests page
• Enter guest email addresses
• Add names and optional notes
• Click "Send Invitations"
• Track RSVP status in Guests page`
  }

  // Email sending
  if (lowerMessage.includes('email') || lowerMessage.includes('send')) {
    return `To send emails:

• Go to Email page
• Select your event
• Choose template (Invitation, Reminder, Update)
• Customize subject and message
• Click "Send" or "Send Test"
• View delivery status in Email History`
  }

  // Calendar view
  if (lowerMessage.includes('calendar') || lowerMessage.includes('view')) {
    return `To view calendar:

• Go to Calendar page
• See monthly view of all events
• Click on events to edit
• Use navigation arrows to change months
• Click empty dates to create events
• Export events as .ics files`
  }

  // Analytics
  if (lowerMessage.includes('analytics') || lowerMessage.includes('report')) {
    return `To view analytics:

• Go to Analytics page
• See event performance metrics
• View guest engagement data
• Check email delivery rates
• Export reports as CSV
• Track attendance trends`
  }

  // Settings
  if (lowerMessage.includes('setting') || lowerMessage.includes('preference')) {
    return `To access settings:

• Go to Settings page
• Update your profile information
• Configure notification preferences
• Manage email templates
• Set timezone and language
• View account details`
  }

  // AI suggestions
  if (lowerMessage.includes('ai') || lowerMessage.includes('suggest')) {
    return `AI features in MeetBase:

• Event name and description suggestions
• Smart guest role recommendations
• Email template customization
• Scheduling conflict detection
• Performance insights
• Automated reminders`
  }

  // Navigation help
  if (lowerMessage.includes('where') || lowerMessage.includes('find')) {
    return `MeetBase navigation:

• Dashboard: Main overview page
• Events: Create and manage events
• Guests: Manage guest lists
• Analytics: View performance data
• Email: Send invitations and updates
• Calendar: Monthly event view
• Settings: Account preferences`
  }

  // Tips
  if (lowerMessage.includes('tip') || lowerMessage.includes('help')) {
    return `MeetBase tips:

• Use AI suggestions for better event content
• Set up email templates for consistency
• Track guest responses in real-time
• Export data for external analysis
• Use calendar view for scheduling
• Enable notifications for updates`
  }

  // Default response
  return `I can help you with MeetBase features:

• Creating and managing events
• Inviting guests and tracking RSVPs
• Sending email invitations
• Viewing calendar and analytics
• Using AI suggestions
• Navigating the interface

What specific feature would you like help with?`
}
