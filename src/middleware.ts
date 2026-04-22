import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'
import { rateLimit, extractIp } from '@/utils/rate-limit'

const CSP = [
  "default-src 'self'",
  "img-src 'self' https: data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://*.mercadopago.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://nominatim.openstreetmap.org https://api-colombia.com https://*.tile.openstreetmap.org",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "media-src 'self' blob: https://*.supabase.co",
  "frame-src https://*.mercadopago.com https://www.mercadopago.com https://www.mercadopago.com.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.mercadopago.com https://www.mercadopago.com.co",
].join('; ')

function applySecurityHeaders(res: NextResponse) {
  res.headers.set('Content-Security-Policy', CSP)
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'geolocation=(self), microphone=(self), camera=()')
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  res.headers.set('X-DNS-Prefetch-Control', 'on')
}

function isRateLimited(request: NextRequest): NextResponse | null {
  const ip = extractIp(request.headers)
  const path = request.nextUrl.pathname
  const method = request.method

  let key: string | null = null
  let limit = 0
  let windowMs = 0

  if (path.startsWith('/api/')) {
    key = `api:${ip}`
    limit = 60
    windowMs = 60_000
  } else if (method === 'POST' && path === '/auth/login') {
    key = `login:${ip}`
    limit = 5
    windowMs = 15 * 60_000
  } else if (method === 'POST' && path === '/auth/registro') {
    key = `registro:${ip}`
    limit = 3
    windowMs = 60 * 60_000
  }

  if (!key) return null

  const check = rateLimit(key, limit, windowMs)
  if (check.ok) return null

  const res = new NextResponse('Too Many Requests', { status: 429 })
  res.headers.set('Retry-After', Math.ceil((check.resetAt - Date.now()) / 1000).toString())
  applySecurityHeaders(res)
  return res
}

export async function middleware(request: NextRequest) {
  const limited = isRateLimited(request)
  if (limited) return limited

  const res = await createClient(request)
  applySecurityHeaders(res)
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
