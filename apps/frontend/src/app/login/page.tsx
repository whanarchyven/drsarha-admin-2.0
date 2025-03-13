'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/shared/api/login';
import { useRouter } from 'next/navigation';
export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log('Login attempt with:', email, password);
    const data = await login(email, password);
    console.log('Received data:', data);
    if (data) {
      router.push('/articles');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-[#EEEAF3] rounded-lg shadow-md p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#333]">Авторизация</h1>
            <p className="text-gray-600 mt-2">
              Введите данные для входа в систему
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#333]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@drsarha.com"
                className="bg-white border-gray-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#333]">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-gray-300"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#0A2A7A] hover:bg-[#0A2A7A]/90 text-white">
                Войти
              </Button>
            </div>

            <div className="text-center text-sm">
              <Link
                href="/forgot-password"
                className="text-[#0A2A7A] hover:underline">
                Забыли пароль?
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
