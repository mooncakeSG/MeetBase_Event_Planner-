# MeetBase Fly.io Deployment Guide

## 🚀 Deploy MeetBase to Fly.io

Fly.io is an excellent choice for MeetBase deployment, offering global edge deployment, automatic scaling, and great performance for both frontend and backend services.

---

## 📋 Prerequisites

### Required Tools
- **Fly CLI**: Already installed ✅
- **Docker**: For containerization
- **Git**: For version control

### Required Accounts
- **Fly.io Account**: [fly.io](https://fly.io) (sign up if needed)
- **Supabase Account**: For database and auth
- **Groq Account**: For AI features (optional)

---

## 🔧 Initial Setup

### 1. Login to Fly.io
```bash
# Login to your Fly.io account
fly auth login

# Verify login
fly auth whoami
```

### 2. Initialize Fly.io App
```bash
# Navigate to your project directory
cd event-planner

# Initialize Fly.io configuration
fly launch --no-deploy
```

**Follow the prompts:**
- **App name**: `meetbase` (or your preferred name)
- **Region**: Choose closest to your users (e.g., `iad` for US East)
- **Postgres**: `No` (we're using Supabase)
- **Deploy now**: `No` (we'll configure first)

---

## 🐳 Docker Configuration

### 1. Create Dockerfile
Create `Dockerfile` in the root directory:

```dockerfile
# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Update Next.js Config
Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  images: {
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

### 3. Create .dockerignore
Create `.dockerignore`:

```
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.env
.env.local
.env.production.local
.env.local
.git
.gitignore
.next
.vercel
```

---

## ⚙️ Fly.io Configuration

### 1. Update fly.toml
The `fly.toml` file should look like this:

```toml
# fly.toml app configuration file generated for meetbase

app = "meetbase"
primary_region = "iad"

[build]

[env]
  NODE_ENV = "production"
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/api/health"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[deploy]
  release_command = "echo 'Deployment complete'"
```

### 2. Create Health Check Endpoint
Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}
```

---

## 🔐 Environment Variables

### 1. Set Production Environment Variables
```bash
# Supabase Configuration
fly secrets set NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Email Configuration
fly secrets set EMAIL_HOST="smtp.gmail.com"
fly secrets set EMAIL_PORT="587"
fly secrets set EMAIL_SECURE="false"
fly secrets set EMAIL_USER="your-email@gmail.com"
fly secrets set EMAIL_PASS="your-app-password"
fly secrets set EMAIL_FROM="MeetBase <noreply@meetbase.com>"

# AI Assistant Configuration
fly secrets set OPENAI_API_KEY="your-groq-api-key"
fly secrets set OPENAI_MODEL="openai/gpt-oss-20b"
fly secrets set AI_ASSISTANT_NAME="BaseMind"
fly secrets set AI_ASSISTANT_ENABLED="true"
fly secrets set ALLOWED_ORIGIN="https://meetbase.fly.dev"
fly secrets set CORS_ENABLED="true"
fly secrets set AI_CHAT_RATE_LIMIT="20"
fly secrets set AI_CHAT_RATE_WINDOW_MS="60000"

# Security
fly secrets set NEXTAUTH_SECRET="your-secret-key"
fly secrets set NEXTAUTH_URL="https://meetbase.fly.dev"
```

### 2. Verify Secrets
```bash
# List all secrets (values are hidden for security)
fly secrets list
```

---

## 🚀 Deployment

### 1. Deploy to Fly.io
```bash
# Deploy the application
fly deploy

# Monitor the deployment
fly logs
```

### 2. Check Deployment Status
```bash
# Check app status
fly status

# Check app info
fly info

# Open the app in browser
fly open
```

### 3. Monitor Logs
```bash
# View real-time logs
fly logs

# View logs with timestamps
fly logs --timestamps

# Follow logs (like tail -f)
fly logs -f
```

---

## 🔧 Post-Deployment Configuration

### 1. Custom Domain (Optional)
```bash
# Add custom domain
fly certs add meetbase.com

# Check certificate status
fly certs show meetbase.com

# Update DNS records as instructed
```

### 2. Scale the Application
```bash
# Scale to 2 instances
fly scale count 2

# Scale memory
fly scale memory 1024

# Scale CPU
fly scale vm shared-cpu-2x
```

### 3. Set Up Monitoring
```bash
# Enable metrics
fly metrics enable

# View metrics
fly metrics
```

---

## 🗄️ Database Setup

### 1. Supabase Configuration
Since we're using Supabase (not Fly Postgres), ensure your Supabase project is configured:

```sql
-- Run in Supabase SQL Editor
-- Copy and paste contents of supabase-schema.sql

-- Update CORS settings for your Fly.io domain
UPDATE auth.config 
SET site_url = 'https://meetbase.fly.dev'
WHERE id = 1;
```

### 2. Update Supabase Auth Settings
1. **Go to Supabase Dashboard** → Authentication → Settings
2. **Update Site URL**: `https://meetbase.fly.dev`
3. **Add Redirect URLs**: `https://meetbase.fly.dev/auth/callback`

---

## 🔒 Security Configuration

### 1. CORS Settings
Update your API routes to allow your Fly.io domain:

```typescript
// In your API routes
const corsOptions = {
  origin: [
    'https://meetbase.fly.dev',
    'https://meetbase.com', // if using custom domain
    'http://localhost:3000' // for development
  ],
  credentials: true
}
```

### 2. Rate Limiting
Rate limiting is already configured in your application. Monitor usage:

```bash
# Check app metrics
fly metrics

# View specific metrics
fly metrics --app meetbase
```

---

## 📊 Monitoring & Maintenance

### 1. Health Checks
```bash
# Check app health
fly status

# Test health endpoint
curl https://meetbase.fly.dev/api/health
```

### 2. Logs and Debugging
```bash
# View recent logs
fly logs --lines 100

# Filter logs by level
fly logs | grep ERROR

# SSH into the app (if needed)
fly ssh console
```

### 3. Updates and Deployments
```bash
# Deploy updates
git add .
git commit -m "Update: description"
fly deploy

# Rollback if needed
fly releases
fly releases rollback <release-id>
```

---

## 🚨 Troubleshooting

### Common Issues

#### **Deployment Fails**
```bash
# Check build logs
fly logs --build

# Check app status
fly status

# Restart the app
fly restart
```

#### **Environment Variables Not Working**
```bash
# Verify secrets are set
fly secrets list

# Update a secret
fly secrets set KEY="new-value"

# Restart after updating secrets
fly restart
```

#### **Database Connection Issues**
```bash
# Check logs for database errors
fly logs | grep -i "database\|supabase"

# Verify Supabase URL and keys
fly secrets list | grep SUPABASE
```

#### **Performance Issues**
```bash
# Check resource usage
fly status

# Scale up if needed
fly scale memory 1024
fly scale vm shared-cpu-2x

# Check metrics
fly metrics
```

### Debug Commands
```bash
# SSH into the running container
fly ssh console

# Check environment variables
fly ssh console -C "env | grep -E '(SUPABASE|EMAIL|AI)'"

# Check disk usage
fly ssh console -C "df -h"

# Check memory usage
fly ssh console -C "free -h"
```

---

## 💰 Cost Optimization

### 1. Auto-scaling Configuration
```toml
# In fly.toml
[http_service]
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

### 2. Resource Optimization
```bash
# Start with minimal resources
fly scale memory 512
fly scale vm shared-cpu-1x

# Scale up as needed
fly scale memory 1024  # When traffic increases
```

### 3. Monitoring Costs
```bash
# Check current usage
fly billing

# View detailed metrics
fly metrics --app meetbase
```

---

## 🔄 CI/CD with Fly.io

### 1. GitHub Actions Integration
Create `.github/workflows/fly-deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Fly.io CLI
        uses: superfly/flyctl-actions/setup-flyctl@master
      
      - name: Deploy to Fly.io
        run: fly deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### 2. Set GitHub Secrets
In your GitHub repository settings:
- `FLY_API_TOKEN`: Get from `fly auth token`

---

## 📈 Performance Optimization

### 1. Enable CDN
```bash
# Fly.io automatically provides global CDN
# No additional configuration needed
```

### 2. Optimize Images
```javascript
// In next.config.js
const nextConfig = {
  images: {
    unoptimized: true, // For Fly.io deployment
    domains: ['your-domain.com'],
  },
}
```

### 3. Enable Compression
```bash
# Fly.io automatically enables gzip compression
# No additional configuration needed
```

---

## 🎯 Production Checklist

### Pre-Deployment
- [ ] **Environment variables** set correctly
- [ ] **Supabase configuration** updated
- [ ] **Custom domain** configured (if using)
- [ ] **SSL certificates** working
- [ ] **Health checks** passing

### Post-Deployment
- [ ] **App accessible** at Fly.io URL
- [ ] **Authentication** working
- [ ] **Email system** functional
- [ ] **AI assistant** responding
- [ ] **Database operations** working
- [ ] **Monitoring** set up

### Ongoing Maintenance
- [ ] **Regular updates** deployed
- [ ] **Logs monitored** for errors
- [ ] **Performance metrics** tracked
- [ ] **Security updates** applied
- [ ] **Backup procedures** in place

---

## 📞 Support

### Fly.io Support
- **Documentation**: [fly.io/docs](https://fly.io/docs)
- **Community**: [fly.io/community](https://fly.io/community)
- **Support**: [fly.io/support](https://fly.io/support)

### MeetBase Support
- **GitHub Issues**: Report deployment issues
- **Documentation**: Check other docs in `/docs` folder
- **Community**: Join our Discord for help

---

**Your MeetBase application is now deployed on Fly.io! 🚀**

**App URL**: `https://meetbase.fly.dev` (or your custom domain)
