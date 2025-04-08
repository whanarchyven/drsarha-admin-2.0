import { eden } from '@/features/eden/eden';

export const getStack = async () => {
  const response = await eden.telegram.stack.get();
  return response.data;
};
