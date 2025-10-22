# MeetBase API Documentation

## Overview
MeetBase provides a comprehensive REST API for event management, guest handling, email automation, and AI assistance.

**Base URL**: `https://meetbase.app/api` (Production) | `http://localhost:3000/api` (Development)

## Authentication
All API endpoints require proper authentication via Supabase JWT tokens.

```javascript
// Include in request headers
{
  "Authorization": "Bearer <supabase-jwt-token>",
  "Content-Type": "application/json"
}
```

## Rate Limiting
- **General API**: 100 requests/minute per IP
- **Email Sending**: 10 emails/minute per IP
- **AI Chat**: 20 requests/minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 📧 Email API

### Send Email
**POST** `/email/send`

Send emails using configured SMTP or Ethereal for development.

**Request Body:**
```json
{
  "to": "recipient@example.com" | ["email1@example.com", "email2@example.com"],
  "subject": "Email Subject",
  "html": "<p>HTML content</p>",
  "text": "Plain text content (optional)",
  "eventId": "uuid-string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "message-id",
  "accepted": ["recipient@example.com"],
  "rejected": [],
  "previewUrl": "https://ethereal.email/message/..." // Development only
}
```

**Error Responses:**
- `400` - Validation failed
- `429` - Rate limit exceeded
- `500` - Server error

### Resend Email
**POST** `/email/resend`

Resend a previously failed email.

**Request Body:**
```json
{
  "emailId": "uuid-of-failed-email",
  "recipient": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<p>HTML content</p>",
  "text": "Plain text content (optional)",
  "eventId": "uuid-string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "new-message-id",
  "originalEmailId": "uuid-of-original-email"
}
```

---

## 🤖 AI Assistant API

### Chat with BaseMind
**POST** `/ai/chat`

Get AI assistance for MeetBase features.

**Request Body:**
```json
{
  "message": "How do I create a new event?",
  "context": {
    "currentPage": "/dashboard",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Response:**
```json
{
  "response": "To create a new event:\n\n• Go to Events page\n• Click 'Create Event' button\n• Fill in event details...",
  "requestId": "req_1640995200_abc123",
  "timestamp": "2023-12-31T12:00:00.000Z"
}
```

### AI Suggestions
**POST** `/ai/suggest`

Get AI-powered suggestions for event content.

**Request Body:**
```json
{
  "type": "event_title" | "event_description" | "guest_notes",
  "context": {
    "eventType": "meeting",
    "attendees": 10,
    "duration": 60
  }
}
```

**Response:**
```json
{
  "suggestions": [
    "Weekly Team Sync",
    "Project Review Meeting",
    "Sprint Planning Session"
  ]
}
```

---

## 🔍 Debug API

### Supabase Connection Test
**GET** `/debug/supabase`

Test database connectivity and environment variables.

**Response:**
```json
{
  "ok": true,
  "count": 42,
  "env": {
    "hasUrl": true,
    "hasServiceKey": true
  }
}
```

---

## 📊 Data Models

### Event
```typescript
interface Event {
  id: string
  user_id: string
  name: string
  description: string | null
  date: string // ISO 8601
  duration: number // minutes
  location: string | null
  event_password: string | null
  is_public: boolean
  max_attendees: number | null
  created_at: string
  updated_at: string
}
```

### Guest
```typescript
interface Guest {
  id: string
  event_id: string
  name: string
  email: string
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
  invite_link: string | null
  invited_at: string
  responded_at: string | null
  notes: string | null
}
```

### Email Message
```typescript
interface EmailMessage {
  id: string
  created_at: string
  event_id: string | null
  recipient: string
  subject: string
  status: 'sent' | 'failed'
  provider: 'gmail' | 'ethereal' | 'other'
  message_id: string | null
  error: string | null
  resend_of: string | null // UUID of original email
}
```

---

## 🔒 Security

### Input Validation
All inputs are validated using Zod schemas:
- Email addresses must be valid format
- HTML content is sanitized (XSS protection)
- UUIDs are validated for database references
- Rate limiting prevents abuse

### CORS
Production API only accepts requests from:
- `https://meetbase.app`
- `https://www.meetbase.app`

### Error Handling
- Sensitive information is not exposed in error messages
- All errors are logged with request IDs for debugging
- Graceful fallbacks for external service failures

---

## 📝 Example Usage

### JavaScript/TypeScript
```javascript
// Send an email
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseToken}`
  },
  body: JSON.stringify({
    to: 'guest@example.com',
    subject: 'You\'re invited to Team Meeting',
    html: '<p>Join us for our weekly team meeting!</p>',
    eventId: 'event-uuid'
  })
})

const result = await response.json()
```

### cURL
```bash
# Test AI chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I invite guests?"}'

# Send email
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test email</p>"
  }'
```

---

## 🚨 Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check request body format and required fields |
| 401 | Unauthorized | Verify authentication token |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Verify endpoint URL and resource ID |
| 429 | Too Many Requests | Wait for rate limit reset |
| 500 | Internal Server Error | Check server logs and try again |

---

## 📈 Monitoring

### Logging
All API requests are logged with:
- Request ID for tracing
- User ID and IP address
- Request/response details
- Performance metrics
- Error details

### Metrics
Track these key metrics:
- API response times
- Error rates by endpoint
- Rate limit hits
- Email delivery rates
- AI response quality

---

## 🔄 Versioning

Current API version: `v1`

Version is included in response headers:
```
API-Version: 1.0.0
```

---

## 📞 Support

For API support:
- Check the troubleshooting guide
- Review error logs
- Contact development team
- Submit issues on GitHub
