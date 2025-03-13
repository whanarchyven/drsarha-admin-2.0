import { eden } from '@/features/eden/eden';

export const restoreArticle = async (id: string) => {
  try {
    const response = await eden.editor.articles({ id }).restore.post();
    console.log(response, 'AUE');
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: `Ошибка при восстановлении статьи - ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
