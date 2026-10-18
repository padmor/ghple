import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/server/session";

// Keeps the manager area behind sign-in. Pages redirect to the login page; the
// manager-only API endpoints check the session themselves (see requireManager).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/manager/login";

  let session = null;
  try {
    session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  } catch {
    // SESSION_SECRET missing: nobody can be signed in
  }

  if (!session && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/manager/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (session && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/manager";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/manager/:path*"] };
