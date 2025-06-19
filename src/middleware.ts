// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Don't block or redirect anything, let client-side code handle it
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
