'use client'

import { useEffect, useState } from 'react'

export function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
  }>({
    supabaseUrl: false,
    supabaseKey: false,
  })

  useEffect(() => {
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-semibold mb-2">Environment Check</h3>
      <div className="space-y-1 text-sm">
        <div className={`flex items-center gap-2 ${envStatus.supabaseUrl ? 'text-green-600' : 'text-red-600'}`}>
          <span>{envStatus.supabaseUrl ? '✅' : '❌'}</span>
          <span>Supabase URL</span>
        </div>
        <div className={`flex items-center gap-2 ${envStatus.supabaseKey ? 'text-green-600' : 'text-red-600'}`}>
          <span>{envStatus.supabaseKey ? '✅' : '❌'}</span>
          <span>Supabase Key</span>
        </div>
      </div>
      {(!envStatus.supabaseUrl || !envStatus.supabaseKey) && (
        <p className="text-xs text-muted-foreground mt-2">
          Create .env.local with your Supabase credentials
        </p>
      )}
    </div>
  )
}
