import { NextResponse } from 'next/server';

export function middleware(request) {
    const authCookie = request.cookies.get('smoss_auth');
    const pathname = request.nextUrl.pathname;

    // Izinkan akses ke API, aset statis, dan halaman login itu sendiri
    if (pathname.startsWith('/api') || pathname.startsWith('/login') || pathname.match(/\.(css|js|png|ico|jpg)$/)) {
        return NextResponse.next();
    }

    // Jika belum terotentikasi dan mencoba akses halaman utama/dashboard
    if (!authCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Jika sudah terotentikasi, lanjutkan
    return NextResponse.next();
}