// Environment Variable Checker
// This utility helps verify that all required environment variables are set

export function checkEnvironmentVariables() {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  const result = {
    allPresent: missingVars.length === 0,
    missing: missingVars,
    variables: requiredVars
  }

  console.log('Environment Variables Check:', result)
  
  return result
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  checkEnvironmentVariables()
}
