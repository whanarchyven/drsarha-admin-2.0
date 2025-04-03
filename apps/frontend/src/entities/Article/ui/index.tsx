'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Article } from '../model';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import ResizableContainer from '@/components/resizable-container';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { deleteArticle } from '@/shared/api/articles/deleteArticle';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { restoreArticle } from '@/shared/api/articles/restoreArticle';
import { eden } from '@/features/eden/eden';
// Функция для обработки markdown текста
const processMarkdownText = (text: string) => {
  if (!text) return '';

  // Если текст приходит в виде JSON-строки, парсим его
  if (text.startsWith('"') && text.endsWith('"')) {
    try {
      return JSON.parse(text);
    } catch (e) {
      // Если парсинг не удался, возвращаем исходный текст
      return text;
    }
  }

  // Заменяем строковые представления символов \n на реальные переносы строк
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"');
};

interface ArticleCardProps extends Article {
  updateFunction: () => void;
}

// Определяем тип для языков
type Language = 'en' | 'ru';

const ArticleCard = (props: ArticleCardProps) => {
  console.log(props, 'PROPS');
  // Используем этот тип для переменной locale
  const [locale, setLocale] = useState<Language>('en');

  // Теперь TypeScript знает, что locale может быть только 'en' или 'ru'
  const [displayTitle, setDisplayTitle] = useState(
    props.title[locale].human.length > 0
      ? props.title[locale].human
      : props.title.raw
  );
  // Обрабатываем текст перед отображением
  const [displayContent, setDisplayContent] = useState(
    props.content[locale].human.length > 0
      ? props.content[locale].human
      : props.content.raw
  );

  const isTranslated = props.content.ru.ai.length > 0;
  const hasClinicCase = props.meta.isClinicalCase;

  const [displaySummary, setDisplaySummary] = useState(
    props.summary.ru.human ?? props.summary.ru.ai
  );

  const productionUrl = `https://drsarha.ru/articles?url=${props.articleUrl}`;

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [openUnpublishDialog, setOpenUnpublishDialog] = useState(false);

  const handleDelete = async () => {
    const res = await eden.editor.articles({ id: props._id }).delete();
    if (res?.error) {
      toast.error(res.error.value.message);
    } else {
      toast.success('Статья удалена');
      props.updateFunction();
    }
  };

  const handleRestore = async () => {
    const res = await eden.editor.articles({ id: props._id }).restore.post();
    if (res?.error) {
      toast.error(res.error.value.message);
    } else {
      toast.success('Статья восстановлена');
      props.updateFunction();
    }
  };

  const handlePublish = async () => {
    const res = await eden.editor.articles({ id: props._id }).patch({
      isPublished: true,
    });
    if (res?.error) {
      toast.error(res.error.value.message);
    } else {
      toast.success('Статья опубликована');
      props.updateFunction();
    }
  };

  const handleUnpublish = async () => {
    const res = await eden.editor.articles({ id: props._id }).patch({
      isPublished: false,
    });
    console.log(res,"RES")
    if (res?.error) {
      toast.error(res.error.value.message);
    } else {
      toast.success('Статья снята с публикации');
      props.updateFunction();
    }
  };

  useEffect(() => {
    setDisplayTitle(
      props.title[locale].human.length > 0
        ? props.title[locale].human
        : props.title.raw
    );
    setDisplayContent(
      props.content[locale].human.length > 0
        ? props.content[locale].human
        : props.content.raw
    );
    setDisplaySummary(props.summary.ru.human ?? props.summary.ru.ai);
  }, [locale]);

  return (
    <>
      <Card className="w-full overflow-hidden border-cBlack border-2">
        <CardHeader>
          <CardTitle>
            <div className="flex items-start justify-between gap-12">
              <p className="text-lg font-bold">{displayTitle}</p>
              {isTranslated && (
                <div className="flex items-center gap-2">
                  <p>EN</p>
                  <Switch
                    checked={locale == 'ru'}
                    onCheckedChange={() =>
                      setLocale(locale == 'ru' ? 'en' : 'ru')
                    }
                  />
                  <p>RU</p>
                </div>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center text-cBlack gap-4">
              <p className="text-sm font-bold ">
                {format(new Date(props.dates.published), 'dd.MM.yyyy')}
              </p>
              <a
                href={props.articleUrl}
                target="_blank"
                className="text-sm underline font-bold cursor-pointer">
                источник
              </a>
              <Badge variant={props.subcategory ? 'info' : 'secondary'}>
                {props.subcategory && props.subcategory.length > 0
                  ? props.subcategory
                  : 'Без категории'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 my-4">
              <Badge variant={isTranslated ? 'success' : 'secondary'}>
                {isTranslated ? 'Переведено' : 'Не переведено'}
              </Badge>
              <Badge variant={props.meta.isPublished ? 'success' : 'secondary'}>
                {props.meta.isPublished ? 'Опубликовано' : 'Не опубликовано'}
              </Badge>
              <Badge variant={hasClinicCase ? 'success' : 'secondary'}>
                {hasClinicCase ? 'Клинический случай' : 'Не клинический случай'}
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 markdown-content whitespace-pre-line">
          <div className="w-full my-4 flex flex-col gap-2">
            <p className="text-sm font-bold italic">Контент</p>
            <div className="border-2 border-gray-200 rounded-md p-2">
              <ResizableContainer>
                <div
                  className="markdown-content"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(displayContent),
                  }}></div>
              </ResizableContainer>
            </div>
          </div>
          {displaySummary && displaySummary.length > 0 && (
            <div className="w-full my-4 flex flex-col gap-2">
              <p className="text-sm font-bold italic">Саммари</p>
              <div className="border-2 border-gray-200 rounded-md p-2">
                <ResizableContainer>
                  <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(displaySummary),
                    }}></div>
                </ResizableContainer>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {props.meta.isPublished && (
            <Link href={productionUrl} target="_blank">
              <Button variant="outline" className="">
                Посмотреть
              </Button>
            </Link>
          )}
          <Link href={`/articles/${props._id}/edit`} target="_blank">
            <Button variant="cPrimary" className="">
              Редактировать
            </Button>
          </Link>
          {props.meta.isDeleted ? (
            <Button
              onClick={() => setOpenRestoreDialog(true)}
              variant="success"
              className="">
              Восстановить
            </Button>
          ) : (
            <Button
              onClick={() => setOpenDeleteDialog(true)}
              variant="destructive"
              className="">
              Удалить
            </Button>
          )}
          <Button
            variant={props.meta.isPublished ? 'destructive' : 'success'}
            className=""
            onClick={() =>
              props.meta.isPublished
                ? setOpenUnpublishDialog(true)
                : setOpenPublishDialog(true)
            }>
            {props.meta.isPublished ? 'Снять с публикации' : 'Опубликовать'}
          </Button>
        </CardFooter>
      </Card>

      {/* Delete dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены, что хотите удалить статью?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Статью позднее можно будет восстановить. Статья пропадёт из
              индексации и не будет доступна для просмотра пользователями на
              сайте.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleDelete}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore dialog */}
      <AlertDialog open={openRestoreDialog} onOpenChange={setOpenRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены, что хотите восстановить статью?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Повторно проверьте содержимое статьи и нажмите Восстановить.
              Проверьте, опубликована ли статья.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction className="bg-green-500" onClick={handleRestore}>
              Восстановить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish dialog */}
      <AlertDialog open={openPublishDialog} onOpenChange={setOpenPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены, что хотите опубликовать статью?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Повторно проверьте содержимое статьи перед публикацией.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction className="bg-green-500" onClick={handlePublish}>
              Опубликовать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish dialog */}
      <AlertDialog
        open={openUnpublishDialog}
        onOpenChange={setOpenUnpublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены, что хотите снять статью с публикации?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Пользователи не смогут просматривать статью на сайте.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleUnpublish}>
              Снять с публикации
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ArticleCard;
