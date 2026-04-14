import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes matching patterns
const protectedRoutes = {
  admin: ['/admin', '/dashboard/admin'],
  hospital: ['/hospital', '/dashboard/hospital'],
  organisation: ['/organisation', '/dashboard/organisation'],
  user: ['/user', '/user/donation-history'],
  authenticated: ['/profile', '/settings', '/donors'],
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('refreshToken')?.value;
  const pathname = request.nextUrl.pathname;

  // If there's no token, redirect to login if accessing any protected route
  if (!token) {
    const isProtected = Object.values(protectedRoutes).flat().some(route => pathname.startsWith(route));
    if (isProtected) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // Decode JWT payload (without verification, since this is edge middleware)
    const payloadBase64 = token.split('.')[1];
    if (payloadBase64) {
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const role = decodedPayload.role;

      // Check specific role restrictions
      const isAdminRoute = protectedRoutes.admin.some(r => pathname.startsWith(r));
      const isHospitalRoute = protectedRoutes.hospital.some(r => pathname.startsWith(r));
      const isOrgRoute = protectedRoutes.organisation.some(r => pathname.startsWith(r));
      const isUserRoute = protectedRoutes.user.some(r => pathname.startsWith(r));
      const isAuthenticatedRoute = protectedRoutes.authenticated.some(r => pathname.startsWith(r));

      if (isAdminRoute && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/feed', request.url));
      }

      if (isHospitalRoute && role !== 'HOSPITAL') {
        return NextResponse.redirect(new URL('/feed', request.url));
      }

      if (isOrgRoute && role !== 'ORGANISATION') {
        return NextResponse.redirect(new URL('/feed', request.url));
      }

      if (isUserRoute && role !== 'USER' && role !== 'DONOR') {
        return NextResponse.redirect(new URL('/feed', request.url));
      }

      if (isAuthenticatedRoute && role !== 'USER' && role !== 'DONOR') {
        // Prevent hospital/org/admin from accessing normal user routes
        return NextResponse.redirect(new URL('/feed', request.url));
      }
    }
  } catch (error) {
    console.error("Middleware token parse error", error);
  }

  return NextResponse.next();
}

export const config = {
  // Setup matcher to efficiently ignore public assets and api routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
