import axios from 'axios';
import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
export type TelegramMessageType = 'article' | 'news';

interface TelegramNotificationParams {
  message_type: TelegramMessageType;
  title: string;
  link: string;
  publishedAt: string;
}

export class TelegramBotService {
  private token: string;
  private channelId: string;
  private db: Db;

  constructor(db: Db, token?: string, channelId?: string) {
    this.token = token || process.env.TELEGRAM_BOT_TOKEN || '';
    this.channelId = channelId || process.env.TELEGRAM_CHANNEL_ID || '';
    this.db = db;
    
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

    await this.pushToArticlesStack(params);
  }

  async pushToArticlesStack(params: TelegramNotificationParams){
    const articlesStack = await this.db.collection('telegram_articles_stack').find({}).toArray();
    if(articlesStack.find(item => item.link === params.link)){
      return;
    }
    await this.db.collection('telegram_articles_stack').insertOne({
      ...params,
      publishedAt: new Date().toISOString()
    });
  }

  async deleteFromArticlesStack(id:string){
    await this.db.collection('telegram_articles_stack').deleteOne({
      _id: new ObjectId(id)
    });
  }

  async getArticlesStack(filterTime:boolean=true){
    const articlesStack = await this.db.collection('telegram_articles_stack').find({}).toArray();
    if(filterTime){
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return articlesStack.filter(item => item.publishedAt > oneDayAgo.toISOString());
    }
    return articlesStack;
  }

  async publishArticlesStack(title:string,filterTime:boolean=false){
    // Получаем статьи за последние 24 часа
    const articlesStack = await this.getArticlesStack(filterTime);
    
    let result=`<strong>${title}</strong>\n\n`
    
    for(const item of articlesStack){
      result+=`<strong>${item.message_type==='article'?'Статья':'Новость'}: ${item.title}</strong> - <a href="${item.link}">Читать</a>\n\n`
    }
    console.log(result,"RESULT")

    try {
      // Отправляем сообщение через Telegram Bot API
      // Отправляем фото с подписью через Telegram Bot API
      const response = await axios.post(`https://api.telegram.org/bot${this.token}/sendPhoto`, {
        chat_id: this.channelId,
        photo: 'https://i.imgur.com/71GXZHV.png', // URL изображения, замените на нужный
        caption: result, // Текст будет отображаться под изображением
        parse_mode: 'HTML',
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