import { Elysia, t } from 'elysia';
import { TelegramBotService } from '../services/TelegramBotService';
import type { TelegramMessageType } from '../services/TelegramBotService';

export function createTelegramBotController() {
  const telegramBotService = new TelegramBotService();

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

    .post('/send', async ({ body }) => {
      console.log(body,"BODY")
      const { message_type, title, link } = body;
      
      const result = await telegramBotService.sendNotification({
        message_type,
        title,
        link
      });
      
      if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return result;
    }, {
      body: t.Object({
        message_type: t.Enum(t.String(), { values: ['article', 'news'] }),
        title: t.String(),
        link: t.String()
      }),
      detail: {
        summary: 'Отправить уведомление в Telegram канал',
        description: 'Отправляет сообщение о новой статье или новости в Telegram канал'
      }
    });
} 