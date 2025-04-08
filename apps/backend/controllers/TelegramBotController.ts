import { Elysia, t } from 'elysia';
import { TelegramBotService } from '../services/TelegramBotService';
import type { TelegramMessageType } from '../services/TelegramBotService';
import type { Db } from 'mongodb';
export function createTelegramBotController(db: Db) {
  const telegramBotService = new TelegramBotService(db);

  return new Elysia({ prefix: '/telegram' })
    .get('/status', async () => {
      const status = await telegramBotService.checkBotStatus();
      return status;
    }, {
      detail: {
        summary: 'Проверить статус Telegram бота',
        description: 'Возвращает информацию о статусе бота и его базовых настройках'
      }
    })

    .get('/stack', async () => {
      const stack = await telegramBotService.getArticlesStack();
      return stack;
    }, {
      detail: {
        summary: 'Получить статьи из Telegram',
        description: 'Возвращает статьи из Telegram'
      }
    })
    .delete('/stack/:id', async ({ params }) => {
      const { id } = params;
      await telegramBotService.deleteFromArticlesStack(id);
      return { success: true };
    }, {
      params: t.Object({
        id: t.String()
      }),
      detail: {
        summary: 'Удалить статью из Telegram',
        description: 'Удаляет статью из Telegram'
      }
    })
    .post('/send', async ({ body }) => {
      console.log(body,"BODY")
      const {  title,filterTime=false } = body;
      
      const result = await telegramBotService.publishArticlesStack(title,filterTime);
      
      if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return result;
    }, {
      body: t.Object({
        title: t.String(),
        filterTime: t.Optional(t.Boolean())
      }),
      detail: {
        summary: 'Отправить уведомление в Telegram канал',
        description: 'Отправляет сообщение о новой статье или новости в Telegram канал'
      }
    });
} 