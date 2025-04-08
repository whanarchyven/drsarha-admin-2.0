'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { eden } from '@/features/eden/eden';

import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
export interface TelegramArticle {
  _id: string;
  message_type: string;
  title: string;
  link: string;
  publishedAt: string;
}

interface ArticleTableProps {
  initialArticles: TelegramArticle[];
}

export default function TelegramArticles({
  initialArticles,
}: ArticleTableProps) {
  const [articles, setArticles] = useState<TelegramArticle[]>(initialArticles);

  const handleDelete = async (id: string) => {
    await eden.telegram.stack({ id }).delete();
    setArticles(articles.filter((article) => article._id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSend = async () => {
    if (title.length === 0) {
      alert('Заголовок не может быть пустым');
      return;
    }
    await eden.telegram.send.post({
      title: title,
      filterTime: true,
    });
    alert('Статьи отправлены в Telegram');
  };
  const [title, setTitle] = useState('');

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Тип</TableHead>
            <TableHead className="w-[50%]">Заголовок</TableHead>
            <TableHead>Дата публикации</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-6 text-muted-foreground">
                Нет данных для отображения
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <TableRow key={article._id}>
                <TableCell className="font-medium">
                  {article.message_type === 'article' ? 'Статья' : 'Новость'}
                </TableCell>
                <TableCell>
                  <a
                    href={article.link}
                    className="hover:underline line-clamp-2"
                    target="_blank"
                    rel="noopener noreferrer">
                    {article.title}
                  </a>
                </TableCell>
                <TableCell>{formatDate(article.publishedAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(article._id)}
                    aria-label="Удалить">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex mt-4 items-center gap-2">
        <Input
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button
          onClick={async () => {
            await handleSend();
          }}>
          Опубликовать в Telegram
        </Button>
      </div>
    </div>
  );
}
