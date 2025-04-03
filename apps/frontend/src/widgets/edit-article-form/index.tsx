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

  console.log(initialValues.content.ru.ai, 'SUKA AI');
  // For initialization; on mount, convert the initial Markdown to blocks and replace the default editor's content
  useEffect(() => {
    async function loadInitialHTML() {
      // Найдем таблицы в исходном тексте перед всеми преобразованиями
      const extractHTMLTablesFromOriginal = (
        content: string | undefined
      ): Array<{ html: string; position: number }> => {
        if (!content) return [];

        console.log(
          'Ищем таблицы в исходном тексте, длина контента:',
          content.length
        );
        console.log('Первые 100 символов контента:', content.substring(0, 100));

        const tableRegex = /<table[\s\S]*?<\/table>/gi;
        const tables: Array<{ html: string; position: number }> = [];

        // Находим все таблицы в тексте с их позициями
        let match;
        while ((match = tableRegex.exec(content)) !== null) {
          const position = match.index;
          const html = match[0];

          // Очищаем таблицу от дублирующихся тегов tr
          const cleanedHtml = fixDuplicateTrTags(html);

          // Добавляем в результат таблицу с позицией
          tables.push({
            html: cleanedHtml,
            position: position,
          });

          console.log(
            `Найдена таблица в позиции ${position}, размер: ${cleanedHtml.length} символов`
          );
        }

        console.log(`Найдено таблиц в исходном тексте: ${tables.length}`);
        if (tables.length > 0) {
          console.log(
            'Позиции найденных таблиц:',
            tables.map((t) => t.position)
          );
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
        }

        return tables;
      };

      // Простая функция для исправления дублирующихся тегов tr в таблице
      const fixDuplicateTrTags = (html: string): string => {
        if (!html) return '';

        // Исправляем последовательности <tr><tr> на <tr>
        let fixed = html.replace(/<tr[^>]*>\s*<tr[^>]*>/gi, '<tr>');

        // Исправляем последовательности </tr></tr> на </tr>
        fixed = fixed.replace(/<\/tr>\s*<\/tr>/gi, '</tr>');

        return fixed;
      };

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

      // Функция для извлечения всех изображений из Markdown с их позициями
      const extractImages = (markdown: string) => {
        if (!markdown) return [];

        const images: Array<{ alt: string; url: string; position: number }> =
          [];
        const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
        let match;

        while ((match = imgRegex.exec(markdown)) !== null) {
          images.push({
            alt: match[1].trim(),
            url: match[2].trim(),
            position: match.index,
          });
          console.log(
            `Найдено изображение в позиции ${match.index} с alt текстом: ${match[1].trim()}`
          );
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
        images: Array<{ alt: string; url: string; position: number }>
      ) => {
        if (!images || !images.length) return blocks;

        // Клонируем блоки для работы
        const newBlocks = [...blocks];
        console.log(
          'Начинаем вставку изображений, всего изображений:',
          images.length
        );

        // Детальный лог существующих блоков
        console.log('АНАЛИЗ СУЩЕСТВУЮЩИХ БЛОКОВ ДЛЯ ВСТАВКИ ИЗОБРАЖЕНИЙ:');
        newBlocks.forEach((block, idx) => {
          if (block.content && block.content.length) {
            const text = block.content
              .map((item: any) => item.text || '')
              .join(' ');
            console.log(
              `Блок [${idx}], тип: ${block.type}, текст: "${text.substring(0, 50)}..."`
            );
          } else {
            console.log(`Блок [${idx}], тип: ${block.type}, без текста`);
          }
        });

        // Получаем исходный текст
        const originalText = text as string;
        if (!originalText || originalText.length === 0) {
          console.warn(
            'Исходный текст пустой, не можем определить позиции блоков'
          );
          return newBlocks;
        }

        // Сортируем изображения по их позициям
        const sortedImages = [...images].sort(
          (a, b) => a.position - b.position
        );
        console.log(
          'Отсортированные изображения по позиции:',
          sortedImages.map((img) => ({
            position: img.position,
            alt: img.alt.substring(0, 30),
          }))
        );

        // Создаем массив изображений для вставки, по аналогии с таблицами
        const imagesToInsert: Array<{
          imageBlock: any;
          position: number;
          insertAfterBlock?: number;
        }> = [];

        // Подготавливаем изображения для вставки
        for (const imageData of sortedImages) {
          try {
            const imageBlock = createImageBlock(imageData.url, imageData.alt);

            imagesToInsert.push({
              imageBlock,
              position: imageData.position,
            });

            console.log(
              `Подготовлен блок изображения с alt: "${imageData.alt.substring(0, 30)}" для позиции ${imageData.position}`
            );
          } catch (error) {
            console.error('Ошибка при создании блока изображения:', error);
          }
        }

        // Для более точного расположения изображений будем использовать содержимое блоков и исходного текста
        // Создадим карту соответствия исходного текста и блоков в редакторе, по аналогии с таблицами
        const blockTexts: Array<{
          blockIndex: number;
          text: string;
          startPos: number; // Примерная начальная позиция текста этого блока в исходном тексте
          endPos: number; // Примерная конечная позиция текста этого блока в исходном тексте
        }> = [];

        let currentPosition = 0;

        // Извлекаем текст из каждого блока и оцениваем его позицию в исходном тексте
        for (let i = 0; i < newBlocks.length; i++) {
          const block = newBlocks[i];
          let blockText = '';

          if (block.content && block.content.length) {
            blockText = block.content
              .map((item: any) => item.text || '')
              .join(' ');
          }

          // Пропускаем пустые блоки и нетекстовые блоки
          if (blockText.length === 0 && block.type !== 'paragraph') {
            continue;
          }

          // Находим этот текст в исходном тексте
          const textPosition = originalText.indexOf(blockText, currentPosition);

          if (textPosition !== -1) {
            // Текст блока найден в исходном тексте
            blockTexts.push({
              blockIndex: i,
              text: blockText,
              startPos: textPosition,
              endPos: textPosition + blockText.length,
            });

            // Обновляем текущую позицию поиска, чтобы избежать повторного нахождения того же текста
            currentPosition = textPosition + blockText.length;

            console.log(
              `Блок [${i}] найден в исходном тексте на позиции ${textPosition}`
            );
          } else {
            // Если точное совпадение не найдено, пробуем искать по частям текста
            if (blockText.length > 100) {
              const shortText = blockText.substring(0, 100);
              const shortPosition = originalText.indexOf(
                shortText,
                currentPosition
              );

              if (shortPosition !== -1) {
                blockTexts.push({
                  blockIndex: i,
                  text: blockText,
                  startPos: shortPosition,
                  endPos: shortPosition + blockText.length,
                });

                currentPosition = shortPosition + blockText.length;
                console.log(
                  `Блок [${i}] найден по сокращенному тексту на позиции ${shortPosition}`
                );
                continue;
              }
            }

            if (blockText.length > 50) {
              const shortText = blockText.substring(0, 50);
              const shortPosition = originalText.indexOf(
                shortText,
                currentPosition
              );

              if (shortPosition !== -1) {
                blockTexts.push({
                  blockIndex: i,
                  text: blockText,
                  startPos: shortPosition,
                  endPos: shortPosition + blockText.length,
                });

                currentPosition = shortPosition + blockText.length;
                console.log(
                  `Блок [${i}] найден по короткому тексту на позиции ${shortPosition}`
                );
                continue;
              }
            }

            // Если все еще не нашли, используем приблизительную оценку
            blockTexts.push({
              blockIndex: i,
              text: blockText,
              startPos: currentPosition,
              endPos: currentPosition + blockText.length,
            });

            currentPosition += blockText.length;

            console.log(
              `Блок [${i}] не найден точно, приблизительная позиция: ${currentPosition}`
            );
          }
        }

        console.log(
          'Блоки с их позициями:',
          blockTexts.map((b) => ({
            blockIndex: b.blockIndex,
            startPos: b.startPos,
            text: b.text.substring(0, 30) + '...',
          }))
        );

        // Сортируем блоки по их позициям в исходном тексте
        blockTexts.sort((a, b) => a.startPos - b.startPos);

        // Для каждого изображения находим наиболее подходящий блок для вставки
        for (const imageInfo of imagesToInsert) {
          let bestBlockIndex = -1;

          // Ищем блок, который находится перед позицией изображения
          for (let i = 0; i < blockTexts.length; i++) {
            const blockInfo = blockTexts[i];

            // Если блок заканчивается до начала изображения
            if (blockInfo.endPos <= imageInfo.position) {
              bestBlockIndex = blockInfo.blockIndex;
            } else if (blockInfo.startPos > imageInfo.position) {
              // Если мы нашли блок, который начинается после изображения,
              // то изображение должно идти перед этим блоком
              if (i > 0) {
                bestBlockIndex = blockTexts[i - 1].blockIndex;
              } else {
                bestBlockIndex = 0; // В начале документа
              }
              break;
            }
          }

          // Если не нашли подходящий блок, вставим изображение в конец
          if (bestBlockIndex === -1) {
            bestBlockIndex = newBlocks.length - 1;
          }

          console.log(
            `Для изображения в позиции ${imageInfo.position} определен блок для вставки: ${bestBlockIndex}`
          );
          imageInfo.insertAfterBlock = bestBlockIndex;
        }

        // Сортируем изображения для вставки от конца к началу,
        // чтобы не нарушать индексы уже вставленных изображений
        const sortedForInsertion = [...imagesToInsert].sort(
          (a, b) => (b.insertAfterBlock || 0) - (a.insertAfterBlock || 0)
        );

        // Вставляем изображения
        for (const imageInfo of sortedForInsertion) {
          if (imageInfo.insertAfterBlock !== undefined) {
            const insertPosition = imageInfo.insertAfterBlock + 1;
            console.log(
              `Вставляем изображение после блока ${imageInfo.insertAfterBlock}, точка вставки: ${insertPosition}`
            );

            // Логируем блок, после которого вставляем
            if (imageInfo.insertAfterBlock < newBlocks.length) {
              const block = newBlocks[imageInfo.insertAfterBlock];
              if (block.content && block.content.length) {
                const blockText = block.content
                  .map((item: any) => item.text || '')
                  .join(' ');
                console.log(
                  `Блок перед вставкой: "${blockText.substring(0, 50)}..."`
                );
              } else {
                console.log(
                  `Блок перед вставкой: тип ${block.type}, без текста`
                );
              }
            }

            newBlocks.splice(insertPosition, 0, imageInfo.imageBlock);
          } else {
            // Если не нашли точку вставки, добавляем изображение в конец
            console.log(
              'Не найдена точка вставки, добавляем изображение в конец документа'
            );
            newBlocks.push(imageInfo.imageBlock);
          }
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
        tables: Array<{ html: string; position: number }>
      ) => {
        if (!tables || !tables.length) return blocks;

        // Клонируем блоки для работы
        const newBlocks = [...blocks];
        console.log('Начинаем вставку таблиц, всего таблиц:', tables.length);

        // Детальный лог существующих блоков
        console.log('АНАЛИЗ СУЩЕСТВУЮЩИХ БЛОКОВ:');
        newBlocks.forEach((block, idx) => {
          if (block.content && block.content.length) {
            const text = block.content
              .map((item: any) => item.text || '')
              .join(' ');
            console.log(
              `Блок [${idx}], тип: ${block.type}, текст: "${text.substring(0, 50)}..."`
            );
          } else {
            console.log(`Блок [${idx}], тип: ${block.type}, без текста`);
          }
        });

        // Сортируем таблицы по их позициям
        const sortedTables = [...tables].sort(
          (a, b) => a.position - b.position
        );
        console.log(
          'Отсортированные таблицы по позиции:',
          sortedTables.map((t) => t.position)
        );

        // Создаем массив таблиц готовых к вставке
        const tablesToInsert: Array<{
          blocks: any[];
          position: number;
          insertAfterBlock?: number;
        }> = [];

        // Сначала преобразуем все таблицы в блоки
        for (const tableData of sortedTables) {
          try {
            const table = tableData.html;

            // Проверяем, что таблица валидная
            if (!table || table.trim() === '') {
              console.warn('Пустая таблица, пропускаем');
              continue;
            }

            // Создаем таблицу
            let tableBlocks: any[] = [];

            if (typeof editor.tryParseHTMLToBlocks === 'function') {
              try {
                console.log('Парсим таблицу в позиции:', tableData.position);
                tableBlocks = await editor.tryParseHTMLToBlocks(table);
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

            console.log(
              `Создано ${tableBlocks.length} блоков для таблицы в позиции ${tableData.position}`
            );

            // Добавляем таблицу в список для вставки
            tablesToInsert.push({
              blocks: tableBlocks,
              position: tableData.position,
            });
          } catch (error) {
            console.error('Ошибка при обработке таблицы:', error);
          }
        }

        // После преобразования всех таблиц, находим точки вставки
        if (tablesToInsert.length > 0) {
          console.log(
            'Определяем точки вставки таблиц на основе их позиций в исходном тексте'
          );

          // Для более точного расположения таблиц будем использовать содержимое блоков и исходного текста
          // Создадим карту соответствия исходного текста и блоков в редакторе

          // Подготовим массив блоков с их текстом для поиска
          const blockTexts: Array<{
            blockIndex: number;
            text: string;
            startPos: number; // Примерная начальная позиция текста этого блока в исходном тексте
            endPos: number; // Примерная конечная позиция текста этого блока в исходном тексте
          }> = [];

          let currentPosition = 0;

          // Извлекаем текст из каждого блока и оцениваем его позицию в исходном тексте
          for (let i = 0; i < newBlocks.length; i++) {
            const block = newBlocks[i];
            let blockText = '';

            if (block.content && block.content.length) {
              blockText = block.content
                .map((item: any) => item.text || '')
                .join(' ');
            }

            // Пропускаем пустые блоки и нетекстовые блоки
            if (blockText.length === 0 && block.type !== 'paragraph') {
              continue;
            }

            // Находим этот текст в исходном тексте
            const originalText = text as string;
            const textPosition = originalText.indexOf(
              blockText,
              currentPosition
            );

            if (textPosition !== -1) {
              // Текст блока найден в исходном тексте
              blockTexts.push({
                blockIndex: i,
                text: blockText,
                startPos: textPosition,
                endPos: textPosition + blockText.length,
              });

              // Обновляем текущую позицию поиска, чтобы избежать повторного нахождения того же текста
              currentPosition = textPosition + blockText.length;

              console.log(
                `Блок [${i}] найден в исходном тексте на позиции ${textPosition}`
              );
            } else {
              // Если точное совпадение не найдено, используем приблизительную оценку
              blockTexts.push({
                blockIndex: i,
                text: blockText,
                startPos: currentPosition,
                endPos: currentPosition + blockText.length,
              });

              currentPosition += blockText.length;

              console.log(
                `Блок [${i}] не найден точно, приблизительная позиция: ${currentPosition}`
              );
            }
          }

          console.log('Блоки с их позициями:', blockTexts);

          // Для каждой таблицы находим наиболее подходящий блок для вставки
          for (const tableInfo of tablesToInsert) {
            let bestBlockIndex = -1;

            // Ищем блок, который находится перед позицией таблицы
            for (let i = 0; i < blockTexts.length; i++) {
              const blockInfo = blockTexts[i];

              // Если блок заканчивается до начала таблицы
              if (blockInfo.endPos <= tableInfo.position) {
                bestBlockIndex = blockInfo.blockIndex;
              } else if (blockInfo.startPos > tableInfo.position) {
                // Если мы нашли блок, который начинается после таблицы,
                // то таблица должна идти перед этим блоком
                if (i > 0) {
                  bestBlockIndex = blockTexts[i - 1].blockIndex;
                } else {
                  bestBlockIndex = 0; // В начале документа
                }
                break;
              }
            }

            // Если не нашли подходящий блок, вставим таблицу в конец
            if (bestBlockIndex === -1) {
              bestBlockIndex = newBlocks.length - 1;
            }

            console.log(
              `Для таблицы в позиции ${tableInfo.position} определен блок для вставки: ${bestBlockIndex}`
            );
            tableInfo.insertAfterBlock = bestBlockIndex;
          }

          // Сортируем таблицы для вставки от конца к началу,
          // чтобы не нарушать индексы уже вставленных таблиц
          const sortedForInsertion = [...tablesToInsert].sort(
            (a, b) => (b.insertAfterBlock || 0) - (a.insertAfterBlock || 0)
          );

          // Вставляем таблицы
          for (const tableInfo of sortedForInsertion) {
            if (tableInfo.insertAfterBlock !== undefined) {
              const insertPosition = tableInfo.insertAfterBlock + 1;
              console.log(
                `Вставляем таблицу после блока ${tableInfo.insertAfterBlock}, точка вставки: ${insertPosition}`
              );

              // Логируем блок, после которого вставляем
              if (tableInfo.insertAfterBlock < newBlocks.length) {
                const block = newBlocks[tableInfo.insertAfterBlock];
                if (block.content && block.content.length) {
                  const blockText = block.content
                    .map((item: any) => item.text || '')
                    .join(' ');
                  console.log(
                    `Блок перед вставкой: "${blockText.substring(0, 50)}..."`
                  );
                }
              }

              newBlocks.splice(insertPosition, 0, ...tableInfo.blocks);
            } else {
              // Если не нашли точку вставки, добавляем таблицу в конец
              console.log(
                'Не найдена точка вставки, добавляем таблицу в конец документа'
              );
              newBlocks.push(...tableInfo.blocks);
            }
          }
        }

        return newBlocks;
      };

      // Применяем исправление перед парсингом
      const fixedText = text ? fixMarkdownImages(text as string) : '';
      const fixedSummary = summary ? fixMarkdownImages(summary as string) : '';

      // Извлекаем все изображения из Markdown
      const images = extractImages(fixedText);

      // Извлекаем таблицы из исходного текста
      console.log('Тип text:', typeof text);
      console.log('Значение text существует:', Boolean(text));
      const originalTables = extractHTMLTablesFromOriginal(text as string);

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

      // Безопасная замена блоков в редакторе саммариf
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
        {/* <div className="flex flex-col gap-2">
          <Label>Список источников</Label>
          <SourcesList
            initialSources={sources}
            onChange={(sources) => {
              setSources(sources);
            }}
          />
        </div> */}
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
