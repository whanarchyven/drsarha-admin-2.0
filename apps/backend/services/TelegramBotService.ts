import axios from 'axios';

export type TelegramMessageType = 'article' | 'news';

interface TelegramNotificationParams {
  message_type: TelegramMessageType;
  title: string;
  link: string;
}

export class TelegramBotService {
  private token: string;
  private channelId: string;

  constructor(token?: string, channelId?: string) {
    this.token = token || process.env.TELEGRAM_BOT_TOKEN || '';
    this.channelId = channelId || process.env.TELEGRAM_CHANNEL_ID || '';
    
    if (!this.token) {
      console.warn('Предупреждение: TELEGRAM_BOT_TOKEN не установлен');
    }
    
    if (!this.channelId) {
      console.warn('Предупреждение: TELEGRAM_CHANNEL_ID не установлен');
    }
  }

  /**
   * Отправляет уведомление в Telegram канал о новой статье или новости
   * @param params Параметры сообщения: тип, заголовок и ссылка
   * @returns Результат отправки сообщения
   */
  async sendNotification(params: TelegramNotificationParams): Promise<any> {
    if (!this.token || !this.channelId) {
      console.error('Ошибка: Telegram бот не настроен. Отсутствует токен или ID канала.');
      return { success: false, error: 'Telegram бот не настроен' };
    }

    try {
      let message = '';
      let buttonText = '';

      // Формируем сообщение в зависимости от типа контента
      if (params.message_type === 'article') {
        message = `На нашей платформе новая статья!\n\n<strong>${params.title}</strong>`;
        buttonText = 'Перейти к чтению';
      } else if (params.message_type === 'news') {
        message = `Новость от Dr. Sarha:\n\n<strong>${params.title}</strong>`;
        buttonText = 'Подробнее';
      } else {
        message = `Новость от Dr. Sarha:\n\n<strong>${params.title}</strong>`;
        buttonText = 'Подробнее';
      }

      // Создаем inline-клавиатуру с кнопкой
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: buttonText,
              url: params.link
            }
          ]
        ]
      };

      // Отправляем сообщение через Telegram Bot API
      const response = await axios.post(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        chat_id: this.channelId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: inlineKeyboard
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка при отправке уведомления в Telegram:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Проверяет настройки Telegram бота и возвращает его статус
   * @returns Статус бота и информацию
   */
  async checkBotStatus(): Promise<any> {
    if (!this.token) {
      return { success: false, error: 'Токен бота не установлен' };
    }

    try {
      const response = await axios.get(`https://api.telegram.org/bot${this.token}/getMe`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }
} 