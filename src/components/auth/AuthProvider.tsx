'use client'

import { useEffect } from 'react'
import { initializeAuth, setupAuthListener } from '@/lib/auth'
import { diagnoseAuthFlow } from '@/lib/auth-diagnosis'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Initialize authentication
    initializeAuth()
    
    // Set up auth state listener
    setupAuthListener()
    
    // Run diagnosis in development
    if (process.env.NODE_ENV === 'development') {
      diagnoseAuthFlow().then(result => {
        if (result.status === 'fail') {
          console.error('Auth diagnosis failed:', result.errors)
        } else if (result.warnings.length > 0) {
          console.warn('Auth warnings:', result.warnings)
        }
      })
    }
  }, [])

  return <>{children}</>
}
