# backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.42. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Настройка Telegram бота

Для отправки уведомлений о новых публикациях в Telegram необходимо:

1. Создать бота в Telegram через BotFather:
   - Открыть чат с [@BotFather](https://t.me/BotFather)
   - Отправить команду `/newbot`
   - Следовать инструкциям и получить токен бота (API Token)

2. Создать канал в Telegram для публикаций:
   - Создать новый канал
   - Добавить созданного бота как администратора с правами публикации сообщений
   - Получить ID канала (можно через бота [@username_to_id_bot](https://t.me/username_to_id_bot) или отправив сообщение в канал и перехватив его через API)

3. Настроить переменные окружения в файле `.env`:
   ```
   TELEGRAM_BOT_TOKEN="ваш_токен_бота"
   TELEGRAM_CHANNEL_ID="id_вашего_канала" 
   ```

## Использование API для отправки уведомлений

Уведомления в Telegram отправляются автоматически при публикации статей и новостей.

### Формат сообщений

При публикации статей и новостей в Telegram-канале будут отправляться сообщения в следующем формате:

**Для статей:**
```
На нашей платформе новая статья!

{заголовок статьи}
[Кнопка "Перейти к чтению"]
```

**Для новостей:**
```
Новость от Dr. Sarha:

{заголовок новости}
[Кнопка "Подробнее"]
```

Кнопки являются интерактивными и ведут на соответствующие страницы сайта.

### Ручная отправка уведомлений

Вы можете отправлять уведомления вручную через API:

```bash
# Отправка уведомления о новой статье
curl -X POST http://localhost:3003/telegram/send \
  -H "Content-Type: application/json" \
  -d '{"message_type": "article", "title": "Заголовок статьи", "link": "https://drsarha.ru/articles/123"}'

# Отправка уведомления о новости
curl -X POST http://localhost:3003/telegram/send \
  -H "Content-Type: application/json" \
  -d '{"message_type": "news", "title": "Заголовок новости", "link": "https://drsarha.ru/news/456"}'
```

Проверить статус и настройки бота можно через эндпоинт:

```bash
curl http://localhost:3003/telegram/status
```
