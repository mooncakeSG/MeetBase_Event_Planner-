// Client-safe email service (no Node.js dependencies)
export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EventInvitationData {
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation?: string
  eventDescription?: string
  organizerName: string
  rsvpLink: string
  eventPassword?: string
}

export interface RSVPReminderData {
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation?: string
  rsvpLink: string
  daysUntilEvent: number
}

export interface EventUpdateData {
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation?: string
  changes: string[]
  rsvpLink: string
}

class EmailClientService {
  // Event Invitation Template
  generateEventInvitation(data: EventInvitationData): EmailTemplate {
    const { eventName, eventDate, eventTime, eventLocation, eventDescription, organizerName, rsvpLink, eventPassword } = data
    
    const subject = `You're invited to ${eventName}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Invitation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000; margin: 0; padding: 0; background: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 40px 30px; text-align: center; }
          .content { background: #fff; padding: 40px 30px; }
          .event-details { background: #f8f9fa; border: 1px solid #e9ecef; padding: 24px; margin: 24px 0; }
          .cta-button { display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0; font-weight: 500; border: none; cursor: pointer; text-align: center; min-width: 120px; }
          .footer { text-align: center; margin-top: 40px; color: #6c757d; font-size: 14px; }
          .password { background: #f8f9fa; border: 1px solid #e9ecef; padding: 12px; border-radius: 6px; margin: 12px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Invited</h1>
            <p>${organizerName} has invited you to an event</p>
          </div>
          
          <div class="content">
            <div class="event-details">
              <h2>${eventName}</h2>
              <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${eventTime}</p>
              ${eventLocation ? `<p><strong>Location:</strong> ${eventLocation}</p>` : ''}
              ${eventDescription ? `<p><strong>Description:</strong> ${eventDescription}</p>` : ''}
              ${eventPassword ? `
                <div class="password">
                  <strong>Event Password:</strong> ${eventPassword}
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${rsvpLink}" class="cta-button">RSVP Now</a>
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Please respond by clicking the button above. We look forward to seeing you there!
            </p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent by MeetBase Event Management</p>
            <p>If you have any questions, please contact the event organizer.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      You're invited to ${eventName}
      
      Date: ${new Date(eventDate).toLocaleDateString()}
      Time: ${eventTime}
      ${eventLocation ? `Location: ${eventLocation}` : ''}
      ${eventDescription ? `Description: ${eventDescription}` : ''}
      ${eventPassword ? `Event Password: ${eventPassword}` : ''}
      
      RSVP Link: ${rsvpLink}
      
      Please respond by clicking the link above. We look forward to seeing you there!
      
      This invitation was sent by MeetBase Event Management.
    `

    return { subject, html, text }
  }

  // RSVP Reminder Template
  generateRSVPReminder(data: RSVPReminderData): EmailTemplate {
    const { eventName, eventDate, eventTime, eventLocation, rsvpLink, daysUntilEvent } = data
    
    const subject = `Reminder: ${eventName} in ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Reminder</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000; margin: 0; padding: 0; background: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 40px 30px; text-align: center; }
          .content { background: #fff; padding: 40px 30px; }
          .event-details { background: #f8f9fa; border: 1px solid #e9ecef; padding: 24px; margin: 24px 0; }
          .cta-button { display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0; font-weight: 500; border: none; cursor: pointer; text-align: center; min-width: 120px; }
          .footer { text-align: center; margin-top: 40px; color: #6c757d; font-size: 14px; }
          .urgent { background: #f8f9fa; border: 1px solid #e9ecef; padding: 16px; border-radius: 6px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Reminder</h1>
            <p>Don't forget about your upcoming event</p>
          </div>
          
          <div class="content">
            ${daysUntilEvent <= 1 ? `
              <div class="urgent">
                <strong>URGENT:</strong> This event is ${daysUntilEvent === 0 ? 'today' : 'tomorrow'}
              </div>
            ` : ''}
            
            <div class="event-details">
              <h2>${eventName}</h2>
              <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${eventTime}</p>
              ${eventLocation ? `<p><strong>Location:</strong> ${eventLocation}</p>` : ''}
              <p><strong>Time Remaining:</strong> ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${rsvpLink}" class="cta-button">Update RSVP</a>
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Please confirm your attendance by clicking the button above.
            </p>
          </div>
          
          <div class="footer">
            <p>This reminder was sent by MeetBase Event Management</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Event Reminder: ${eventName}
      
      Date: ${new Date(eventDate).toLocaleDateString()}
      Time: ${eventTime}
      ${eventLocation ? `Location: ${eventLocation}` : ''}
      Time Remaining: ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''}
      
      RSVP Link: ${rsvpLink}
      
      Please confirm your attendance by clicking the link above.
      
      This reminder was sent by MeetBase Event Management.
    `

    return { subject, html, text }
  }

  // Event Update Template
  generateEventUpdate(data: EventUpdateData): EmailTemplate {
    const { eventName, eventDate, eventTime, eventLocation, changes, rsvpLink } = data
    
    const subject = `Update: ${eventName}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000; margin: 0; padding: 0; background: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 40px 30px; text-align: center; }
          .content { background: #fff; padding: 40px 30px; }
          .event-details { background: #f8f9fa; border: 1px solid #e9ecef; padding: 24px; margin: 24px 0; }
          .changes { background: #f8f9fa; border: 1px solid #e9ecef; padding: 16px; margin: 16px 0; }
          .cta-button { display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0; font-weight: 500; border: none; cursor: pointer; text-align: center; min-width: 120px; }
          .footer { text-align: center; margin-top: 40px; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Update</h1>
            <p>Important changes to your event</p>
          </div>
          
          <div class="content">
            <div class="event-details">
              <h2>${eventName}</h2>
              <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${eventTime}</p>
              ${eventLocation ? `<p><strong>Location:</strong> ${eventLocation}</p>` : ''}
            </div>
            
            <div class="changes">
              <h3>Changes Made:</h3>
              <ul>
                ${changes.map(change => `<li>${change}</li>`).join('')}
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${rsvpLink}" class="cta-button">View Updated Event</a>
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Please review the changes and update your RSVP if needed.
            </p>
          </div>
          
          <div class="footer">
            <p>This update was sent by MeetBase Event Management</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Event Update: ${eventName}
      
      Date: ${new Date(eventDate).toLocaleDateString()}
      Time: ${eventTime}
      ${eventLocation ? `Location: ${eventLocation}` : ''}
      
      Changes Made:
      ${changes.map(change => `- ${change}`).join('\n')}
      
      RSVP Link: ${rsvpLink}
      
      Please review the changes and update your RSVP if needed.
      
      This update was sent by MeetBase Event Management.
    `

    return { subject, html, text }
  }

  // Send email via API route
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // Bulk email method
  async sendBulkEmails(recipients: string[], template: EmailTemplate): Promise<{ sent: number; failed: number }> {
    let sent = 0
    let failed = 0

    for (const recipient of recipients) {
      const success = await this.sendEmail(recipient, template)
      if (success) {
        sent++
      } else {
        failed++
      }
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return { sent, failed }
  }
}

export const emailClientService = new EmailClientService()
