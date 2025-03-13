import { Frown } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const code = searchParams.code || '404';
  const message = searchParams.message || 'Страница не найдена';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="px-8 py-12 bg-white rounded-lg shadow-2xl text-center max-w-md w-full animate-fade-in-up">
        <Frown className="w-24 h-24 mx-auto text-red-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Ошибка {code}</h1>
        <p className="text-xl text-gray-600 mb-8">{message}</p>
        <Link
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
