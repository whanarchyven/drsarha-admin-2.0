import { eden } from '@/features/eden/eden';
import { Subscriber } from '@/entities/Subscriber/model/types';

export const editUser = async (id: string, data: Subscriber) => {
  const response = await eden['main-backend']['edit-user']({ id }).put(data);
  return response.data;
};
