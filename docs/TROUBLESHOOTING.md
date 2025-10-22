# MeetBase Troubleshooting Guide

## 🚨 Quick Fixes

### Most Common Issues

| Issue | Quick Fix | Detailed Solution |
|-------|-----------|-------------------|
| **App won't start** | `npm install && npm run dev` | [Installation Issues](#installation-issues) |
| **Can't send emails** | Check Gmail app password | [Email Issues](#email-issues) |
| **AI not responding** | Verify Groq API key | [AI Issues](#ai-issues) |
| **Database errors** | Check Supabase connection | [Database Issues](#database-issues) |
| **Authentication fails** | Clear browser cache | [Auth Issues](#authentication-issues) |

---

## 🔧 Installation Issues

### Node.js Version Problems
**Error**: `Node.js version not supported`

**Solution**:
```bash
# Check current version
node --version

# Install Node.js v18+ from nodejs.org
# Or use nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### Package Installation Failures
**Error**: `npm ERR! peer dep missing`

**Solution**:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### Python Backend Issues
**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Ensure you're in the backend directory
cd backend

# Install requirements
pip install -r requirements.txt

# If using virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📧 Email Issues

### Gmail SMTP Authentication Failed
**Error**: `Authentication failed: 535-5.7.8 Username and Password not accepted`

**Solution**:
1. **Enable 2-Factor Authentication** on Gmail
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - App passwords → Generate password for "Mail"
3. **Use app password** in `.env.local`:
   ```bash
   EMAIL_PASS=your-16-character-app-password
   ```

### Rate Limit Exceeded
**Error**: `Rate limit exceeded. Please try again later.`

**Solution**:
- **Wait 1 minute** before trying again
- **Check rate limits**: 10 emails/minute per IP
- **Use bulk sending** instead of individual sends
- **Contact support** if limits are too restrictive

### Emails Going to Spam
**Issue**: Emails not reaching inbox

**Solution**:
1. **Check SPF/DKIM records** (if using custom domain)
2. **Use professional sender name**: `MeetBase <noreply@meetbase.com>`
3. **Avoid spam trigger words** in subject lines
4. **Include unsubscribe links**
5. **Test with different email providers**

### Ethereal Test Emails
**For Development**: Emails use Ethereal by default

**How to view**:
1. **Check console logs** for preview URLs
2. **Click the preview URL** to see email
3. **Example URL**: `https://ethereal.email/message/1234567890`

---

## 🤖 AI Issues

### BaseMind Not Responding
**Error**: AI chat returns empty responses

**Solution**:
1. **Check Groq API key**:
   ```bash
   # Test API key
   curl -X POST http://localhost:3000/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```

2. **Verify environment variables**:
   ```bash
   OPENAI_API_KEY=gsk_your_groq_key_here
   AI_ASSISTANT_ENABLED=true
   ```

3. **Check API quota**: Visit Groq dashboard for usage limits

### AI Suggestions Not Working
**Error**: No AI suggestions appearing

**Solution**:
1. **Check network connection**
2. **Verify Groq API key** is valid
3. **Test with simple requests** first
4. **Check browser console** for errors
5. **Fallback to rule-based responses** if API fails

### Slow AI Responses
**Issue**: AI takes too long to respond

**Solution**:
- **Check internet connection**
- **Verify Groq service status**
- **Reduce message length**
- **Use fallback responses** for better UX

---

## 🗄️ Database Issues

### Supabase Connection Failed
**Error**: `Failed to connect to Supabase`

**Solution**:
1. **Check API keys**:
   ```bash
   # Test connection
   curl http://localhost:3000/api/debug/supabase
   ```

2. **Verify environment variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Check Supabase project status** in dashboard

### Database Schema Errors
**Error**: `relation "users" does not exist`

**Solution**:
1. **Run schema setup**:
   ```sql
   -- In Supabase SQL Editor
   -- Copy and paste contents of supabase-schema.sql
   ```

2. **Check table permissions**:
   ```sql
   -- Verify RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

### Authentication Database Issues
**Error**: `User not found` or `Invalid credentials`

**Solution**:
1. **Check Supabase Auth settings**
2. **Verify email confirmation** is enabled
3. **Check user table** in Supabase dashboard
4. **Reset user password** if needed

---

## 🔐 Authentication Issues

### Login Not Working
**Error**: `Invalid login credentials`

**Solution**:
1. **Check email verification**: Ensure email is confirmed
2. **Reset password**: Use "Forgot Password" link
3. **Clear browser cache** and cookies
4. **Check Supabase Auth logs**

### Session Expired
**Error**: `Session expired` or automatic logout

**Solution**:
1. **Check JWT token expiration** (default: 1 hour)
2. **Implement token refresh** logic
3. **Clear localStorage** and re-login
4. **Check system clock** synchronization

### CORS Issues
**Error**: `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution**:
1. **Check CORS configuration**:
   ```javascript
   // In API routes
   const corsOptions = {
     origin: ['http://localhost:3000', 'https://meetbase.com'],
     credentials: true
   }
   ```

2. **Verify allowed origins** in environment variables

---

## 🎨 Frontend Issues

### Components Not Rendering
**Error**: Blank page or missing components

**Solution**:
1. **Check browser console** for JavaScript errors
2. **Verify component imports**:
   ```javascript
   import { Component } from '@/components/ui/component'
   ```

3. **Check file paths** and case sensitivity
4. **Restart development server**

### Styling Issues
**Error**: CSS not loading or broken styles

**Solution**:
1. **Check Tailwind CSS** configuration
2. **Verify CSS imports** in `globals.css`
3. **Clear browser cache**
4. **Check for CSS conflicts**

### Build Failures
**Error**: `npm run build` fails

**Solution**:
1. **Check for TypeScript errors**:
   ```bash
   npm run type-check
   ```

2. **Fix import/export issues**
3. **Check for unused variables**
4. **Verify all dependencies** are installed

---

## 🚀 Performance Issues

### Slow Page Loading
**Issue**: Pages take too long to load

**Solution**:
1. **Check network tab** in browser dev tools
2. **Optimize images** and assets
3. **Enable code splitting**
4. **Check API response times**
5. **Use browser caching**

### Memory Leaks
**Issue**: App becomes slow over time

**Solution**:
1. **Check for event listeners** not being removed
2. **Clear intervals/timeouts** on component unmount
3. **Use React DevTools** to check for memory leaks
4. **Restart development server** periodically

### API Timeouts
**Error**: `Request timeout` or slow API responses

**Solution**:
1. **Check backend performance**
2. **Optimize database queries**
3. **Add request timeouts**
4. **Implement retry logic**
5. **Use connection pooling**

---

## 🔍 Debugging Tools

### Browser DevTools
```javascript
// Check environment variables
console.log(process.env)

// Check Supabase connection
console.log(supabase)

// Monitor API calls
// Network tab → Filter by "api"

// Check localStorage
console.log(localStorage)
```

### Server Logs
```bash
# Frontend logs
npm run dev 2>&1 | tee frontend.log

# Backend logs
cd backend
python main.py 2>&1 | tee backend.log

# Check specific errors
grep -i "error" *.log
```

### API Testing
```bash
# Test all endpoints
curl http://localhost:3000/api/debug/supabase
curl -X POST http://localhost:3000/api/ai/chat -H "Content-Type: application/json" -d '{"message":"test"}'
curl -X POST http://localhost:3000/api/email/send -H "Content-Type: application/json" -d '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

---

## 📊 Monitoring & Logs

### Application Logs
```javascript
// Check structured logs
// Look for request IDs in console
// Example: [INFO] Email sent { requestId: "req_123", recipient: "user@example.com" }
```

### Error Tracking
1. **Browser Console**: Check for JavaScript errors
2. **Network Tab**: Monitor failed requests
3. **Server Terminal**: Watch for backend errors
4. **Supabase Logs**: Check database operations

### Performance Monitoring
```javascript
// Check page load times
console.log(performance.timing)

// Monitor API response times
// Network tab → Timing column

// Check memory usage
console.log(performance.memory)
```

---

## 🆘 Emergency Procedures

### Complete Reset
```bash
# Stop all servers
# Clear everything
rm -rf node_modules package-lock.json
rm -rf backend/__pycache__ backend/.pytest_cache

# Reinstall everything
npm install
cd backend && pip install -r requirements.txt

# Restart servers
npm run dev
cd backend && python main.py
```

### Database Reset
```sql
-- In Supabase SQL Editor
-- WARNING: This will delete all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Re-run schema
-- Copy and paste supabase-schema.sql
```

### Environment Reset
```bash
# Backup current .env files
cp .env.local .env.local.backup
cp backend/.env backend/.env.backup

# Reset to defaults
cp env.local.example_frontend .env.local
cp env.example_backend backend/.env

# Reconfigure with your values
```

---

## 📞 Getting Help

### Self-Service
1. **Check this troubleshooting guide** first
2. **Search GitHub issues** for similar problems
3. **Review documentation** in `/docs` folder
4. **Run stability tests** to identify issues

### Community Support
- **GitHub Discussions**: Ask questions and share solutions
- **Discord Community**: Real-time help and chat
- **Stack Overflow**: Tag questions with `meetbase`

### Professional Support
- **Email Support**: For complex issues
- **Priority Support**: For production emergencies
- **Custom Development**: For feature requests

---

## 📝 Reporting Issues

### Bug Reports
When reporting bugs, include:
1. **Steps to reproduce**
2. **Expected vs actual behavior**
3. **Error messages** (screenshots)
4. **Environment details** (OS, browser, Node.js version)
5. **Console logs** and network requests

### Feature Requests
For new features:
1. **Describe the use case**
2. **Explain the expected behavior**
3. **Provide mockups** if applicable
4. **Check existing issues** first

---

**Remember: Most issues can be resolved by checking environment variables, clearing cache, and restarting servers! 🚀**
