'use client'

import { useEffect } from 'react'
import { initializeAuth, setupAuthListener } from '@/lib/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Initialize authentication
    initializeAuth()
    
    // Set up auth state listener
    setupAuthListener()
  }, [])

  return <>{children}</>
}
