import { eden } from '@/features/eden/eden';

export const deleteNews = async (id: string) => {
  try {
    const response = await eden.editor.news({ id }).delete();
    return response.data;
  } catch (error) {
    throw new Error('Ошибка при удалении новости');
  }
};
