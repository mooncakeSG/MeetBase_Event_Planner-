# MeetBase Vercel Deployment Guide

## 🚀 Automated Vercel Deployment with Integrity Checking

This guide covers deploying MeetBase to Vercel with comprehensive integrity checking to prevent failed deployments.

## 📋 Prerequisites

- ✅ Node.js 20+ installed
- ✅ npm or yarn package manager
- ✅ Vercel account and CLI
- ✅ Supabase project configured
- ✅ Environment variables ready

## 🔧 Setup Instructions

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Your Project

```bash
vercel link
```

## 🛡️ Integrity Checking System

### Automated Checks

The integrity checker runs automatically and validates:

- ✅ **TypeScript Type Checking** - Ensures all types are correct
- ✅ **ESLint Validation** - Catches code quality issues
- ✅ **Build Validation** - Confirms Next.js build succeeds
- ✅ **API Route Validation** - Verifies API endpoints are properly configured
- ✅ **Environment Variable Check** - Ensures required env vars are present

### Manual Commands

```bash
# Run all integrity checks
npm run vercel:check

# Run individual checks
npm run type-check    # TypeScript validation
npm run lint          # ESLint validation
npm run build         # Build validation

# Run complete validation suite
npm run validate
```

## 🚀 Deployment Options

### Option 1: Automated Deployment (Recommended)

```bash
# Deploy with integrity checks
npm run deploy:vercel
```

### Option 2: Manual Deployment

```bash
# Run integrity checks first
npm run pre-deploy

# Deploy to Vercel
vercel --prod
```

### Option 3: Preview Deployment

```bash
# Deploy preview for testing
vercel
```

## 🔍 Integrity Check Output

### Success Example

```
🔍 MeetBase Vercel Deployment Integrity Checker
================================================

📋 Checking prerequisites...
✅ All prerequisites met

🔨 Running Next.js build validation...
✅ Build completed successfully

🔍 Running ESLint validation...
✅ Linting passed

📝 Running TypeScript validation...
✅ Type checking passed

🌍 Validating environment variables...
✅ Environment validation completed

🛣️  Validating API routes...
✅ API routes validation completed

📊 INTEGRITY CHECK REPORT
========================

STATUS: ✅ SAFE FOR VERCEL DEPLOYMENT

INTEGRITY NOTES:
✅ All system consistency checks passed
✅ Build safety confirmed
✅ Schema alignment verified
✅ Ready for Vercel deployment
```

### Error Example

```
❌ BLOCKING ERRORS:
1. TYPESCRIPT ERROR
   File: src/app/dashboard/page.tsx
   Line: 346
   Message: Type error: missing 'user_id' and 'event_password' in object passed to addEvent()
   Fix: Add 'user_id' and 'event_password' to the newEvent object or mark them optional in the Event type definition.

STATUS: 🚫 DEPLOYMENT BLOCKED
```

## 🔧 Environment Variables

### Required Variables

Set these in your Vercel dashboard:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=MeetBase <noreply@meetbase.com>

# AI Configuration (Optional)
OPENAI_API_KEY=your-groq-api-key
AI_ASSISTANT_ENABLED=true

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://meetbase.vercel.app
```

### Setting Environment Variables

1. **Via Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each variable for Production, Preview, and Development

2. **Via Vercel CLI:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   # ... add all required variables
   ```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Check build output
npm run build
```

#### Environment Variable Issues

```bash
# Verify environment variables are set
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

#### API Route Issues

- Ensure all API routes export HTTP methods (GET, POST, etc.)
- Add proper error handling with try-catch blocks
- Verify return types match expected responses

### Debug Commands

```bash
# Run integrity checker with verbose output
DEBUG=true npm run vercel:check

# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

## 🔄 CI/CD Integration

### GitHub Actions

The repository includes automated CI/CD with:

- **Pre-commit hooks** - Run integrity checks before commits
- **Pull request validation** - Validate all PRs before merging
- **Preview deployments** - Automatic preview for PRs
- **Production deployment** - Deploy to production on main branch

### Pre-commit Hooks

Install Husky for automatic pre-commit checks:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run vercel:check"
```

## 📊 Monitoring

### Health Checks

The deployment includes automatic health checks:

- **Build validation** - Ensures build succeeds
- **Type checking** - Validates TypeScript types
- **Linting** - Checks code quality
- **API validation** - Verifies API routes

### Performance Monitoring

- Monitor build times in Vercel dashboard
- Check function execution times
- Monitor error rates and response times

## 🎯 Best Practices

### Before Deployment

1. ✅ Run `npm run vercel:check` locally
2. ✅ Test all features in development
3. ✅ Verify environment variables
4. ✅ Check API routes functionality
5. ✅ Validate build output

### During Deployment

1. ✅ Monitor build logs for errors
2. ✅ Check deployment status
3. ✅ Verify environment variables are loaded
4. ✅ Test deployed application

### After Deployment

1. ✅ Test all application features
2. ✅ Verify API endpoints work correctly
3. ✅ Check performance and response times
4. ✅ Monitor error logs

## 🆘 Support

### Getting Help

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Issues**: Report deployment issues
- **Community Support**: Join our Discord community

### Common Solutions

- **Build failures**: Check TypeScript errors and fix type issues
- **Environment issues**: Verify all required variables are set
- **API problems**: Ensure proper error handling and return types
- **Performance issues**: Optimize images and code splitting

---

**Your MeetBase app is now ready for reliable Vercel deployment! 🚀**
