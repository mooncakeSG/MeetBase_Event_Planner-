# MeetBase Environment Setup Guide

## 🛠️ Development Environment Setup

This guide will help you set up MeetBase for local development.

---

## 📋 Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher
- **Python**: v3.9.0 or higher
- **Git**: Latest version
- **Code Editor**: VS Code (recommended)

### Required Accounts
- **Supabase Account**: [supabase.com](https://supabase.com)
- **Groq Account**: [groq.com](https://groq.com) (for AI features)
- **Gmail Account**: For email functionality (optional)

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd event-planner
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment templates
cp env.example_backend backend/.env
cp env.local.example_frontend .env.local
```

### 4. Start Development Servers
```bash
# Terminal 1: Frontend (Next.js)
npm run dev

# Terminal 2: Backend (FastAPI)
cd backend
python main.py
```

**Access your application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend Docs: http://localhost:8000/docs

---

## 🔧 Detailed Setup

### Frontend Environment (.env.local)

Create `.env.local` in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration (Optional - uses Ethereal for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=MeetBase <noreply@meetbase.com>

# AI Assistant Configuration
OPENAI_API_KEY=your-groq-api-key
OPENAI_MODEL=openai/gpt-oss-20b
AI_ASSISTANT_NAME=BaseMind
AI_ASSISTANT_ENABLED=true
ALLOWED_ORIGIN=http://localhost:3000
CORS_ENABLED=true
AI_CHAT_RATE_LIMIT=20
AI_CHAT_RATE_WINDOW_MS=60000

# Development Settings
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret
```

### Backend Environment (.env)

Create `backend/.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-20b

# Security
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Database (if using direct connection)
DATABASE_URL=postgresql://user:password@localhost:5432/meetbase

# Development Settings
DEBUG=true
LOG_LEVEL=debug
```

---

## 🗄️ Supabase Setup

### 1. Create Supabase Project
1. **Go to [supabase.com](https://supabase.com)**
2. **Click "New Project"**
3. **Choose Organization** and **Project Name**
4. **Set Database Password** (save this!)
5. **Select Region** (closest to your users)
6. **Click "Create new project"**

### 2. Get API Keys
1. **Go to Project Settings → API**
2. **Copy the following**:
   - Project URL
   - Anon (public) key
   - Service role key (keep secret!)

### 3. Set Up Database Schema
1. **Go to SQL Editor** in Supabase dashboard
2. **Copy and paste** the contents of `supabase-schema.sql`
3. **Click "Run"** to execute the schema

### 4. Configure Authentication
1. **Go to Authentication → Settings**
2. **Enable Email Authentication**
3. **Configure Site URL**: `http://localhost:3000`
4. **Add Redirect URLs**: `http://localhost:3000/auth/callback`

---

## 🤖 AI Configuration (Groq)

### 1. Create Groq Account
1. **Go to [groq.com](https://groq.com)**
2. **Sign up** for an account
3. **Verify your email**

### 2. Get API Key
1. **Go to API Keys** section
2. **Create new API key**
3. **Copy the key** (starts with `gsk_`)

### 3. Test AI Integration
```bash
# Test the AI endpoint
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello BaseMind"}'
```

---

## 📧 Email Configuration (Optional)

### Option 1: Gmail SMTP (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the app password** in your environment variables

### Option 2: Ethereal (Development Default)
- **No setup required** - automatically creates test accounts
- **Check console logs** for preview URLs
- **Emails are not actually sent** - for testing only

### Test Email Configuration
```bash
# Test email sending
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test email</p>"
  }'
```

---

## 🧪 Testing Setup

### 1. Run Test Suite
```bash
# Frontend tests
npm test

# Backend tests
cd backend
python -m pytest

# E2E tests (if configured)
npm run test:e2e
```

### 2. Manual Testing
```bash
# Start the stability test
node stability-test.js

# Or run in browser console
# Copy stability-test.js content and run runStabilityTests()
```

### 3. API Testing
```bash
# Test all endpoints
curl http://localhost:3000/api/debug/supabase
curl -X POST http://localhost:3000/api/ai/chat -H "Content-Type: application/json" -d '{"message":"test"}'
```

---

## 🔍 Troubleshooting

### Common Issues

#### "Module not found" Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python
pip install --upgrade pip
pip install -r requirements.txt
```

#### Supabase Connection Issues
1. **Check API keys** are correct
2. **Verify project URL** format
3. **Check network connectivity**
4. **Review Supabase logs** in dashboard

#### Email Not Sending
1. **Check SMTP credentials**
2. **Verify Gmail app password**
3. **Check rate limits**
4. **Review email logs** in console

#### AI Assistant Not Working
1. **Verify Groq API key**
2. **Check API quota/limits**
3. **Test with simple requests**
4. **Review error logs**

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env)"

# Test Supabase connection
curl http://localhost:3000/api/debug/supabase

# Check backend health
curl http://localhost:8000/health

# View logs
npm run dev 2>&1 | tee dev.log
```

---

## 📁 Project Structure

```
event-planner/
├── src/                          # Frontend source code
│   ├── app/                      # Next.js app directory
│   │   ├── api/                  # API routes
│   │   ├── dashboard/            # Dashboard pages
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── ai/                   # AI assistant components
│   │   ├── auth/                 # Authentication components
│   │   ├── email/                # Email management components
│   │   └── ui/                   # UI components
│   └── lib/                      # Utility libraries
│       ├── supabase.ts           # Supabase client
│       ├── validation.ts         # Input validation
│       └── logger.ts             # Logging utilities
├── backend/                      # Backend source code
│   ├── main.py                   # FastAPI application
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Backend environment
├── docs/                         # Documentation
├── supabase-schema.sql           # Database schema
├── .env.local                    # Frontend environment
└── package.json                  # Node.js dependencies
```

---

## 🔄 Development Workflow

### 1. Daily Development
```bash
# Start development servers
npm run dev          # Frontend
cd backend && python main.py  # Backend

# Make changes and test
# Commit changes
git add .
git commit -m "Feature: description"
git push origin main
```

### 2. Feature Development
1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Develop and test**: Make changes and test thoroughly
3. **Create pull request**: Submit for review
4. **Merge to main**: After approval

### 3. Database Changes
1. **Update schema**: Modify `supabase-schema.sql`
2. **Test locally**: Apply changes to local Supabase
3. **Create migration**: Document the changes
4. **Deploy**: Apply to production database

---

## 🚀 Production Preparation

### 1. Environment Variables
- **Remove development URLs** from production config
- **Use production API keys** and secrets
- **Configure proper CORS origins**
- **Set up monitoring** and logging

### 2. Security Checklist
- [ ] **API keys** are properly secured
- [ ] **CORS** is configured for production domains
- [ ] **Rate limiting** is enabled
- [ ] **Input validation** is comprehensive
- [ ] **Error handling** doesn't expose sensitive data

### 3. Performance Optimization
- [ ] **Images** are optimized
- [ ] **Code splitting** is implemented
- [ ] **Caching** is configured
- [ ] **Database queries** are optimized

---

## 📞 Getting Help

### Documentation
- **API Documentation**: `docs/API.md`
- **User Guide**: `docs/USER-GUIDE.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`

### Support Channels
- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Real-time help and discussion
- **Email Support**: Direct assistance for complex issues

### Development Resources
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **FastAPI Docs**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)

---

**Your MeetBase development environment is now ready! Happy coding! 🚀**
