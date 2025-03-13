import { eden } from '@/features/eden/eden';

export const renewSubscription = async (email: string, plan: string) => {
  const response = await eden['main-backend']['renew-subscription'].post({
    email,
    plan,
  });
  return response;
};
