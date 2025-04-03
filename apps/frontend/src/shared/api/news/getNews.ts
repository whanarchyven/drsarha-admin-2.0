import { Article } from '@/entities/Article/model';
import { eden } from '@/features/eden/eden';

type NewsResponse = {
  metadata: {
    total: number;
    limit: number;
    skip: number;
    has_more: boolean;
    all: number;
    deleted: number;
    published: number;
    translated: number;
  };
  data: Article[];
};

// Функция для обработки markdown текста в статьях

export const getNews = async ({
  page,
  limit,
  search,
  sort_by,
  sort_order,
  start_date,
  end_date,
  category,
  subcategory,
  include_deleted,
}: {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  start_date?: string;
  end_date?: string;
  category?: string;
  subcategory?: string;
  include_deleted?: boolean;
}): Promise<NewsResponse> => {
  const query = {
    page: page ?? 0,
    ...(limit !== undefined && { limit }),
    ...(search !== undefined && { search }),
    ...(sort_by !== undefined && { sort_by }),
    ...(sort_order !== undefined && { sort_order }),
    ...(start_date !== undefined && { start_date }),
    ...(end_date !== undefined && { end_date }),
    ...(category !== undefined && { category }),
    ...(subcategory !== undefined && { subcategory }),
    ...(include_deleted !== undefined && { include_deleted }),
  };
  console.log(query);

  const response = await eden.editor.news.get({
    query: query,
  });

  console.log(response, 'RESPONSE AUE');
  // Обрабатываем markdown поля в статьях
  const data = response.data as unknown as NewsResponse;

  return data;
};
