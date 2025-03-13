import { eden } from '@/features/eden/eden';

export const deleteArticle = async (id: string) => {
  try {
    const response = await eden.editor.articles({ id }).delete();
    return response.data;
  } catch (error) {
    throw new Error('Ошибка при удалении статьи');
  }
};
