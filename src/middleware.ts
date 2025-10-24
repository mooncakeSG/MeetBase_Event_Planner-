import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Only handle specific routes that need authentication
  const { pathname } = req.nextUrl
  
  // Skip middleware for static files, API routes, and other non-page routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static/')
  ) {
    return NextResponse.next()
  }
  
  // For now, let client-side authentication handle redirects
  // This prevents server-side redirect loops
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match only specific routes that need authentication
     */
    '/dashboard/:path*',
    '/events/:path*',
    '/guests/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ],
}
