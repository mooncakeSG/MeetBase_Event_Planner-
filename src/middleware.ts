import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(_req: NextRequest) {
  // TEMPORARILY DISABLED - Let client-side handle all redirects
  // This prevents server-side redirect loops
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Empty matcher - middleware won't run on any routes
  ],
}
