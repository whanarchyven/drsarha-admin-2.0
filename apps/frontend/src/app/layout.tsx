'use client';
import './globals.css';
import React, { Suspense, useState } from 'react';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { headers } from 'next/headers'; // импортируем headers
import clsx from 'clsx';
import Navbar from '@/widgets/navbar';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Шрифты
// const Roboto = localFont({
//   src: [
//     {
//       path: '../../public/fonts/Robotocondensed.woff2',
//       weight: '400',
//       style: 'normal',
//     },
//   ],
//   display: 'swap',
//   variable: '--base-font',
// });
// ? clsx(Roboto.variable) для body

interface RootLayoutProps {
  children: React.ReactNode;
  params: any;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [hideLayout, setHideLayout] = useState(false);

  const currentUrl = usePathname();

  useEffect(() => {
    setHideLayout(currentUrl.includes('login'));
  }, [currentUrl]);

  const [userRole, setUserRole] = useState('admin');

  useEffect(() => {
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const authToken = getCookieValue('authToken');
    if (authToken) {
      try {
        // Предполагаем, что роль хранится в токене
        // Можно декодировать JWT или использовать другую логику
        const tokenData = JSON.parse(atob(authToken.split('.')[1]));
        if (tokenData.role) {
          setUserRole(tokenData.role);
        }
      } catch (error) {
        console.error('Ошибка при получении роли из токена:', error);
      }
    }
  }, [currentUrl]);

  return (
    <html lang="ru">
      <head></head>
      <body>
        <Suspense>
          <div id="app">
            <div
              className={
                'md:grid md:grid-cols-9 relative md:gap-x-1 xl:gap-x-2'
              }>
              {!hideLayout && (
                <div className={'md:col-span-2 md:flex hidden'}>
                  <div className={'w-full sticky top-0 h-screen'}>
                    <Navbar userRole={userRole} />
                  </div>
                </div>
              )}
              <div
                className={clsx(
                  !hideLayout
                    ? 'md:px-10 px-1 pt-20 md:pt-10 md:col-span-7  pb-4  w-full'
                    : 'col-span-9'
                )}>
                {children}
              </div>
              {/*<img*/}
              {/*  id={'dr_sara'}*/}
              {/*  className={*/}
              {/*    'fixed drop-shadow-2xl bottom-4 right-4 w-[20rem] h-auto cursor-pointer'*/}
              {/*  }*/}
              {/*  src={'/images/dr_sara.svg'}*/}
              {/*/>*/}

              {!hideLayout && (
                <div className={'col-span-9 block'}>{/* <Footer /> */}</div>
              )}
            </div>
            {/*{!hideLayout && <Footer />}*/}
          </div>
        </Suspense>
        <Toaster richColors />
      </body>
    </html>
  );
}
