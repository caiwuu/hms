import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路径
const protectedPaths = [
  '/',
  '/chores',
  '/statistics',
  '/settings',
  '/profile',
];

// 公开路径
const publicPaths = [
  '/login',
  '/api/auth/login',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是API路由，除了身份验证API之外，所有API都需要认证
  const isApiRoute = pathname.startsWith('/api/');
  const isAuthRoute = pathname.startsWith('/api/auth/');

  // 检查是否需要认证
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // 如果是公开路径，直接访问
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 如果是API路由但不是认证路由，或者是受保护的路径，则需要认证
  const requiresAuth = (isApiRoute && !isAuthRoute) || isProtectedPath;

  if (requiresAuth) {
    // 检查会话cookie
    const sessionId = request.cookies.get('session_id')?.value;

    // 如果没有会话cookie，重定向到登录页面
    if (!sessionId) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * 1. 静态文件 (_next/static, favicon.ico, images/, etc.)
     * 2. 调试工具 (_next/webpack-hmr, _next/on-demand-entries-ping, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg)).*)',
  ],
}; 