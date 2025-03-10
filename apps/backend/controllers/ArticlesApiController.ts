import { Elysia, t } from 'elysia';
import { AxiosApiService } from '../services/AxiosApiService';

const authHeader = process.env.EDITOR_ID

export function createArticlesApiController() {
  // Создаем экземпляр сервиса для работы с внешним API
  const editorApiService = new AxiosApiService('https://drsarha-admin-backend.dev.reflectai.pro');

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
      const articles = await editorApiService.get<any[]>(`/news?skip=${skip}&limit=${limit}&${constructQueryString({ search, sort_by, sort_order, start_date, end_date, category })}`,{
        headers: {
          'Authorization': authHeader
        }
      });
      
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

  .get('/articles', async ({ query: { page = 0, limit = 10, search, sort_by, sort_order, start_date, end_date, category, subcategory  } }) => {
    try {
      const skip = page * limit;
      console.log(`/articles?skip=${skip}&limit=${limit}&${constructQueryString({ search, sort_by, sort_order, start_date, end_date, category, subcategory })}`)
      const articles = await editorApiService.get<any[]>(`/articles?skip=${skip}&limit=${limit}&${constructQueryString({ search, sort_by, sort_order, start_date, end_date, category, subcategory })}`,{
        headers: {
          'Authorization': authHeader
        }
      });
      console.log(articles.data[0].title,"ARTICLES")
      
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
      subcategory: t.Optional(t.String()),
    })
  })
  
    // Пример прокси-запроса GET
    // .get('/users', async () => {
    //   try {
    //     const users = await externalApiService.get<any[]>('/users');
    //     return users;
    //   } catch (error) {
    //     throw new Error(`Ошибка при получении пользователей: ${error instanceof Error ? error.message : String(error)}`);
    //   }
    // })
    
    // Пример прокси-запроса POST с передачей данных
    // .post('/users', async ({ body }) => {
    //   try {
    //     const newUser = await externalApiService.post('/users', body);
    //     return newUser;
    //   } catch (error) {
    //     throw new Error(`Ошибка при создании пользователя: ${error instanceof Error ? error.message : String(error)}`);
    //   }
    // }, {
    //   body: t.Object({
    //     name: t.String(),
    //     email: t.String(),
    //     // Другие необходимые поля
    //   })
    // })
    
    // Пример получения данных по ID
    // .get('/:resource/:id', async ({ params: { resource, id } }) => {
    //   try {
    //     const data = await externalApiService.get<any>(`/${resource}/${id}`);
    //     return data;
    //   } catch (error) {
    //     throw new Error(`Ошибка при получении ${resource}: ${error instanceof Error ? error.message : String(error)}`);
    //   }
    // }, {
    //   params: t.Object({
    //     resource: t.String(),
    //     id: t.String()
    //   })
    // })
    
}