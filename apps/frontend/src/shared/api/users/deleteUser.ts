import { eden } from '@/features/eden/eden';

export const deleteUser = async (id: string) => {
  const deletedUser = await eden.users({ id }).delete();
  return deletedUser.data;
};
