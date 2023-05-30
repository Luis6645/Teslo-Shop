import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
 
export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/checkout")) {
    const token = req.cookies.get("token") || "";
    const previousPage = req.nextUrl.pathname;
    try {
      await jose.jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET_SEED)
      );
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?p=${previousPage}`, req.url)
      );
    }
  }
}
// Only the paths declared in here will run the middleware
export const config = {
  matcher: ["/checkout/:path*"],
};