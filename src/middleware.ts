import { NextRequest, NextResponse } from "next/server";
import { extractSubdomain, isAdminHost, isAppHost, isMarketingHost } from "@/lib/tenant";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const authPublicPaths = new Set(["/login", "/signup", "/forgot-password"]);

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (isAppHost(host)) {
    if (pathname.startsWith("/app") || authPublicPaths.has(pathname)) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/app${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isAdminHost(host)) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isMarketingHost(host)) {
    return NextResponse.next();
  }

  const subdomain = extractSubdomain(host);
  if (!subdomain || subdomain === "www") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_sites")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/_sites/${subdomain}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
