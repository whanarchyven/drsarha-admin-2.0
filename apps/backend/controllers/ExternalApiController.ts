import { Elysia, t } from 'elysia';
import { AxiosApiService } from '../services/AxiosApiService';


const authHeader = process.env.ADMIN_ID

export function createExternalApiController() {
  // Создаем экземпляр сервиса для работы с внешним API
  const externalApiService = new AxiosApiService('http://localhost:3003');
  
  return new Elysia({ prefix: '/main-backend' })
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
    
    // Пример запроса с авторизацией
    .get('/get-users-list', async ({ headers }) => {
      try {
        // Передаем токен авторизации на внешний API
        // const authHeader = headers.authorization;
        // if (!authHeader) {
        //   throw new Error('Отсутствует токен авторизации');
        // }
        
        const data = await externalApiService.get<any>('/get-users-list', {
          headers: {
            'Authorization': authHeader
          }
        });
        
        return data;
      } catch (error) {
        throw new Error(`Ошибка при получении защищенных данных: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
    .get('/get-all-users', async ({ headers,query }) => {
      try {
        const data = await externalApiService.get<any>('/get-all-users', {
          headers: {
            'Authorization': authHeader
          },
          params: query
        });
        return data;
      } catch (error) {
        throw new Error(`Ошибка при получении всех пользователей: ${error instanceof Error ? error.message : String(error)}`);
      }
    },{
      query: t.Object({
        page: t.Number(),
        limit: t.Number(),
        search: t.String(),
        tariff: t.String()
      })
    })
    .post('/approve/:id', async ({ params: { id } }) => {
      try {
        const data = await externalApiService.post(`/approve/${id}`,{},{
          headers: {
            'Authorization': authHeader
          }
        })  ;
        return data;
      } catch (error) {
        throw new Error(`Ошибка при подтверждении анкеты: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
    .put('/edit-user/:id', async ({ params: { id }, body }) => {
      try {
        const data = await externalApiService.put(`/edit-user/${id}`, body, {
          headers: {
            'Authorization': authHeader
          }
        });
        return data;
      } catch (error) {
        throw new Error(`Ошибка при обновлении анкеты: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
    .put('/ban-user/:id', async ({ params: { id } }) => {
        try {
          const data = await externalApiService.put(`/edit-user/${id}`, {isApproved:false}, {
            headers: {
              'Authorization': authHeader
            }
          });
          return data;
        } catch (error) {
          throw new Error(`Ошибка при обновлении анкеты: ${error instanceof Error ? error.message : String(error)}`);
        }
      })
    .delete('/delete-user/:id', async ({ params: { id } }) => {
      try {
        const data = await externalApiService.delete(`/delete-user/${id}`,{
          headers: {
            'Authorization': authHeader 
          }
        });
        console.log(data)
        return data;
      } catch (error) {
        console.log(error, 'error')
        throw new Error(`Ошибка при удалении анкеты: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
    .post('/renew-subscription', async ({body}) => {
      try {
        const data = await externalApiService.post(`/renew-subscription/`,body,{
          headers: {
            'Authorization': authHeader
          }
        })  ;
        return data;
      } catch (error) {
        throw new Error(`Ошибка при продлении подписки: ${error instanceof Error ? error.message : String(error)}`);
      }
    },{
      body: t.Object({
        email: t.String(),
        plan: t.String()
      })
    })
    ; 
}