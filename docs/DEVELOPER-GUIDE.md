# MeetBase Developer Guide

## 🛠️ Development Overview

This guide is for developers who want to contribute to MeetBase or understand the codebase architecture.

---

## 🏗️ Architecture Overview

### **System Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Python 3.9+   │    │ • PostgreSQL    │
│ • TypeScript    │    │ • FastAPI       │    │ • Real-time     │
│ • TailwindCSS   │    │ • Pydantic      │    │ • Auth          │
│ • ShadCN/UI     │    │ • Groq AI       │    │ • Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Technology Stack**

#### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + ShadCN/UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Fetch API
- **Authentication**: Supabase Auth

#### **Backend**
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Groq API
- **Validation**: Pydantic
- **Authentication**: JWT with Supabase
- **Logging**: Structured logging

#### **Infrastructure**
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Supabase
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in logging + external services

---

## 📁 Project Structure

```
event-planner/
├── src/                          # Frontend source code
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes (Next.js)
│   │   │   ├── ai/               # AI assistant endpoints
│   │   │   ├── email/            # Email system endpoints
│   │   │   └── debug/            # Debug and monitoring
│   │   ├── dashboard/            # Dashboard pages
│   │   ├── events/               # Event management pages
│   │   ├── guests/               # Guest management pages
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── settings/             # User settings
│   │   ├── test-validation/      # Testing utilities
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── components/               # React components
│   │   ├── ai/                   # AI assistant components
│   │   │   └── BaseMind.tsx      # Main AI chat component
│   │   ├── auth/                 # Authentication components
│   │   │   ├── AuthModal.tsx     # Login/signup modal
│   │   │   ├── AuthProvider.tsx  # Auth context provider
│   │   │   └── EnvCheck.tsx      # Environment debugging
│   │   ├── calendar/             # Calendar components
│   │   │   ├── CalendarView.tsx  # Monthly calendar
│   │   │   └── ConflictDetector.tsx # Scheduling conflicts
│   │   ├── email/                # Email management
│   │   │   ├── EmailManager.tsx  # Main email interface
│   │   │   ├── EmailTemplates.tsx # Template selection
│   │   │   └── EmailHistory.tsx  # Email tracking
│   │   ├── events/               # Event management
│   │   │   ├── EventCard.tsx     # Event display
│   │   │   ├── EventModal.tsx    # Create/edit events
│   │   │   └── AIHelper.tsx      # AI suggestions
│   │   ├── guests/               # Guest management
│   │   │   ├── GuestList.tsx     # Guest display
│   │   │   └── GuestModal.tsx    # Add/edit guests
│   │   ├── layout/               # Layout components
│   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   ├── Navbar.tsx        # Top navigation
│   │   │   └── MainLayout.tsx    # Main layout wrapper
│   │   └── ui/                   # ShadCN/UI components
│   │       ├── button.tsx        # Button component
│   │       ├── card.tsx          # Card component
│   │       ├── dialog.tsx        # Modal component
│   │       ├── input.tsx         # Input component
│   │       ├── sonner.tsx        # Toast notifications
│   │       └── ...               # Other UI components
│   └── lib/                      # Utility libraries
│       ├── supabase.ts           # Supabase client
│       ├── auth.ts               # Authentication utilities
│       ├── store.ts              # Zustand store
│       ├── calendar.ts           # Calendar utilities
│       ├── email-client.ts       # Email service client
│       ├── validation.ts         # Zod validation schemas
│       ├── logger.ts             # Structured logging
│       └── rate-limiter.ts       # Rate limiting
├── backend/                      # Backend source code
│   ├── main.py                   # FastAPI application
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Backend environment
│   └── setup_env.py              # Environment setup helper
├── docs/                         # Documentation
│   ├── API.md                    # API documentation
│   ├── USER-GUIDE.md             # User manual
│   ├── DEPLOYMENT.md             # Deployment guide
│   ├── ENVIRONMENT-SETUP.md      # Setup instructions
│   ├── TROUBLESHOOTING.md        # Troubleshooting guide
│   └── DEVELOPER-GUIDE.md        # This file
├── supabase-schema.sql           # Database schema
├── stability-test.js             # Stability testing
├── STABILITY-CHECKLIST.md        # Testing checklist
├── .env.local                    # Frontend environment
├── package.json                  # Node.js dependencies
├── tailwind.config.js            # TailwindCSS config
├── next.config.js                # Next.js config
└── README.md                     # Project overview
```

---

## 🔧 Development Setup

### **Prerequisites**
```bash
# Required software
node --version    # v18.0.0+
python --version  # v3.9.0+
git --version     # Latest
```

### **Environment Setup**
```bash
# Clone repository
git clone https://github.com/your-username/meetbase.git
cd meetbase

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Set up environment variables
cp env.local.example_frontend .env.local
cp env.example_backend backend/.env
```

### **Development Servers**
```bash
# Terminal 1: Frontend
npm run dev
# → http://localhost:3000

# Terminal 2: Backend
cd backend
python main.py
# → http://localhost:8000
```

---

## 🎯 Core Components

### **Authentication System**

#### **AuthProvider Component**
```typescript
// src/components/auth/AuthProvider.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state
    initializeAuth(setUser, setLoading)
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

#### **Authentication Flow**
1. **User signs up/in** via Supabase Auth
2. **JWT token** is stored in localStorage
3. **AuthProvider** manages global auth state
4. **Protected routes** check authentication
5. **API calls** include JWT in headers

### **Event Management**

#### **Event Creation Flow**
```typescript
// src/components/events/EventModal.tsx
const createEvent = async (data: EventFormData) => {
  // 1. Validate input
  const validation = eventSchema.safeParse(data)
  if (!validation.success) return

  // 2. Check for conflicts
  const conflicts = await checkConflicts(data.date, data.duration)
  if (conflicts.length > 0) {
    setConflicts(conflicts)
    return
  }

  // 3. Create event
  const event = await calendarService.createEvent(validation.data)
  
  // 4. Update UI
  setEvents(prev => [...prev, event])
  toast.success('Event created successfully!')
}
```

#### **AI Integration**
```typescript
// src/components/events/AIHelper.tsx
const getAISuggestions = async (type: string, context: any) => {
  const response = await fetch('/api/ai/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, context })
  })
  
  return response.json()
}
```

### **Email System**

#### **Email Service Architecture**
```typescript
// src/lib/email-client.ts
export class EmailService {
  async sendEmail(data: EmailData) {
    // 1. Validate input
    const validation = emailSendSchema.safeParse(data)
    if (!validation.success) throw new Error('Invalid email data')

    // 2. Generate template
    const template = this.generateTemplate(data.template, data.variables)
    
    // 3. Send via API
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validation.data,
        html: template
      })
    })

    return response.json()
  }
}
```

#### **Email API Route**
```typescript
// src/app/api/email/send/route.ts
export async function POST(request: NextRequest) {
  // 1. Rate limiting check
  const rateLimitResult = await checkRateLimit(clientIdentifier, RATE_LIMITS.EMAIL_SEND)
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // 2. Validate request
  const validation = validateEmailSend(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  }

  // 3. Send email
  const result = await transporter.sendMail({
    from: emailFrom,
    to: validation.data.to,
    subject: validation.data.subject,
    html: sanitizeHtmlContent(validation.data.html)
  })

  // 4. Log to database
  await logEmailToSupabase(result, validation.data.eventId)

  return NextResponse.json({ success: true, messageId: result.messageId })
}
```

### **AI Assistant (BaseMind)**

#### **Chat Component**
```typescript
// src/components/ai/BaseMind.tsx
export function BaseMind() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const sendMessage = async (message: string) => {
    // 1. Add user message
    const userMessage = { role: 'user', content: message, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])

    // 2. Get AI response
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: { currentPage: window.location.pathname }
      })
    })

    const data = await response.json()
    
    // 3. Add AI response
    const aiMessage = { role: 'assistant', content: data.response, timestamp: new Date() }
    setMessages(prev => [...prev, aiMessage])
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat button and window */}
    </div>
  )
}
```

#### **AI API Route**
```typescript
// src/app/api/ai/chat/route.ts
export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const rateLimitResult = await checkRateLimit(clientIdentifier, RATE_LIMITS.AI_CHAT)
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // 2. Validate request
  const validation = validateAIChatRequest(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  }

  // 3. Get AI response
  let response: string
  if (openaiApiKey && process.env.AI_ASSISTANT_ENABLED === 'true') {
    response = await callOpenAI(validation.data.message, validation.data.context)
  } else {
    response = generateBaseMindResponse(validation.data.message, validation.data.context)
  }

  return NextResponse.json({ response })
}
```

---

## 🗄️ Database Schema

### **Core Tables**

#### **Users Table**
```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Events Table**
```sql
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  event_password TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  max_attendees INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Guests Table**
```sql
CREATE TABLE public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled')),
  invite_link TEXT,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);
```

#### **Email Messages Table**
```sql
CREATE TABLE public.email_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  provider TEXT NOT NULL,
  message_id TEXT,
  error TEXT,
  resend_of UUID REFERENCES public.email_messages(id) ON DELETE SET NULL
);
```

### **Row Level Security (RLS)**
```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 🔒 Security Implementation

### **Input Validation**
```typescript
// src/lib/validation.ts
export const emailSendSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(150),
  html: z.string().min(1),
  text: z.string().optional(),
  eventId: z.string().uuid().optional(),
})

export function sanitizeHtmlContent(html: string): string {
  return purify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onmouseover'],
    ALLOW_DATA_ATTR: false,
  })
}
```

### **Rate Limiting**
```typescript
// src/lib/rate-limiter.ts
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const now = Date.now()
  let entry = rateLimitStore.get(identifier)

  if (!entry || now - entry.lastReset > config.windowMs) {
    entry = { count: 0, lastReset: now }
    rateLimitStore.set(identifier, entry)
  }

  entry.count++
  const allowed = entry.count <= config.limit

  return {
    allowed,
    headers: {
      'X-RateLimit-Limit': config.limit.toString(),
      'X-RateLimit-Remaining': (config.limit - entry.count).toString(),
      'X-RateLimit-Reset': Math.ceil((config.windowMs - (now - entry.lastReset)) / 1000).toString(),
    }
  }
}
```

### **Structured Logging**
```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    log('info', message, null, context)
  },
  error: (message: string, error: Error, context?: Record<string, any>) => {
    log('error', message, error, context)
  },
  emailSent: (recipient: string, subject: string, eventId?: string, messageId?: string) => {
    logger.info('Email sent', { recipient, subject, eventId, messageId })
  },
  emailFailed: (recipient: string, subject: string, error: Error, eventId?: string) => {
    logger.error('Email failed to send', error, { recipient, subject, eventId })
  }
}
```

---

## 🧪 Testing Strategy

### **Unit Testing**
```typescript
// Example test for email validation
describe('Email Validation', () => {
  it('should validate correct email format', () => {
    const validEmail = 'test@example.com'
    const result = emailSchema.safeParse(validEmail)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email format', () => {
    const invalidEmail = 'invalid-email'
    const result = emailSchema.safeParse(invalidEmail)
    expect(result.success).toBe(false)
  })
})
```

### **Integration Testing**
```typescript
// Example API test
describe('Email API', () => {
  it('should send email successfully', async () => {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>'
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

### **E2E Testing**
```typescript
// Example Playwright test
test('should create and manage events', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Login
  await page.click('[data-testid="login-button"]')
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'password')
  await page.click('[data-testid="submit-button"]')
  
  // Create event
  await page.click('[data-testid="create-event-button"]')
  await page.fill('[data-testid="event-name"]', 'Test Event')
  await page.fill('[data-testid="event-date"]', '2024-01-01')
  await page.click('[data-testid="save-event"]')
  
  // Verify event created
  await expect(page.locator('[data-testid="event-card"]')).toContainText('Test Event')
})
```

---

## 🚀 Performance Optimization

### **Frontend Optimization**
```typescript
// Code splitting
const EventModal = lazy(() => import('@/components/events/EventModal'))

// Image optimization
import Image from 'next/image'
<Image src="/logo.png" alt="Logo" width={200} height={80} priority />

// Memoization
const MemoizedEventCard = memo(EventCard)

// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window'
```

### **Backend Optimization**
```python
# Database connection pooling
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20
)

# Caching
from functools import lru_cache

@lru_cache(maxsize=128)
def get_user_events(user_id: str):
    # Cached database query
    pass

# Async operations
async def send_email_async(email_data: dict):
    # Non-blocking email sending
    pass
```

### **Database Optimization**
```sql
-- Indexes for performance
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_guests_event_id ON public.guests(event_id);
CREATE INDEX idx_email_messages_created_at ON public.email_messages(created_at);

-- Query optimization
EXPLAIN ANALYZE SELECT * FROM events 
WHERE user_id = $1 AND date >= NOW() 
ORDER BY date ASC;
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint
      
      - name: Build application
        run: npm run build

  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy to production environment
          echo "Deploying to production..."
```

---

## 📊 Monitoring & Observability

### **Application Metrics**
```typescript
// Performance monitoring
export class PerformanceMonitor {
  private startTime: [number, number]
  private requestId: string

  constructor({ requestId }: { requestId: string }) {
    this.requestId = requestId
    this.startTime = process.hrtime()
  }

  end(message: string, context?: Record<string, any>) {
    const endTime = process.hrtime(this.startTime)
    const durationMs = (endTime[0] * 1000 + endTime[1] / 1_000_000).toFixed(2)
    
    logger.info(message, {
      requestId: this.requestId,
      durationMs,
      ...context,
      type: 'performance'
    })
  }
}
```

### **Error Tracking**
```typescript
// Error boundary for React
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React Error Boundary', error, {
      componentStack: errorInfo.componentStack,
      type: 'react-error'
    })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
```

---

## 🤝 Contributing Guidelines

### **Code Style**
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **Conventional Commits**: Clear commit messages

### **Pull Request Process**
1. **Fork repository** and create feature branch
2. **Write tests** for new functionality
3. **Update documentation** for API changes
4. **Ensure all tests pass** and code is linted
5. **Create pull request** with clear description
6. **Address review feedback** promptly

### **Code Review Checklist**
- [ ] **Functionality**: Code works as expected
- [ ] **Tests**: Adequate test coverage
- [ ] **Documentation**: Updated for changes
- [ ] **Performance**: No performance regressions
- [ ] **Security**: No security vulnerabilities
- [ ] **Style**: Follows project conventions

---

## 📚 Additional Resources

### **Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### **Tools & Libraries**
- [ShadCN/UI Components](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Zustand State Management](https://zustand-demo.pmnd.rs)

### **Best Practices**
- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://typescript-eslint.io/rules)
- [API Design Best Practices](https://restfulapi.net)
- [Security Best Practices](https://owasp.org/www-project-top-ten)

---

**Happy coding! 🚀**
