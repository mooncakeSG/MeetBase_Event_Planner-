// Authentication Flow Diagnosis Utility
// This utility helps diagnose Supabase authentication issues on Vercel

import { supabase } from './supabase'
import { config } from './config'

interface AuthDiagnosisResult {
  status: 'pass' | 'fail'
  errors: string[]
  warnings: string[]
  recommendations: string[]
  environment: {
    supabaseUrl: boolean
    supabaseAnonKey: boolean
    siteUrl: boolean
    apiUrl: boolean
  }
  session: {
    exists: boolean
    valid: boolean
    expiresAt?: string
  }
  cookies: {
    accessToken: boolean
    refreshToken: boolean
    domain: string
  }
}

export async function diagnoseAuthFlow(): Promise<AuthDiagnosisResult> {
  const result: AuthDiagnosisResult = {
    status: 'pass',
    errors: [],
    warnings: [],
    recommendations: [],
    environment: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      apiUrl: !!process.env.NEXT_PUBLIC_API_BASE_URL,
    },
    session: {
      exists: false,
      valid: false,
    },
    cookies: {
      accessToken: false,
      refreshToken: false,
      domain: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    }
  }

  // Check environment variables
  if (!result.environment.supabaseUrl) {
    result.errors.push('NEXT_PUBLIC_SUPABASE_URL is missing')
    result.status = 'fail'
  }

  if (!result.environment.supabaseAnonKey) {
    result.errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
    result.status = 'fail'
  }

  if (!result.environment.siteUrl) {
    result.warnings.push('NEXT_PUBLIC_SITE_URL is missing - this may cause redirect issues')
    result.recommendations.push('Add NEXT_PUBLIC_SITE_URL=https://meet-base-event-planner.vercel.app to Vercel environment variables')
  }

  // Check session
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      result.errors.push(`Session error: ${error.message}`)
      result.status = 'fail'
    } else if (session) {
      result.session.exists = true
      result.session.valid = true
      result.session.expiresAt = new Date(session.expires_at! * 1000).toISOString()
    }
  } catch (error) {
    result.errors.push(`Session check failed: ${error}`)
    result.status = 'fail'
  }

  // Check cookies (client-side only)
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    result.cookies.accessToken = !!cookies['sb-access-token'] || !!cookies['sb-meetbase-auth-token']
    result.cookies.refreshToken = !!cookies['sb-refresh-token']

    if (!result.cookies.accessToken && !result.cookies.refreshToken) {
      result.warnings.push('No Supabase auth cookies found')
      result.recommendations.push('Clear browser cookies and try logging in again')
    }
  }

  // Check for redirect loop indicators
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href
    const redirectCount = (currentUrl.match(/redirect/g) || []).length
    
    if (redirectCount > 2) {
      result.errors.push('Potential redirect loop detected')
      result.status = 'fail'
      result.recommendations.push('Check Supabase redirect URLs configuration')
    }
  }

  // Generate recommendations based on findings
  if (result.status === 'fail') {
    result.recommendations.push('Check Supabase dashboard → Authentication → URL Configuration')
    result.recommendations.push('Ensure redirect URLs include: https://meet-base-event-planner.vercel.app/*')
    result.recommendations.push('Verify NEXT_PUBLIC_SITE_URL matches your Vercel domain')
  }

  return result
}

// Utility function to clear auth state and cookies
export function clearAuthState(): void {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem('sb-meetbase-auth-token')
    localStorage.removeItem('sb-access-token')
    localStorage.removeItem('sb-refresh-token')
    
    // Clear all Supabase-related cookies
    const cookies = document.cookie.split(';')
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=')
      if (name.includes('sb-') || name.includes('supabase')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`
      }
    })
  }
}

// Utility function to test authentication flow
export async function testAuthFlow(): Promise<boolean> {
  try {
    const diagnosis = await diagnoseAuthFlow()
    
    if (diagnosis.status === 'fail') {
      console.error('Auth flow test failed:', diagnosis.errors)
      return false
    }
    
    console.log('Auth flow test passed:', diagnosis)
    return true
  } catch (error) {
    console.error('Auth flow test error:', error)
    return false
  }
}
