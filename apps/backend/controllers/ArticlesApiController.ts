import { Elysia, t } from 'elysia';
import { AxiosApiService } from '../services/AxiosApiService';
import type { AxiosError } from 'axios';

const authHeader = process.env.EDITOR_ID

export interface ErrorResponse {
  detail: string
}

export function createArticlesApiController() {
  // Создаем экземпляр сервиса для работы с внешним API
  const editorApiService = new AxiosApiService('https://drsarha-admin-backend.dev.reflectai.pro');
  editorApiService.setAuthToken('39fb8934e5c24e3da12d4549e6d9c679a48c97dc416f45a6b5eea781128baf05')

  const constructQueryString = (query: any) => {
    return Object.entries(query)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  };  
  
  return new Elysia({ prefix: '/editor' })
  .get('/news', async ({ query: { page = 0, limit = 10, search, sort_by, sort_order, start_date, end_date, category  } }) => {
    try {
      const skip = page * limit;
      console.log(`/news?skip=${skip}&limit=${limit}&${constructQueryString({ search, sort_by, sort_order, start_date, end_date, category })}`)
      const articles = await editorApiService.get<any[]>(`/news?skip=${skip}&limit=${limit}&${constructQueryString({ search, sort_by, sort_order, start_date, end_date, category })}`);
      
      console.log(articles)
      return articles;
    } catch (error) {
      //console.log(error,"ERROR")
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
    })
  })

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
      console.log(error.data,"ERROR")
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

    try {
      const res=await editorApiService.patch(`/articles/${id}`,{...body});
      console.log(res.title.ru.human,"RES")
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

    
}