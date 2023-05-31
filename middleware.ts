import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {

  if (req.nextUrl.pathname.startsWith("/checkout")) {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!session) {
      const requestdPage = req.nextUrl.pathname
      const url = req.nextUrl.clone()
      url.pathname = '/auth/login'
      url.search = `?p=${requestdPage}`
      return NextResponse.redirect(url)
    }
    
    return NextResponse.next()
  }
}

// Only the paths declared in here will run the middleware
export const config = {
  matcher: ["/checkout/:path*"],
};