import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Strip WooCommerce/plugin action params from homepage → 301 to clean URL
  if (searchParams.has('action') || searchParams.has('add-to-cart')) {
    const clean = new URL(pathname, request.nextUrl.origin);
    return NextResponse.redirect(clean, { status: 301 });
  }

  // Add X-Robots-Tag: noindex for dashboard, cart, checkout, wishlist, account pages
  const noindexPaths = ['/dashboard', '/cart', '/checkout', '/wishlist', '/my-account', '/my-orders'];
  if (noindexPaths.some((p) => pathname.startsWith(p))) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/cart', '/checkout', '/wishlist', '/my-account/:path*', '/my-orders/:path*'],
};
