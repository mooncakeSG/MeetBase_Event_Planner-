# EventPlanner Setup Guide

This guide will help you set up the EventPlanner application with all its components.

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- Supabase account
- Groq API account

## 1. Frontend Setup

### Install Dependencies
```bash
cd event-planner
npm install
```

### Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run Development Server
```bash
npm run dev
```

## 2. Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key

### Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create tables and policies

### Get API Keys
1. Go to Settings > API
2. Copy your project URL and anon key
3. Copy your service role key (for backend)

## 3. Backend Setup

### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Environment Variables
Create `.env` file in backend directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
HOST=0.0.0.0
PORT=8000
```

### Run FastAPI Server
```bash
cd backend
python main.py
```

## 4. Groq AI Setup

### Get API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Create an account and get your API key
3. Add it to your environment variables

## 5. Development Workflow

### Start All Services
1. Terminal 1: `npm run dev` (Frontend)
2. Terminal 2: `cd backend && python main.py` (Backend)

### Testing
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 6. Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy

## Project Structure

```
event-planner/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── dashboard/       # Dashboard page
│   │   └── page.tsx         # Landing page
│   ├── components/          # React components
│   │   ├── events/         # Event-related components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # ShadCN/UI components
│   └── lib/                # Utilities and stores
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application
│   └── requirements.txt     # Python dependencies
└── supabase-schema.sql     # Database schema
```

## Features Implemented

- ✅ Next.js frontend with TypeScript
- ✅ TailwindCSS and ShadCN/UI components
- ✅ Zustand state management
- ✅ Supabase database schema
- ✅ FastAPI backend with authentication
- ✅ AI-powered event suggestions
- ✅ Event CRUD operations
- ✅ Guest management system
- ✅ Responsive Cal.com-inspired design

## Next Steps

1. Set up authentication flow with Supabase
2. Implement real AI integration with Groq
3. Add calendar integration
4. Implement guest invitation system
5. Add analytics dashboard
6. Deploy to production

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Check your environment variables
2. **AI suggestions not working**: Verify Groq API key
3. **Build errors**: Make sure all dependencies are installed
4. **Database errors**: Check Supabase schema is properly set up

### Support

For issues and questions, check the documentation or create an issue in the repository.
