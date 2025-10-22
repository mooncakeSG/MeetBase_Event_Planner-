# MeetBase - AI-Powered Event Management Platform

<div align="center">

![MeetBase Logo](https://via.placeholder.com/200x80/000000/FFFFFF?text=MeetBase)

**Intelligent event management with AI assistance, beautiful design, and powerful automation.**

[![Deploy with Fly.io](https://fly.io/button)](https://fly.io/apps/new?name=meetbase&image=meetbase:latest)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/meetbase)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

[Live Demo](https://meetbase.vercel.app) • [Documentation](docs/) • [Support](https://github.com/your-username/meetbase/issues)

</div>

---

## ✨ Features

### 🎯 **Core Event Management**
- **Smart Event Creation** with AI-powered suggestions
- **Guest Management** with role-based invitations
- **Calendar Integration** with conflict detection
- **Real-time Analytics** and performance tracking

### 🤖 **AI Assistant (BaseMind)**
- **Intelligent Chat Support** for user guidance
- **Smart Content Suggestions** for events and emails
- **Automated Reminders** and follow-ups
- **Contextual Help** based on current page

### 📧 **Advanced Email System**
- **Professional Templates** with Cal.com-inspired design
- **Bulk Email Sending** with delivery tracking
- **Automated Reminders** and RSVP management
- **Email History** with resend capabilities

### 🔒 **Enterprise Security**
- **JWT Authentication** with Supabase Auth
- **Rate Limiting** and abuse prevention
- **Input Validation** and XSS protection
- **Structured Logging** for monitoring

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ and **Python** v3.9+
- **Supabase** account for database and auth
- **Groq** account for AI features (optional)

### 🎯 Deployment Options

#### **Option 1: Fly.io (Recommended)**
```bash
# Quick deployment with Fly.io
fly auth login
fly launch --no-deploy
fly secrets set NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
# ... (see FLY-QUICKSTART.md for full setup)
fly deploy
```

#### **Option 2: Development Setup**
```bash
# Clone the repository
git clone https://github.com/your-username/meetbase.git
cd meetbase

# Install dependencies
npm install
cd backend && pip install -r requirements.txt && cd ..

# Set up environment variables
cp env.local.example_frontend .env.local
cp env.example_backend backend/.env

# Start development servers
npm run dev          # Frontend (http://localhost:3000)
cd backend && python main.py  # Backend (http://localhost:8000)
```

### Environment Setup
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-groq-api-key

# Backend (backend/.env)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
```

---

## 📚 Documentation

### 📖 **User Guides**
- **[User Guide](docs/USER-GUIDE.md)** - Complete user manual
- **[API Documentation](docs/API.md)** - REST API reference
- **[Environment Setup](docs/ENVIRONMENT-SETUP.md)** - Development setup
- **[Deployment Options](DEPLOYMENT-OPTIONS.md)** - Choose your deployment strategy

### 🚀 **Deployment Guides**
- **[Fly.io Quick Start](FLY-QUICKSTART.md)** - 5-minute Fly.io deployment
- **[Fly.io Full Guide](docs/FLY-DEPLOYMENT.md)** - Comprehensive Fly.io guide
- **[Vercel + Render](docs/DEPLOYMENT.md)** - Alternative deployment
- **[Automated Scripts](deploy-fly.ps1)** - PowerShell deployment automation

### 🔧 **Technical Documentation**
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Stability Testing](STABILITY-CHECKLIST.md)** - Testing procedures
- **[Database Schema](supabase-schema.sql)** - Database structure

### 🎯 **Quick References**
- **[Feature Overview](#features)** - All available features
- **[API Endpoints](#api-endpoints)** - Quick API reference
- **[Configuration](#configuration)** - Environment variables
- **[Support](#support)** - Getting help

---

## 🏗️ Architecture

### **Frontend (Next.js 14)**
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **ShadCN/UI** components
- **Zustand** for state management
- **React Hook Form** with Zod validation

### **Backend (FastAPI)**
- **Python 3.9+** with FastAPI
- **Supabase** for database and auth
- **Groq AI** for intelligent features
- **Structured logging** and monitoring

### **Database (Supabase)**
- **PostgreSQL** with real-time subscriptions
- **Row Level Security** for data protection
- **Built-in authentication** and user management
- **Automatic backups** and scaling

---

## 🔌 API Endpoints

### **Email System**
```bash
POST /api/email/send      # Send emails
POST /api/email/resend    # Resend failed emails
```

### **AI Assistant**
```bash
POST /api/ai/chat         # Chat with BaseMind
POST /api/ai/suggest      # Get AI suggestions
```

### **Debug & Monitoring**
```bash
GET  /api/debug/supabase  # Test database connection
```

### **Rate Limits**
- **General API**: 100 requests/minute
- **Email Sending**: 10 emails/minute
- **AI Chat**: 20 requests/minute

---

## 🎨 UI Components

### **Core Components**
- **Event Management**: Create, edit, and track events
- **Guest Management**: Invite and manage attendees
- **Calendar View**: Monthly calendar with event display
- **Email Templates**: Professional email designs

### **AI Features**
- **BaseMind Chat**: Floating AI assistant
- **Smart Suggestions**: AI-powered content generation
- **Contextual Help**: Page-specific assistance

### **Analytics Dashboard**
- **Event Metrics**: Attendance and engagement
- **Email Analytics**: Delivery and response rates
- **Performance Tracking**: System health monitoring

---

## 🔒 Security Features

### **Authentication & Authorization**
- **JWT-based** authentication with Supabase
- **Role-based** access control
- **Session management** with automatic refresh

### **Data Protection**
- **Input validation** with Zod schemas
- **XSS protection** with HTML sanitization
- **Rate limiting** to prevent abuse
- **CORS configuration** for secure requests

### **Monitoring & Logging**
- **Structured logging** with request tracking
- **Performance monitoring** with metrics
- **Error tracking** with detailed context
- **Audit trails** for all operations

---

## 🚀 Deployment

### **Frontend (Vercel)**
```bash
# Deploy to Vercel
vercel --prod

# Or connect GitHub repository for auto-deployment
```

### **Backend (Render)**
```bash
# Deploy to Render
# Connect GitHub repository and configure:
# Build Command: pip install -r requirements.txt
# Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### **Database (Supabase)**
```sql
-- Run schema in Supabase SQL Editor
-- Copy and paste contents of supabase-schema.sql
```

---

## 🧪 Testing

### **Automated Testing**
```bash
# Run stability tests
node stability-test.js

# Or in browser console
runStabilityTests()
```

### **Manual Testing**
- Use the [Stability Checklist](STABILITY-CHECKLIST.md)
- Test all core features and integrations
- Verify email system and AI assistant
- Check authentication and security

---

## 📊 Performance

### **Frontend Metrics**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.0s

### **Backend Metrics**
- **API Response Time**: < 200ms average
- **Database Query Time**: < 100ms average
- **Email Delivery Time**: < 5s average
- **AI Response Time**: < 2s average

---

## 🔄 Development Workflow

### **Daily Development**
```bash
# Start development servers
npm run dev          # Frontend
cd backend && python main.py  # Backend

# Make changes and test
git add .
git commit -m "Feature: description"
git push origin main
```

### **Feature Development**
1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Develop and test**: Make changes and test thoroughly
3. **Create pull request**: Submit for review
4. **Merge to main**: After approval and testing

---

## 🤝 Contributing

### **How to Contribute**
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### **Development Guidelines**
- **Follow TypeScript** best practices
- **Write tests** for new features
- **Update documentation** for API changes
- **Use conventional commits** for clear history

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Cal.com** for design inspiration
- **Supabase** for backend infrastructure
- **Groq** for AI capabilities
- **Vercel** and **Render** for hosting
- **ShadCN/UI** for beautiful components

---

## 📞 Support

### **Getting Help**
- **📖 Documentation**: Check the [docs/](docs/) folder
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-username/meetbase/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-username/meetbase/discussions)
- **📧 Email Support**: support@meetbase.com

### **Community**
- **Discord**: [Join our community](https://discord.gg/meetbase)
- **Twitter**: [@MeetBaseApp](https://twitter.com/meetbaseapp)
- **LinkedIn**: [MeetBase](https://linkedin.com/company/meetbase)

---

<div align="center">

**Made with ❤️ by the MeetBase Team**

[⭐ Star us on GitHub](https://github.com/your-username/meetbase) • [🐦 Follow us on Twitter](https://twitter.com/meetbaseapp) • [💬 Join our Discord](https://discord.gg/meetbase)

</div>