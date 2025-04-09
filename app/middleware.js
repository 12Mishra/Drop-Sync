import { NextResponse} from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token && req.nextUrl.pathname.startsWith('/file-upload')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/file-upload'],
}
