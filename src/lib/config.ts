// Application configuration
export const config = {
  // Backend API URL
  apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://meetbase-event-planner-backend.onrender.com',
  
  // Frontend URL
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://meet-base-event-planner.vercel.app',
  
  // Site URL for Supabase redirects
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://meet-base-event-planner.vercel.app',
  
  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || 'MeetBase <noreply@meetbase.com>',
  },
  
  // AI configuration
  ai: {
    groqApiKey: process.env.GROQ_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  const baseUrl = config.apiUrl.replace(/\/$/, '') // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

// Helper function to get full frontend URL
export const getFrontendUrl = (path: string) => {
  const baseUrl = config.frontendUrl.replace(/\/$/, '') // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}
