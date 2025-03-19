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

  // Выводим информацию о контенте
  console.log('Content Structure:', {
    hasRaw: Boolean(initialValues.content?.raw),
    rawLength: initialValues.content?.raw
      ? initialValues.content.raw.length
      : 0,
    hasRuAi: Boolean(initialValues.content?.ru?.ai),
    ruAiLength: initialValues.content?.ru?.ai
      ? initialValues.content.ru.ai.length
      : 0,
    hasRuHuman: Boolean(initialValues.content?.ru?.human),
    ruHumanLength: initialValues.content?.ru?.human
      ? initialValues.content.ru.human.length
      : 0,
  });

  const [summary, setSummary] = useState(
    initialValues.summary.ru.human.length > 0
      ? initialValues.summary.ru.human
      : initialValues.summary.ru.ai
  );
  const [sources, setSources] = useState<string[]>(initialValues.references);
  console.log(initialValues, 'SOURCES');

  const options = [
    { label: 'Детская дерматология', value: 'Детская дерматология' },
    { label: 'Педиатрия', value: 'Педиатрия' },
    { label: 'Диетология', value: 'Диетология' },
    { label: 'Дерматология', value: 'Дерматология' },
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
      // Найдем таблицы в исходном тексте перед всеми преобразованиями
      const extractHTMLTablesFromOriginal = (
        content: string | undefined
      ): string[] => {
        if (!content) return [];

        console.log(
          'Ищем таблицы в исходном тексте, длина контента:',
          content.length
        );
        console.log('Первые 100 символов контента:', content.substring(0, 100));

        const tableRegex = /<table[\s\S]*?<\/table>/gi;
        const tables = content.match(tableRegex) || [];

        console.log(`Найдено таблиц в исходном тексте: ${tables.length}`);
        if (tables.length > 0 && tables[0]) {
          console.log('Пример найденной таблицы:', tables[0].substring(0, 200));
        } else {
          // Проверим наличие частей таблиц в контенте
          console.log('Проверка фрагментов таблиц:');
          console.log('- Открывающий тег <table>:', content.includes('<table'));
          console.log(
            '- Закрывающий тег </table>:',
            content.includes('</table>')
          );
          console.log('- Тег <tr>:', content.includes('<tr>'));
          console.log('- Тег <td>:', content.includes('<td>'));

          // Попробуем искать с другим регулярным выражением
          const alternativeRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
          const altTables = content.match(alternativeRegex) || [];
          console.log(
            `Найдено таблиц с альтернативным regex: ${altTables.length}`
          );

          // Проверим, есть ли в тексте "Диагностические критерии" (из примера)
          if (content.includes('Диагностические критерии')) {
            console.log('Найдено упоминание "Диагностические критерии"');
            const index = content.indexOf('Диагностические критерии');
            console.log(
              'Контекст вокруг:',
              content.substring(
                Math.max(0, index - 50),
                Math.min(content.length, index + 300)
              )
            );
          }
        }

        return tables;
      };

      // Извлекаем таблицы из исходного текста
      console.log('Тип text:', typeof text);
      console.log('Значение text существует:', Boolean(text));
      const originalTables = extractHTMLTablesFromOriginal(text as string);

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

      // Функция для создания блока таблицы
      const createTableBlock = (htmlTable: string) => {
        try {
          // Добавляем базовую проверку HTML перед созданием блока
          if (
            !htmlTable ||
            !htmlTable.includes('<table') ||
            !htmlTable.includes('</table>')
          ) {
            console.warn(
              'Некорректный HTML таблицы:',
              htmlTable?.substring(0, 100)
            );
            return null;
          }

          return {
            type: 'table',
            id: Math.random().toString(36).substring(2, 11),
            props: {
              outerHTML: htmlTable,
            },
            content: undefined,
            children: [],
          };
        } catch (error) {
          console.error('Ошибка при создании блока таблицы:', error);
          return null;
        }
      };

      // Функция для обработки блоков с таблицами
      const processBlocksWithTables = async (
        blocks: any[],
        tables: string[]
      ) => {
        if (!tables || !tables.length) return blocks;

        // Клонируем блоки для работы
        const newBlocks = [...blocks];
        console.log('Начинаем вставку таблиц, всего таблиц:', tables.length);

        for (const table of tables) {
          try {
            // Проверяем, что таблица валидная
            if (!table || table.trim() === '') {
              console.warn('Пустая таблица, пропускаем');
              continue;
            }

            // Создаем таблицу
            let tableBlocks: any[] = [];

            if (typeof editor.tryParseHTMLToBlocks === 'function') {
              try {
                console.log(table, 'TABLE');
                tableBlocks = await editor.tryParseHTMLToBlocks(table);
                console.log(tableBlocks, 'TABLE BLOCKS');
              } catch (parseError) {
                console.error('Ошибка при парсинге HTML в блоки:', parseError);
              }
            }

            // Если не удалось создать блоки, создаем вручную
            if (!tableBlocks || !tableBlocks.length) {
              const tableBlock = createTableBlock(table);
              if (tableBlock) {
                tableBlocks = [tableBlock];
              } else {
                console.warn('Не удалось создать блок таблицы, пропускаем');
                continue;
              }
            }

            // Ищем место для вставки таблицы
            // 1. Проверяем, есть ли в HTML-таблице какой-то заголовок
            const tableCaption = table.match(/<caption.*?>(.*?)<\/caption>/i);
            const tableCaptionText = tableCaption ? tableCaption[1] : '';

            // 2. Также получаем первую строку таблицы для поиска
            const firstTableRow = table.match(/<tr.*?>(.*?)<\/tr>/i);
            const firstRowText = firstTableRow ? firstTableRow[1] : '';

            console.log(
              'Ищем место для таблицы с заголовком:',
              tableCaptionText
            );

            // 3. Найдем наиболее подходящее место для вставки таблицы
            let insertIndex = -1;

            // Сначала ищем блок с заголовком таблицы (если есть)
            if (tableCaptionText) {
              insertIndex = newBlocks.findIndex((block) => {
                if (!block.content || !block.content.length) return false;
                const blockText = block.content[0]?.text || '';
                return blockText.includes(tableCaptionText);
              });
            }

            // Если блок с заголовком не найден, ищем подходящий абзац,
            // который может предшествовать таблице
            if (insertIndex === -1) {
              // Ищем блоки, которые могут предшествовать таблице
              const potentialTableHeaders = [
                'Таблица',
                'Table',
                'Диагностические критерии',
                'Клинические признаки',
                'Гистопатологические признаки',
              ];

              for (let i = 0; i < newBlocks.length; i++) {
                const block = newBlocks[i];
                if (!block.content || !block.content.length) continue;

                const blockText = block.content[0]?.text || '';

                // Проверяем, содержит ли блок текст, который может быть заголовком для таблицы
                const isTableHeader = potentialTableHeaders.some((header) =>
                  blockText.includes(header)
                );

                if (isTableHeader) {
                  console.log('Найден блок-кандидат для таблицы:', blockText);
                  insertIndex = i;
                  break;
                }
              }
            }

            // Если нашли подходящее место
            if (insertIndex !== -1) {
              console.log(
                `Вставляем таблицу после блока с индексом ${insertIndex}`
              );
              newBlocks.splice(insertIndex + 1, 0, ...tableBlocks);
              console.log(
                'Таблица вставлена после блока с индексом:',
                insertIndex
              );
              console.log('Новый блок:', newBlocks[insertIndex + 1]);
              console.log('Все блоки:', newBlocks);
            } else {
              // Если место не нашли, добавляем в конец
              console.log(
                'Подходящее место для таблицы не найдено, добавляем в конец'
              );
              newBlocks.push(...tableBlocks);
            }
          } catch (error) {
            console.error('Ошибка при обработке таблицы:', error);
          }
        }

        return newBlocks;
      };

      // Применяем исправление перед парсингом
      const fixedText = text ? fixMarkdownImages(text as string) : '';
      const fixedSummary = summary ? fixMarkdownImages(summary as string) : '';

      // Извлекаем все изображения из Markdown
      const images = extractImages(fixedText);

      // Парсим Markdown в блоки
      const blocksText = await editor.tryParseMarkdownToBlocks(fixedText);

      // Сначала обрабатываем блоки, добавляя изображения
      let processedBlocks = processBlocksWithImages(blocksText, images);

      // Обрабатываем блоки, добавляя таблицы из оригинального текста
      if (originalTables && originalTables.length > 0) {
        console.log(
          'Используем таблицы из исходного текста:',
          originalTables.length
        );
        try {
          processedBlocks = await processBlocksWithTables(
            processedBlocks,
            originalTables
          );
        } catch (error) {
          console.error('Ошибка при обработке таблиц:', error);
        }
      } else {
        console.log('Не найдено таблиц в исходном тексте');
      }

      // Заменяем блоки в редакторе
      if (editor && editor.document) {
        try {
          await editor.replaceBlocks(editor.document, processedBlocks);
        } catch (error) {
          console.error('Ошибка при замене блоков в редакторе:', error);
          // Попробуем более безопасный способ установки блоков без таблиц
          try {
            // Фильтруем таблицы из блоков, если они вызывают проблемы
            const safeBlocks = processedBlocks.filter(
              (block) => block.type !== 'table'
            );
            console.log(
              'Пробуем установить блоки без таблиц, количество блоков:',
              safeBlocks.length
            );
            await editor.replaceBlocks(editor.document, safeBlocks);
          } catch (innerError) {
            console.error(
              'Не удалось установить даже безопасные блоки:',
              innerError
            );
          }
        }
      } else {
        console.error('Редактор или документ не доступны');
      }

      // То же самое для саммари
      const imagesSummary = extractImages(fixedSummary);
      console.log('Проверяем наличие таблиц в саммари:');
      const originalTablesSummary = extractHTMLTablesFromOriginal(
        summary as string
      );
      const blocksSummary =
        await summaryEditor.tryParseMarkdownToBlocks(fixedSummary);

      let processedBlocksSummary = processBlocksWithImages(
        blocksSummary,
        imagesSummary
      );

      // Обрабатываем блоки саммари, добавляя таблицы
      if (originalTablesSummary && originalTablesSummary.length > 0) {
        try {
          processedBlocksSummary = await processBlocksWithTables(
            processedBlocksSummary,
            originalTablesSummary
          );
        } catch (error) {
          console.error('Ошибка при обработке таблиц в саммари:', error);
        }
      }

      // Безопасная замена блоков в редакторе саммари
      if (summaryEditor && summaryEditor.document) {
        try {
          await summaryEditor.replaceBlocks(
            summaryEditor.document,
            processedBlocksSummary
          );
        } catch (error) {
          console.error('Ошибка при замене блоков в редакторе саммари:', error);
          // Пробуем более безопасный вариант - без таблиц
          try {
            // Фильтруем таблицы из блоков, если они вызывают проблемы
            const safeBlocksSummary = processedBlocksSummary.filter(
              (block) => block.type !== 'table'
            );
            console.log(
              'Пробуем установить блоки саммари без таблиц, количество блоков:',
              safeBlocksSummary.length
            );
            await summaryEditor.replaceBlocks(
              summaryEditor.document,
              safeBlocksSummary
            );
          } catch (innerError) {
            console.error(
              'Не удалось установить даже безопасные блоки саммари:',
              innerError
            );
          }
        }
      } else {
        console.error('Редактор саммари или его документ не доступны');
      }
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
        // Определяем тип для ответа API
        interface TranslationResponse {
          status?: string;
          [key: string]: any;
        }

        const res = await eden.editor.articles
          .translation({ task_id: taskId })
          .get();

        // Приводим данные к правильному типу
        const translationData = res.data as TranslationResponse;

        console.log(translationData.status, 'RES DATA TRANSLATION');

        if (translationData.status === 'completed') {
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
