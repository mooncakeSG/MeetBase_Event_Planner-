# MeetBase Stability Checklist

## 🧪 **Automated Testing**
Run the stability test script in browser console:
```javascript
// Copy and paste the content of stability-test.js into browser console
runStabilityTests()
```

## 🔍 **Manual Testing Checklist**

### **1. Core Navigation** ✅
- [ ] Dashboard loads correctly
- [ ] All sidebar navigation works (Events, Guests, Analytics, Settings)
- [ ] Page transitions are smooth
- [ ] No console errors during navigation

### **2. Authentication System** ✅
- [ ] Auth modal opens/closes properly
- [ ] Sign in form validation works
- [ ] Sign up form validation works
- [ ] Auth state persists across page refreshes
- [ ] Protected routes redirect properly

### **3. Event Management** ✅
- [ ] Create new event form works
- [ ] Event validation (required fields, date/time)
- [ ] AI suggestions for event content
- [ ] Edit existing events
- [ ] Delete events
- [ ] Event cards display correctly

### **4. Guest Management** ✅
- [ ] Add guests to events
- [ ] Guest form validation
- [ ] Guest list displays correctly
- [ ] Edit guest information
- [ ] Remove guests
- [ ] Guest status tracking

### **5. Email System** ✅
- [ ] Email templates load correctly
- [ ] Template preview works
- [ ] Send test emails
- [ ] Bulk email sending
- [ ] Email history displays
- [ ] Resend failed emails
- [ ] Rate limiting works (try sending 12+ emails quickly)

### **6. Calendar Integration** ✅
- [ ] Calendar view displays events
- [ ] Month navigation works
- [ ] Click to create events
- [ ] Event conflict detection
- [ ] .ics export functionality

### **7. Analytics Dashboard** ✅
- [ ] Analytics cards display data
- [ ] Metrics calculations are correct
- [ ] Charts and graphs render
- [ ] Export functionality works
- [ ] Real-time updates

### **8. BaseMind AI Assistant** ✅
- [ ] Floating AI button appears
- [ ] Chat window opens/closes smoothly
- [ ] Quick action buttons work
- [ ] AI responses are relevant
- [ ] No overlapping UI elements
- [ ] Chat history persists during session

### **9. API Endpoints** ✅
- [ ] `/api/debug/supabase` - Database connection
- [ ] `/api/ai/chat` - AI assistant responses
- [ ] `/api/email/send` - Email sending
- [ ] `/api/email/resend` - Email resending
- [ ] All endpoints return proper status codes

### **10. Error Handling** ✅
- [ ] Invalid inputs show proper error messages
- [ ] Network errors are handled gracefully
- [ ] 404 pages work correctly
- [ ] Rate limiting shows appropriate messages
- [ ] Validation errors are user-friendly

### **11. Performance** ✅
- [ ] Page load times < 3 seconds
- [ ] Smooth animations and transitions
- [ ] No memory leaks during navigation
- [ ] Responsive design works on different screen sizes
- [ ] No excessive API calls

### **12. Security** ✅
- [ ] Input validation on all forms
- [ ] XSS protection in email content
- [ ] Rate limiting prevents abuse
- [ ] CORS headers are properly set
- [ ] Sensitive data is not exposed in logs

## 🚨 **Critical Issues to Check**

### **Database Connection**
```bash
# Test Supabase connection
curl http://localhost:3000/api/debug/supabase
# Should return: {"ok":true,"count":0}
```

### **Email System**
```bash
# Test email validation
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"to":"invalid-email","subject":"Test","html":"<p>Test</p>"}'
# Should return: 400 Bad Request
```

### **AI Assistant**
```bash
# Test BaseMind chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I create an event?"}'
# Should return: 200 with AI response
```

## 📊 **Success Criteria**

- ✅ **95%+ test pass rate**
- ✅ **No critical errors in console**
- ✅ **All core features functional**
- ✅ **Performance within acceptable limits**
- ✅ **Security measures in place**

## 🔧 **If Issues Found**

1. **Check browser console** for JavaScript errors
2. **Check server terminal** for API errors
3. **Verify environment variables** are set correctly
4. **Test individual components** in isolation
5. **Check network tab** for failed requests

## 📝 **Test Results Template**

```
Date: ___________
Tester: ___________
Environment: Development/Production

Core Features: ✅/❌
Authentication: ✅/❌
Email System: ✅/❌
AI Assistant: ✅/❌
Performance: ✅/❌
Security: ✅/❌

Issues Found:
- Issue 1: Description
- Issue 2: Description

Overall Status: ✅ STABLE / ❌ NEEDS FIXES
```

---

**Next Steps After Stability Check:**
1. Fix any critical issues found
2. Document all features and APIs
3. Prepare for production deployment
4. Set up monitoring and alerts
