import { eden } from '@/features/eden/eden';
import { handleError } from '../utils/handleError';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export const login = async (email: string, password: string) => {
  const data = await eden.users.login.post({ email, password });
  if (data.error) {
    console.log(data.error.value);
    toast.error(data.error.value as string);
    return null;
  }
  console.log(data.data);

  // Устанавливаем куки на клиенте
  Cookies.set('authToken', data.data?.token as string, {
    expires: 3600, // 1 день
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return data.data;
};
