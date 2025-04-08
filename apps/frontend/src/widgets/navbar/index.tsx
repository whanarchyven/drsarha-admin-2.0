'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

export interface LinkInterface {
  icon: string;
  link: string;
  name: string;
  roles: string[];
}

interface NavLinkProps extends LinkInterface {
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  icon,
  link,
  name,
  isActive,
  roles,
}) => {
  return (
    <Link
      href={link}
      className={'flex overflow-x-clip items-center md:h-8 2xl:h-14'}>
      <div
        className={clsx(
          'md:w-2 xl:w-4 rounded-xl md:-ml-1 2xl:-ml-2 h-full',
          isActive ? 'bg-cGreen' : ''
        )}></div>
      <div className={'flex items-center gap-2'}>
        <div
          className={clsx(
            'flex md:pl-2 2xl:pl-8 items-center gap-4',
            isActive ? 'opacity-100' : 'opacity-50 md:opacity-[0.24]'
          )}>
          <img className={'w-7 md:w-4 2xl:w-7'} src={icon} alt={name} />
          <p className={'text-base md:text-xs 2xl:text-base font-semibold'}>
            {name}
          </p>
        </div>
      </div>
    </Link>
  );
};

export const navLinks: LinkInterface[] = [
  {
    icon: '/icons/news.svg',
    link: '/news',
    name: 'Новости',
    roles: ['admin', 'developer', 'editor'],
  },
  {
    icon: '/icons/articles.svg',
    link: '/articles',
    name: 'Статьи',
    roles: ['admin', 'editor'],
  },
  {
    icon: '/icons/ankets.svg',
    link: '/ankets',
    name: 'Анкеты',
    roles: ['admin'],
  },
  {
    icon: '/icons/users.svg',
    link: '/subscribers',
    name: 'Подписчики',
    roles: ['admin', 'developer'],
  },
  {
    icon: '/icons/users.svg',
    link: '/users',
    name: 'Пользователи',
    roles: ['admin', 'developer'],
  },
  {
    icon: '/icons/telegram.svg',
    link: '/telegram',
    name: 'Telegram',
    roles: ['admin', 'developer'],
  },
  // {
  //   icon: '/icons/autopublishing.svg',
  //   link: '/autopublishing',
  //   name: 'Автопубликация',
  //   roles: ['admin', 'developer'],
  // },
  // {
  //   icon: '/icons/settings.svg',
  //   link: '/settings',
  //   name: 'Настройки',
  //   roles: ['admin', 'developer'],
  // },
];

const Navbar: React.FC<{ userRole?: string }> = ({ userRole = 'admin' }) => {
  // Используем usePathname для получения текущего пути на клиенте
  const pathname = usePathname();

  return (
    <div className={'w-full rounded-b-3xl h-full md:p-3 xl:p-6'}>
      <div
        className={
          'flex gap-3 py-12 h-full rounded-xl flex-col justify-between bg-[#12007A] bg-opacity-10'
        }>
        <div>
          <div className={'flex gap-2 items-center'}>
            <div className={'xl:pl-8 pl-2 md:w-24 lg:w-32 2xl:w-52'}>
              <img src="/images/logo.svg" alt="Logo" className="w-full" />
            </div>
            <p>{userRole}</p>
          </div>
          <div className={'mt-12'}>
            {navLinks
              .filter((link) => link.roles.includes(userRole))
              .map((link, index) => (
                <NavLink
                  key={index}
                  isActive={pathname.includes(link.link)}
                  icon={link.icon}
                  link={link.link}
                  name={link.name}
                  roles={link.roles}
                />
              ))}
          </div>
        </div>
        <div>
          <NavLink
            isActive={pathname.includes('/logout')}
            icon={'/icons/logout.svg'}
            link={'/logout'}
            name={'Выйти'}
            roles={['admin', 'developer', 'editor']}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
