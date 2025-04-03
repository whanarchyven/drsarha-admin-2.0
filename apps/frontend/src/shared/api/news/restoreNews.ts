import { eden } from '@/features/eden/eden';

export const restoreNews = async (id: string) => {
  try {
    const response = await eden.editor.news({ id }).restore.post();
    console.log(response, 'AUE');
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: `Ошибка при восстановлении новости - ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
