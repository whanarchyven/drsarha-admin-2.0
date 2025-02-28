"use client"
import { eden } from '@/features/eden/eden';
import { getHeloPageData } from '@/shared/api/getHeloPageData';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default async function Home() {

  const router = useRouter()

  useEffect(() => {
    router.push('/news')
  }, [])

  return (
    <>
      <main className={'p-2'}>
        <h1 className={'text-xl'}>sdfds</h1>
      </main>
    </>
  );
}
