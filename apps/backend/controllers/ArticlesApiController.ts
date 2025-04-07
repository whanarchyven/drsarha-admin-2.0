import { Elysia, t } from 'elysia';
import { AxiosApiService } from '../services/AxiosApiService';
import { TelegramBotService } from '../services/TelegramBotService';
import type { AxiosError } from 'axios';

const authHeader = process.env.EDITOR_ID

export interface ErrorResponse {
  detail: string
}

export function createArticlesApiController() {
  // Создаем экземпляр сервиса для работы с внешним API
  const editorApiService = new AxiosApiService('https://drsarha-admin-backend.reflectai.pro');
  editorApiService.setAuthToken('39fb8934e5c24e3da12d4549e6d9c679a48c97dc416f45a6b5eea781128baf05')
  
  // Создаем экземпляр сервиса для Telegram бота
  const telegramBotService = new TelegramBotService();

  const constructQueryString = (query: any) => {
    return Object.entries(query)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  };  
  
  return new Elysia({ prefix: '/editor' })

  .get('/articles', async ({ query: { page = 0, limit = 10, search, sort_by, sort_order, start_date, end_date, category, subcategory , include_deleted } }) => {
    try {
      const skip = page * limit;
      const articles = await editorApiService.get<any[]>(`/articles?skip=${skip}&limit=${limit}&${constructQueryString({ search, sort_by, sort_order, start_date, end_date, category, subcategory, include_deleted })}`);
      // console.log(articles.data[0].title,"ARTICLES")
      
      return articles;
    } catch (error) {
      console.log(JSON.stringify(error),"ERROR SUKA")
      throw new Error(`Ошибка при получении статей: ${error instanceof Error ? error.message : String(error)}`);
    }
  },{
    query: t.Object({
      page: t.Optional(t.Number()),
      limit: t.Optional(t.Number()),
      search: t.Optional(t.String()),
      sort_by: t.Optional(t.String()),
      sort_order: t.Optional(t.String()),
      start_date: t.Optional(t.String()),
      end_date: t.Optional(t.String()),
      category: t.Optional(t.String()),
      subcategory: t.Optional(t.String()),
      include_deleted: t.Optional(t.Boolean()),
    })
  })

  .get('/articles/:id', async ({ params: { id } }) => {
    try {
      const article = await editorApiService.get<any>(`/articles/${id}`);
      console.log(`/articles/${id}`)
      return article;
    } catch (error) {
      const errorData = error && typeof error === 'object' && 'data' in error ? error.data : null;
      console.log(errorData, "ERROR");
      const errorData = error && typeof error === 'object' && 'data' in error ? error.data : null;
      console.log(errorData, "ERROR");
      throw new Error(`Ошибка при получении статьи: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  .delete('/articles/:id', async ({ params: { id } }) => {
    try {
        await editorApiService.delete(`/articles/${id}`);
      return { message: 'Статья удалена' };
    } catch (error) {
      throw new Error(`Ошибка при удалении статьи: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  .post('/articles/:id/restore', async ({ params: { id }, body }) => {
    try {
      await editorApiService.post(`/articles/${id}/restore`, body);
      return { message: 'Статья восстановлена' };
    } catch (error: unknown) {
      const newErr = error as AxiosError['response']
      const newErrData = newErr?.data as ErrorResponse
      return new Error(`Ошибка при восстановлении статьи: ${newErrData.detail}`);
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    
  })

  .patch('/articles/:id', async ({ params: { id }, body }) => {
    console.log(body,"AUEEEEE")
    try {
      // Получаем предыдущее состояние статьи, чтобы проверить изменение статуса публикации
      let previousPublishedState = false;
      let title = '';
      let articleLink = '';
      
      try {
        const article = await editorApiService.get<any>(`/articles/${id}`);
        previousPublishedState = article?.meta?.isPublished || false;
        title = article?.title?.ru?.human || article?.title?.ru?.ai || article?.title?.raw || '';
        // Используем URL-параметры в ссылке статьи, на основе articleUrl
        const articleUrl = article?.articleUrl;
        if (articleUrl) {
          articleLink = `https://drsarha.ru/article?url=${encodeURIComponent(articleUrl)}`;
        } else {
          articleLink = `https://drsarha.ru/article/${id}`;
        }
      } catch (error) {
        console.log('Не удалось получить предыдущее состояние статьи:', error);
      }
      
      // Отправляем запрос на обновление
      const res = await editorApiService.patch<any>(`/articles/${id}`, {...body});
      
      // Проверяем, изменился ли статус публикации на "опубликовано"
      if (body.isPublished === true && !previousPublishedState) {
        console.log('Статья была опубликована, отправляем уведомление в Telegram');
        
        // Получаем заголовок, если он не был получен ранее
        if (!title) {
          title = res?.title?.ru?.human || res?.title?.ru?.ai || res?.title?.raw || 'Новая статья';
        }
        
        // Формируем ссылку на статью
        
        
        // Отправляем уведомление в Telegram
        await telegramBotService.sendNotification({
          message_type: 'article',
          title,
          link: articleLink
        });
      }
      
      return { message: 'Статья обновлена' };
    } catch (error: unknown) {
      const newErr = error as AxiosError['response']
      const newErrData = newErr?.data as ErrorResponse
      return new Error(`Ошибка при обновлении статьи: ${newErrData.detail}`);
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      articleUrl: t.Optional(t.String()),
      category: t.Optional(t.String()),
      subcategory: t.Optional(t.String()),
      references: t.Optional(t.Array(t.String())),
      doi: t.Optional(t.String()),
      publisherName: t.Optional(t.String()),
      authors: t.Optional(t.Array(t.String())),
      languages: t.Optional(t.Array(t.String())),
      isPublished: t.Optional(t.Boolean()),
      isIndexed: t.Optional(t.Boolean()),
      isDeleted: t.Optional(t.Boolean()),
      hasTranslation: t.Optional(t.Boolean()),
      hasDevComment: t.Optional(t.Boolean()),
      isClinicalCase: t.Optional(t.Boolean()),
      title_raw: t.Optional(t.String()),
      title_ru_ai: t.Optional(t.String()),
      title_ru_human: t.Optional(t.String()),
      title_en_ai: t.Optional(t.String()),
      title_en_human: t.Optional(t.String()),
      content_raw: t.Optional(t.String()),
      content_ru_ai: t.Optional(t.String()),
      content_ru_human: t.Optional(t.String()),
      content_en_ai: t.Optional(t.String()),
      content_en_human: t.Optional(t.String()),
      summary_ru_ai: t.Optional(t.String()),
      summary_ru_human: t.Optional(t.String()),
      published_date: t.Optional(t.String()),
    })
  })

  .post('/articles/translate', async ({ body }) => {
    try {
      const res = await editorApiService.post('/articles/translate', body);
      return res;
    } catch (error) {
      throw new Error(`Ошибка при переводе статьи: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    body: t.Object({
      identifier: t.String(),
      type: t.String(),
    })
  })

  .get('/articles/translation/:task_id', async ({ params: { task_id } }) => {
    try {
      const res = await editorApiService.get(`/articles/translation/${task_id}`);
      return res;
    } catch (error) {
      throw new Error(`Ошибка при проверке статуса перевода: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    params: t.Object({
      task_id: t.String()
    })
  })

  // Добавляем роуты для работы с новостями
  .get('/news', async ({ query: { page = 0, limit = 10, search, sort_by, sort_order, start_date, end_date, subcategory, include_deleted } }) => {
    console.log(subcategory, "CATEGORY")
    try {
      const skip = page * limit;
      console.log(`/news?skip=${skip}&limit=${limit}&${constructQueryString({ search, sort_by, sort_order, start_date, end_date, subcategory, include_deleted })}`)
      const news = await editorApiService.get<any[]>(`/news?skip=${skip}&limit=${limit}&${constructQueryString({ search, sort_by, sort_order, start_date, end_date, subcategory, include_deleted })}`);
      console.log(news, "NEWS")
      return news;
    } catch (error) {
      throw new Error(`Ошибка при получении новостей: ${error instanceof Error ? error.message : String(error)}`);
    }
  },{
    query: t.Object({
      page: t.Optional(t.Number()),
      limit: t.Optional(t.Number()),
      search: t.Optional(t.String()),
      sort_by: t.Optional(t.String()),
      sort_order: t.Optional(t.String()),
      start_date: t.Optional(t.String()),
      end_date: t.Optional(t.String()),
      subcategory: t.Optional(t.String()),
      include_deleted: t.Optional(t.Boolean()),
    })
  })

  .get('/news/:id', async ({ params: { id } }) => {
    try {
      const newsItem = await editorApiService.get<any>(`/news/${id}`);
      return newsItem;
    } catch (error) {
      const errorData = error && typeof error === 'object' && 'data' in error ? error.data : null;
      throw new Error(`Ошибка при получении новости: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  .post('/news', async ({ body }) => {
    try {
      const res = await editorApiService.post('/news', body);
      return res;
    } catch (error) {
      throw new Error(`Ошибка при создании новости: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    body: t.Object({
      title_raw: t.String(),
      content_raw: t.String(),
      category: t.Optional(t.String()),
      isPublished: t.Optional(t.Boolean()),
      publishedDate: t.Optional(t.String()),
      authors: t.Optional(t.Array(t.String())),
      languages: t.Optional(t.Array(t.String())),
      title_ru_ai: t.Optional(t.String()),
      title_ru_human: t.Optional(t.String()),
      content_ru_ai: t.Optional(t.String()),
      content_ru_human: t.Optional(t.String()),
    })
  })

  .patch('/news/:id', async ({ params: { id }, body }) => {
    try {
      await editorApiService.patch(`/news/${id}`, {...body});
      return { message: 'Новость обновлена' };
    } catch (error: unknown) {
      const newErr = error as AxiosError['response']
      const newErrData = newErr?.data as ErrorResponse
      return new Error(`Ошибка при обновлении новости: ${newErrData.detail}`);
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      title_raw: t.Optional(t.String()),
      content_raw: t.Optional(t.String()),
      category: t.Optional(t.String()),
      isPublished: t.Optional(t.Boolean()),
      publishedDate: t.Optional(t.String()),
      authors: t.Optional(t.Array(t.String())),
      languages: t.Optional(t.Array(t.String())),
      isDeleted: t.Optional(t.Boolean()),
      hasTranslation: t.Optional(t.Boolean()),
      title_ru_ai: t.Optional(t.String()),
      title_ru_human: t.Optional(t.String()),
      content_ru_ai: t.Optional(t.String()),
      content_ru_human: t.Optional(t.String()),
      summary_ru_ai: t.Optional(t.String()),
      summary_ru_human: t.Optional(t.String()),
      subcategory: t.Optional(t.String()),
      isClinicalCase: t.Optional(t.Boolean()),

    })
  })

  .delete('/news/:id', async ({ params: { id } }) => {
    try {
      await editorApiService.delete(`/news/${id}`);
      return { message: 'Новость удалена' };
    } catch (error) {
      throw new Error(`Ошибка при удалении новости: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  .post('/news/:id/restore', async ({ params: { id }, body }) => {
    try {
      await editorApiService.post(`/news/${id}/restore`, body);
      return { message: 'Новость восстановлена' };
    } catch (error: unknown) {
      const newErr = error as AxiosError['response']
      const newErrData = newErr?.data as ErrorResponse
      return new Error(`Ошибка при восстановлении новости: ${newErrData.detail}`);
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  .post('/news/translate', async ({ body }) => {
    try {
      const res = await editorApiService.post('/news/translate', body);
      return res;
    } catch (error) {
      throw new Error(`Ошибка при переводе новости: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    body: t.Object({
      identifier: t.String(),
      type: t.String(),
    })
  })

  .get('/news/translation/:task_id', async ({ params: { task_id } }) => {
    try {
      const res = await editorApiService.get(`/news/translation/${task_id}`);
      return res;
    } catch (error) {
      throw new Error(`Ошибка при проверке статуса перевода новости: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    params: t.Object({
      task_id: t.String()
    })
  })
}