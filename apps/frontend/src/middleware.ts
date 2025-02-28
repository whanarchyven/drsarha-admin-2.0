import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleBasedAccess = {
  '/post-create': ['admin', 'editor'],
  '/users': ['admin'],
  '/settings': ['admin'],
  '/': ['admin', 'editor', 'developer'],
  '/login': ['developer', 'admin', 'editor'],
};

const publicPaths = ['/login', '/register', '/forgot-password'];

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);

  // Пропускаем статические файлы
  if (
    url.pathname.match(/\.(jpg|jpeg|gif|png|svg|ico|css|js|woff|woff2|ttf|eot|mp4|webm|pdf)$/) ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/public/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/')
  ) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('authToken')?.value;
  console.log('authToken', authToken,process.env.JWT_SECRET_KEY)
  const isPublicPath = publicPaths.includes(url.pathname);

  // Если путь публичный, пропускаем
  if (isPublicPath) {
    // Если пользователь авторизован и пытается попасть на страницу логина,
    // перенаправляем на главную
    if (authToken && url.pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Если пользователь не авторизован и путь не публичный
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Проверяем права доступа для защищенных маршрутов
  const decodedToken: any = await verifyToken(authToken);

  if (!decodedToken) {
    // Если токен невалидный, удаляем его и редиректим на логин
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    return response;
  }

  const userRole: string = decodedToken.role;
  const requestedPath = url.pathname;

  // Проверяем доступ к защищенным маршрутам
  for (const [route, allowedRoles] of Object.entries(roleBasedAccess)) {
    if (requestedPath.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|images|icons|fonts).*)',
  ],
};