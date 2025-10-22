# MeetBase Fly.io Quick Start

## 🚀 Deploy MeetBase to Fly.io in 5 Minutes

### Prerequisites
- ✅ Fly CLI installed (`fly --version`)
- ✅ Docker running
- ✅ Supabase project set up
- ✅ Groq API key (optional, for AI features)

---

## 🎯 Quick Deployment Steps

### 1. Login to Fly.io
```bash
fly auth login
```

### 2. Initialize Fly.io App
```bash
fly launch --no-deploy
```
**Choose:**
- App name: `meetbase` (or your preferred name)
- Region: `iad` (US East) or closest to your users
- Postgres: `No` (we use Supabase)
- Deploy now: `No`

### 3. Set Environment Secrets
```bash
# Supabase (Required)
fly secrets set NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Email (Required for email features)
fly secrets set EMAIL_HOST="smtp.gmail.com"
fly secrets set EMAIL_PORT="587"
fly secrets set EMAIL_USER="your-email@gmail.com"
fly secrets set EMAIL_PASS="your-app-password"
fly secrets set EMAIL_FROM="MeetBase <noreply@meetbase.com>"

# AI Assistant (Optional)
fly secrets set OPENAI_API_KEY="your-groq-api-key"
fly secrets set AI_ASSISTANT_ENABLED="true"

# Security
fly secrets set NEXTAUTH_SECRET="your-secret-key"
fly secrets set NEXTAUTH_URL="https://meetbase.fly.dev"
```

### 4. Deploy
```bash
fly deploy
```

### 5. Open Your App
```bash
fly open
```

**That's it! Your MeetBase app is now live! 🎉**

---

## 🔧 Using the Deployment Script

For automated deployment, use the PowerShell script:

```powershell
# Full deployment with checks
.\deploy-fly.ps1

# Deploy without pre-checks
.\deploy-fly.ps1 -SkipChecks

# Show help
.\deploy-fly.ps1 -Help
```

---

## 📊 Post-Deployment

### Check App Status
```bash
fly status
```

### View Logs
```bash
fly logs
```

### Test Health Endpoint
```bash
curl https://meetbase.fly.dev/api/health
```

### Scale Resources (if needed)
```bash
# Scale memory
fly scale memory 1024

# Scale CPU
fly scale vm shared-cpu-2x
```

---

## 🆘 Troubleshooting

### Common Issues

**Deployment fails:**
```bash
fly logs --build
fly restart
```

**Environment variables not working:**
```bash
fly secrets list
fly restart
```

**App not responding:**
```bash
fly status
fly logs
```

### Get Help
- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs)
- **MeetBase Docs**: [docs/FLY-DEPLOYMENT.md](docs/FLY-DEPLOYMENT.md)
- **GitHub Issues**: Report deployment issues

---

## 🎯 Next Steps

1. **Test all features** in your deployed app
2. **Set up custom domain** (optional)
3. **Configure monitoring** and alerts
4. **Set up CI/CD** for automatic deployments

**Your MeetBase app is now live on Fly.io! 🚀**
