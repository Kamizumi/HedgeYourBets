import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {auth} from '@/auth'; 

// list of protected paths
const protectedPaths = ['/previous-bets', '/popular-bets'];

export async function middleware(req: NextRequest) {
	const session = await auth();
	const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));
	
	// Redirect unauthenticated users trying to access protected paths
	if (isProtectedPath && !session) {
		return NextResponse.redirect(new URL('/get-started', req.url));
	}
	
	// Prevent authenticated users from accessing the get-started page
	if (req.nextUrl.pathname.startsWith("/get-started") && session) {
		return NextResponse.redirect(new URL('/', req.url));
	}


	return NextResponse.next();
}
