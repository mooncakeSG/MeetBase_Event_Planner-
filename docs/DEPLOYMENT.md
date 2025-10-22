# MeetBase Deployment Guide

## 🚀 Production Deployment

This guide covers deploying MeetBase to production using multiple deployment options:

- **Fly.io** (Recommended) - Full-stack deployment with global edge
- **Vercel + Render** - Separate frontend and backend deployment
- **Custom VPS** - Self-hosted deployment

---

## 🎯 Deployment Options

### **Option 1: Fly.io (Recommended)**
- **Pros**: Global edge deployment, automatic scaling, great performance
- **Cons**: Learning curve for Docker
- **Best for**: Production applications with global users
- **Guide**: [Fly.io Deployment Guide](FLY-DEPLOYMENT.md)

### **Option 2: Vercel + Render**
- **Pros**: Easy setup, familiar platforms
- **Cons**: Separate services to manage
- **Best for**: Quick deployment, familiar with these platforms
- **Guide**: Continue reading this document

### **Option 3: Custom VPS**
- **Pros**: Full control, cost-effective for high traffic
- **Cons**: Requires server management
- **Best for**: Advanced users, specific requirements

---

## 📋 Prerequisites

### Required Accounts
- **Vercel Account**: For frontend deployment
- **Render Account**: For backend deployment
- **Supabase Account**: For database and authentication
- **Domain Provider**: For custom domain (optional)

### Required Tools
- **Git**: Version control
- **Node.js**: v18+ for frontend
- **Python**: v3.9+ for backend
- **Vercel CLI**: `npm i -g vercel`
- **Render CLI**: `npm i -g @render/cli`

---

## 🎯 Frontend Deployment (Vercel)

### 1. Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Production ready"
git push origin main
```

### 2. Deploy to Vercel

#### Method A: Vercel Dashboard
1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your Git repository**
4. **Configure settings**:
   - Framework Preset: `Next.js`
   - Root Directory: `./` (or `./event-planner` if in subfolder)
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Add Environment Variables** (see Environment Variables section)
6. **Click "Deploy"**

#### Method B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd event-planner
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: meetbase
# - Directory: ./
# - Override settings? No
```

### 3. Configure Custom Domain (Optional)
1. **In Vercel Dashboard**: Go to Project Settings → Domains
2. **Add Domain**: Enter your domain (e.g., `meetbase.com`)
3. **Configure DNS**: Add CNAME record pointing to Vercel
4. **SSL Certificate**: Automatically provisioned by Vercel

---

## 🐍 Backend Deployment (Render)

### 1. Prepare Backend
```bash
# Navigate to backend directory
cd event-planner/backend

# Ensure requirements.txt is up to date
pip freeze > requirements.txt

# Commit changes
git add .
git commit -m "Backend production ready"
git push origin main
```

### 2. Deploy to Render

#### Method A: Render Dashboard
1. **Go to [render.com](https://render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect Repository**: Link your Git repository
4. **Configure Service**:
   - **Name**: `meetbase-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
5. **Add Environment Variables** (see Environment Variables section)
6. **Click "Create Web Service"**

#### Method B: Render CLI
```bash
# Install Render CLI
npm i -g @render/cli

# Login to Render
render login

# Create service
render create web-service

# Follow prompts:
# - Repository: your-git-repo
# - Name: meetbase-backend
# - Environment: Python 3
# - Build Command: pip install -r requirements.txt
# - Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 3. Configure Backend Settings
- **Auto-Deploy**: Enable for automatic deployments
- **Health Check**: `/health` endpoint
- **Scaling**: Configure based on expected traffic
- **Logs**: Enable log aggregation

---

## 🔧 Environment Variables

### Frontend (Vercel)
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration
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
ALLOWED_ORIGIN=https://meetbase.com
CORS_ENABLED=true
AI_CHAT_RATE_LIMIT=20
AI_CHAT_RATE_WINDOW_MS=60000

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://meetbase.com
```

### Backend (Render)
Add these in Render Dashboard → Service Settings → Environment:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-20b

# Security
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=https://meetbase.com,https://www.meetbase.com

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Email (if using backend for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🗄️ Database Setup (Supabase)

### 1. Production Database
1. **Create New Project**: In Supabase dashboard
2. **Run Schema**: Execute `supabase-schema.sql`
3. **Configure RLS**: Enable Row Level Security
4. **Set Up Auth**: Configure authentication providers

### 2. Database Migrations
```sql
-- Run this in Supabase SQL Editor
-- Apply the email_messages table update
ALTER TABLE public.email_messages 
ADD COLUMN IF NOT EXISTS resend_of UUID REFERENCES public.email_messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_email_messages_resend_of ON public.email_messages(resend_of);
```

### 3. Backup Strategy
- **Automatic Backups**: Enable in Supabase dashboard
- **Point-in-Time Recovery**: Configure retention period
- **Export Scripts**: Regular data exports

---

## 🔒 Security Configuration

### 1. CORS Settings
```javascript
// In your API routes
const corsOptions = {
  origin: [
    'https://meetbase.com',
    'https://www.meetbase.com',
    'https://meetbase.vercel.app' // For staging
  ],
  credentials: true
}
```

### 2. Rate Limiting
- **Frontend**: 100 requests/minute per IP
- **Email**: 10 emails/minute per IP
- **AI Chat**: 20 requests/minute per IP

### 3. Environment Security
- **Never commit** `.env` files
- **Use Vercel/Render** environment variables
- **Rotate keys** regularly
- **Monitor access** logs

---

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your app
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  )
}
```

### 2. Error Tracking
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig({
  // Your existing config
}, {
  // Sentry options
})
```

### 3. Performance Monitoring
- **Vercel Speed Insights**: Built-in performance monitoring
- **Render Metrics**: Backend performance tracking
- **Supabase Metrics**: Database performance
- **Custom Logging**: Application-specific metrics

---

## 🧪 Staging Environment

### 1. Create Staging Branch
```bash
git checkout -b staging
git push origin staging
```

### 2. Deploy Staging
- **Frontend**: Deploy staging branch to Vercel preview
- **Backend**: Create separate Render service for staging
- **Database**: Use separate Supabase project for staging

### 3. Staging URLs
- **Frontend**: `https://meetbase-git-staging.vercel.app`
- **Backend**: `https://meetbase-backend-staging.onrender.com`
- **Database**: Separate Supabase staging project

---

## 🔄 CI/CD Pipeline

### 1. GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./event-planner

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### 2. Automated Testing
```yaml
# Add to GitHub Actions
- name: Run Tests
  run: |
    cd event-planner
    npm install
    npm run test
    npm run build
```

---

## 🚨 Troubleshooting

### Common Deployment Issues

#### Frontend Issues
- **Build Failures**: Check Node.js version compatibility
- **Environment Variables**: Verify all required vars are set
- **Domain Issues**: Check DNS configuration
- **Performance**: Optimize images and code splitting

#### Backend Issues
- **Startup Failures**: Check Python version and dependencies
- **Database Connection**: Verify Supabase credentials
- **Memory Issues**: Increase Render service memory
- **Timeout Issues**: Optimize API response times

#### Database Issues
- **Connection Limits**: Monitor Supabase connection pool
- **Query Performance**: Optimize slow queries
- **Migration Failures**: Check SQL syntax and permissions
- **Backup Issues**: Verify backup configuration

### Debugging Steps
1. **Check Logs**: Review Vercel/Render/Supabase logs
2. **Test Locally**: Reproduce issues in development
3. **Environment Check**: Verify all environment variables
4. **Health Checks**: Test all API endpoints
5. **Performance**: Monitor response times and errors

---

## 📈 Scaling Considerations

### Frontend Scaling
- **Vercel**: Automatically scales with traffic
- **CDN**: Global edge network for fast loading
- **Caching**: Optimize static assets and API responses

### Backend Scaling
- **Render**: Upgrade to higher tier for more resources
- **Load Balancing**: Multiple backend instances
- **Database**: Supabase automatically scales

### Database Scaling
- **Connection Pooling**: Optimize connection usage
- **Query Optimization**: Index frequently queried columns
- **Read Replicas**: For read-heavy workloads

---

## 🔄 Maintenance

### Regular Tasks
- **Security Updates**: Keep dependencies updated
- **Backup Verification**: Test restore procedures
- **Performance Monitoring**: Review metrics weekly
- **User Feedback**: Monitor support requests

### Monthly Tasks
- **Dependency Updates**: Update all packages
- **Security Audit**: Review access logs and permissions
- **Performance Review**: Analyze usage patterns
- **Feature Planning**: Plan upcoming improvements

---

## 📞 Support

### Deployment Support
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Render Support**: [render.com/support](https://render.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)

### Emergency Procedures
1. **Rollback**: Revert to previous deployment
2. **Scale Up**: Increase resources temporarily
3. **Contact Support**: Reach out to platform support
4. **Document Issues**: Record problems for future reference

---

**Your MeetBase application is now ready for production! 🚀**
