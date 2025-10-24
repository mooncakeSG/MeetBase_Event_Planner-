import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // For now, let the client-side authentication handle redirects
  // This middleware can be enhanced later with server-side session checking
  
  // Check for potential redirect loops by looking at the referer
  const referer = req.headers.get('referer')
  const currentUrl = req.nextUrl.pathname
  
  // If the user is being redirected back and forth, add a small delay
  if (referer && referer.includes(currentUrl)) {
    console.log('Potential redirect loop detected:', { referer, currentUrl })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
