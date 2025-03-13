import { eden } from '@/features/eden/eden';

export const banUser = async (id: string) => {
  const response = await eden['main-backend']['ban-user']({ id }).put();
  return response.data;
};
