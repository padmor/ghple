import { NextResponse, type NextRequest } from "next/server";

// The manager area is locked on the server, so the password never reaches the browser.
// Set MANAGER_USER and MANAGER_PASSWORD in your hosting environment (never in the code).
export function middleware(req: NextRequest) {
  const user = process.env.MANAGER_USER;
  const pass = process.env.MANAGER_PASSWORD;

  if (!user || !pass) {
    // Not configured: keep the area closed in production, open while developing
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.next();
  }

  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const [u, ...rest] = atob(encoded).split(":");
    if (u === user && rest.join(":") === pass) return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="GBHPL Manager", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/manager/:path*"] };
