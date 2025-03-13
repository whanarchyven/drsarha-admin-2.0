'use client';
import '@blocknote/mantine/style.css';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { Article } from '@/entities/Article/model';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SparkleIcon, Sparkles, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCallback, ChangeEvent, useEffect, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { eden } from '@/features/eden/eden';
import SourcesList from '../sources-list';
import { toast } from 'sonner';
interface EditArticleFormProps {
  article: Article;
}
export default function EditArticleForm({ article }: EditArticleFormProps) {
  const initialValues: Article = {
    id: article.id,
    _id: article._id,
    languages: article.languages,
    articleUrl: article.articleUrl,
    dates: article.dates,
    category: article.category,
    publisherName: article.publisherName,
    addons: article.addons,
    title: article.title,
    content: article.content,
    authors: article.authors,
    doi: article.doi,
    meta: {
      isPublished: article.meta.isPublished,
      isIndexed: article.meta.isIndexed,
      hasDevComment: article.meta.hasDevComment,
      isDeleted: article.meta.isDeleted,
      hasTranslation: article.meta.hasTranslation,
      isClinicalCase: article.meta.isClinicalCase,
    },
    subcategory: article.subcategory,
    summary: article.summary,

    references: article.references,
    parserIteration: article.parserIteration,
  };

  const [title, setTitle] = useState(
    initialValues.title.ru.human.length > 0
      ? initialValues.title.ru.human
      : initialValues.title.ru.ai
  );
  const [subcategory, setSubcategory] = useState(initialValues.subcategory);
  const [hasClinicalCase, setHasClinicalCase] = useState(
    initialValues.meta.isClinicalCase
  );
  const [text, setText] = useState(
    initialValues.content.ru.human.length > 0
      ? initialValues.content.ru.human
      : initialValues.content.ru.ai
  );
  const [summary, setSummary] = useState(
    initialValues.summary.ru.human.length > 0
      ? initialValues.summary.ru.human
      : initialValues.summary.ru.ai
  );
  const [sources, setSources] = useState<string[]>(initialValues.references);
  console.log(initialValues, 'SOURCES');

  const options = [
    { label: 'Детская дерматология', value: 'Детская дерматология' },
    { label: 'Дерматовенерология', value: 'Дерматовенерология' },
    { label: 'Трихология', value: 'Трихология' },
    { label: 'Дерматоскопия', value: 'Дерматоскопия' },
    {
      label: 'Дерматозы аногенитальной области',
      value: 'Дерматозы аногенитальной области',
    },
    { label: 'Дерматозы беременных', value: 'Дерматозы беременных' },
    { label: 'Дерматоонкология', value: 'Дерматоонкология' },
  ];

  const isTranslated = Boolean(text);

  const editor = useCreateBlockNote();
  const summaryEditor = useCreateBlockNote();
  // For initialization; on mount, convert the initial Markdown to blocks and replace the default editor's content
  useEffect(() => {
    async function loadInitialHTML() {
      console.log(text);

      // Функция для исправления синтаксиса Markdown изображений
      const fixMarkdownImages = (markdown: string) => {
        if (!markdown) return '';

        // Базовая функция для удаления лишних переносов строк и пробелов в разметке изображений
        let fixedMarkdown = markdown;

        // Шаг 1: Находим все фрагменты вида ![текст], за которыми идёт (ссылка) с возможными пробелами/переносами между ними
        fixedMarkdown = fixedMarkdown.replace(
          /!\[(.*?)\][ \t\r\n]+\((.*?)\)/g,
          '![$1]($2)'
        );

        // Шаг 2: Исправляем случаи, когда внутри URL есть переносы строк или лишние пробелы
        // Находим все разметки изображений и работаем с ними
        const imgPattern = /!\[(.*?)\]\(([\s\S]*?)\)/g;
        fixedMarkdown = fixedMarkdown.replace(
          imgPattern,
          (match, altText, url) => {
            // Удаляем переносы строк и лишние пробелы из URL
            const cleanUrl = url.replace(/[\r\n\t ]+/g, ' ').trim();
            return `![${altText}](${cleanUrl})`;
          }
        );

        // Шаг 3: Находим случаи, когда разметка полностью разорвана переносами строк
        // Пример: ![Рис. 5]
        // (https://example.com/image.jpg)
        const brokenImgPattern = /!\[(.*?)\][ \t]*[\r\n]+[ \t]*\((.*?)\)/g;
        fixedMarkdown = fixedMarkdown.replace(brokenImgPattern, '![$1]($2)');

        // console.log('После исправления изображений:', fixedMarkdown);
        return fixedMarkdown;
      };

      // Функция для извлечения всех изображений из Markdown
      const extractImages = (markdown: string) => {
        if (!markdown) return [];

        const images: Array<{ alt: string; url: string }> = [];
        const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
        let match;

        while ((match = imgRegex.exec(markdown)) !== null) {
          images.push({
            alt: match[1].trim(),
            url: match[2].trim(),
          });
        }

        return images;
      };

      // Функция для создания блока изображения
      const createImageBlock = (url: string, caption: string = '') => {
        return {
          type: 'image',
          id: Math.random().toString(36).substring(2, 11),
          props: {
            backgroundColor: 'default',
            caption: caption,
            name: '',
            previewWidth: 512,
            showPreview: true,
            textAlignment: 'left',
            url: url,
          },
          content: undefined,
          children: [],
        };
      };

      // Функция для поиска и обработки блоков, которые должны быть изображениями
      const processBlocksWithImages = (
        blocks: any[],
        images: Array<{ alt: string; url: string }>
      ) => {
        // Клонируем блоки для работы
        const newBlocks = [...blocks];
        let imageIndex = 0;

        // Для каждого изображения
        for (let i = 0; i < images.length && imageIndex < images.length; i++) {
          const image = images[imageIndex];

          // Ищем блок, который может быть заголовком или параграфом с текстом изображения
          const blockIndex = newBlocks.findIndex((block) => {
            if (!block.content || !block.content.length) return false;

            // Проверяем, содержит ли блок текст, похожий на alt-текст изображения
            const blockText = block.content[0]?.text;
            return (
              blockText &&
              (blockText.includes(image.alt) || image.alt.includes(blockText))
            );
          });

          if (blockIndex !== -1) {
            // Вставляем блок изображения после найденного блока
            const imageBlock = createImageBlock(image.url, image.alt);
            newBlocks.splice(blockIndex + 1, 0, imageBlock);
            imageIndex++;
          }
        }

        // Добавляем оставшиеся изображения в конец документа
        for (let i = imageIndex; i < images.length; i++) {
          const imageBlock = createImageBlock(images[i].url, images[i].alt);
          newBlocks.push(imageBlock);
        }

        return newBlocks;
      };

      // Применяем исправление перед парсингом
      const fixedText = text ? fixMarkdownImages(text as string) : '';
      const fixedSummary = summary ? fixMarkdownImages(summary as string) : '';

      // Извлекаем все изображения из Markdown
      const images = extractImages(fixedText);
      // console.log('Найдены изображения:', images);

      // Парсим Markdown в блоки
      const blocksText = await editor.tryParseMarkdownToBlocks(fixedText);
      // console.log('Исходные блоки:', blocksText);

      // Обрабатываем блоки, добавляя изображения
      const processedBlocks = processBlocksWithImages(blocksText, images);
      // console.log('Обработанные блоки с изображениями:', processedBlocks);

      // Заменяем блоки в редакторе
      editor.replaceBlocks(editor.document, processedBlocks);

      // То же самое для саммари
      const imagesSummary = extractImages(fixedSummary);
      const blocksSummary =
        await summaryEditor.tryParseMarkdownToBlocks(fixedSummary);
      const processedBlocksSummary = processBlocksWithImages(
        blocksSummary,
        imagesSummary
      );
      summaryEditor.replaceBlocks(
        summaryEditor.document,
        processedBlocksSummary
      );
    }
    loadInitialHTML();
  }, []);

  console.log(sources, 'SOURCES');

  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    setIsTranslating(true);
    toast.loading('Переводим статью, ожидайте...');
    const res = await eden.editor.articles.translate.post({
      identifier: article.id,
      type: 'id',
    });
    if (res.data && (res.data as any).task_id) {
      const taskId = (res.data as any).task_id;
      toast.success('Статья отправлена на перевод, ожидайте...');
      const checkTask = async () => {
        const res = await eden.editor.articles
          .translation({ task_id: taskId })
          .get();
        console.log(res?.data?.status, 'RES DATA TRANSLATION');
        if (res?.data?.status == 'completed') {
          console.log('Статья переведена');
          toast.success('Статья переведена! Не забудьте сохранить изменения');
          setIsTranslating(false);
        } else {
          toast.loading('Переводим статью, ожидайте...');
          setTimeout(() => {
            checkTask();
          }, 10000);
        }
      };
      checkTask();
    }
    if (res?.error) {
      toast.error(res.error.value.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Редактирование статьи</h1>
          <Badge variant={article.meta.isPublished ? 'success' : 'destructive'}>
            {article.meta.isPublished ? 'Опубликовано' : 'Не опубликовано'}
          </Badge>
          <Badge variant={isTranslated ? 'success' : 'destructive'}>
            {isTranslated ? 'Переведено' : 'Не переведено'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {article.meta.isDeleted ? (
            <Button
              onClick={async () => {
                const res = await eden.editor
                  .articles({ id: article.id })
                  .patch({
                    isDeleted: false,
                  });
                if (res?.error) {
                  toast.error(res.error.value.message);
                } else {
                  toast.success('Статья восстановлена');
                  window.location.reload();
                }
              }}
              variant="success">
              Восстановить
            </Button>
          ) : (
            <Button
              onClick={async () => {
                const res = await eden.editor
                  .articles({ id: article.id })
                  .patch({
                    isDeleted: true,
                  });
                if (res?.error) {
                  toast.error(res.error.value.message);
                } else {
                  toast.success('Статья удалена');
                  window.location.reload();
                }
              }}
              variant="destructive">
              Удалить
            </Button>
          )}

          {article.meta.isPublished ? (
            <Button
              onClick={async () => {
                const res = await eden.editor
                  .articles({ id: article.id })
                  .patch({
                    isPublished: false,
                  });
                if (res?.error) {
                  toast.error(res.error.value.message);
                } else {
                  toast.success('Статья снята с публикации');
                  window.location.reload();
                }
              }}
              variant="destructive">
              Снять с публикации
            </Button>
          ) : (
            <Button
              onClick={async () => {
                const res = await eden.editor
                  .articles({ id: article.id })
                  .patch({
                    isPublished: true,
                  });
                if (res?.error) {
                  toast.error(res.error.value.message);
                } else {
                  toast.success('Статья опубликована');
                  window.location.reload();
                }
              }}
              variant="success">
              Опубликовать
            </Button>
          )}
          <Button
            onClick={handleTranslate}
            variant="cPrimary"
            className="flex items-center gap-2">
            {isTranslating ? (
              <Loader2 className="w-4 h-4 fill-white animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 fill-white" />
            )}
            AI перевод
          </Button>
        </div>
      </div>
      <div className="flex mt-4 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Заголовок</Label>
          <Textarea
            rows={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Категория</Label>
          <Select
            value={subcategory}
            onValueChange={(value) => setSubcategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>Клинический случай</Label>
          <Switch
            checked={hasClinicalCase}
            onCheckedChange={(checked) => setHasClinicalCase(checked)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Текст статьи</Label>
          <BlockNoteView className="border-2" theme="light" editor={editor} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Саммари статьи</Label>
          <BlockNoteView
            className="border-2"
            theme="light"
            editor={summaryEditor}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Список источников</Label>
          <SourcesList
            initialSources={sources}
            onChange={(sources) => {
              setSources(sources);
            }}
          />
        </div>
        <Button
          onClick={async () => {
            const markdown = await editor.blocksToMarkdownLossy();
            const summaryMarkdown = await summaryEditor.blocksToMarkdownLossy();
            console.log(subcategory);
            console.log(title);
            console.log(sources);
            console.log(markdown);
            console.log(summaryMarkdown);
            const res = await eden.editor.articles({ id: article.id }).patch({
              content_ru_human: markdown,
              summary_ru_human: summaryMarkdown,
              subcategory: subcategory,
              title_ru_human: title,
              isClinicalCase: hasClinicalCase,
              references: sources,
            });
            if (res?.error) {
              toast.error(res.error.value.message);
            } else {
              toast.success('Статья успешно обновлена');
            }
          }}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
