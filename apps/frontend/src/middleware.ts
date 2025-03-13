import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isBefore } from 'date-fns';

const roleBasedAccess = {
  '/news': ['admin', 'editor'],
  '/news/*': ['admin', 'editor'],
  '/articles': ['admin', 'editor'],
  '/articles/*': ['admin', 'editor'],
  '/settings': ['admin'],
  '/': ['admin', 'editor', 'developer'],
  '/subscribers': ['admin'],
  '/users': ['admin'],
  '/login': ['developer', 'admin', 'editor'],
  '/ankets': ['admin'],
  '/ankets/*': ['admin'],
};

const publicPaths = ['/login', '/register', '/forgot-password'];

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);

/**
 * Проверяет JWT токен и возвращает его содержимое
 */
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Проверяет доступ на основе роли пользователя и статуса подписки
 */
function checkRoleBasedAccess(
  requestedPath: string,
  userRole: string,
  subscribeTill: string
) {
  // Проверяем, не истекла ли подписка

  // Проверяем доступ к защищенным маршрутам
  for (const [route, allowedRoles] of Object.entries(roleBasedAccess)) {
    const routePattern = new RegExp(`^${route.replace('*', '.*')}$`);

    if (routePattern.test(requestedPath)) {
      const hasAccess = allowedRoles.includes(userRole);
      return hasAccess;
    }
  }

  // Если путь не в списке защищенных маршрутов, доступ разрешен
  return true;
}

/**
 * Проверяет, является ли страница публичной
 */
function isPublicPage(pathname: string) {
  return publicPaths.some((pattern) => {
    const regexPattern = new RegExp(`^${pattern.replace('*', '.*')}$`);
    return regexPattern.test(pathname);
  });
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const requestedPath = url.pathname;

  // Пропускаем статические файлы
  if (
    requestedPath.match(
      /\.(jpg|jpeg|gif|png|svg|ico|css|js|woff|woff2|ttf|eot|mp4|webm|pdf)$/
    ) ||
    requestedPath.startsWith('/_next/') ||
    requestedPath.startsWith('/public/') ||
    requestedPath.startsWith('/images/') ||
    requestedPath.startsWith('/icons/') ||
    requestedPath.startsWith('/fonts/')
  ) {
    return NextResponse.next();
  }

  // Получаем токен авторизации
  const authToken = request.cookies.get('authToken')?.value;
  const isPublic = isPublicPage(requestedPath);

  // Если пользователь не авторизован и путь не публичный
  if (!authToken && !isPublic) {
    console.log(
      `Перенаправление на страницу входа: ${requestedPath} не является публичной`
    );
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Если есть токен авторизации, проверяем его
  if (authToken) {
    const decodedToken: any = await verifyToken(authToken);

    // Если токен невалидный, перенаправляем на страницу входа
    if (!decodedToken) {
      console.log('Невалидный токен, перенаправляем на вход');
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('authToken');
      return response;
    }

    // Получаем роль пользователя и срок действия подписки
    const userRole: string = decodedToken.role;
    const subscribeTill =
      decodedToken.subscribeTill ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // Если нет срока подписки, устанавливаем на год вперед

    // Проверяем, не истекла ли подписка

    // Проверяем доступ на основе роли
    const hasAccess = checkRoleBasedAccess(
      requestedPath,
      userRole,
      subscribeTill
    );

    // Если нет доступа, перенаправляем на главную
    if (!hasAccess) {
      console.log(
        `Нет доступа к странице ${requestedPath} для роли ${userRole}`
      );
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|images|icons|fonts).*)',
  ],
};
