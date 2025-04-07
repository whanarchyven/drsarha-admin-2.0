'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { format, parse, addDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ru from 'date-fns/locale/ru';

export function DatePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [displayDate, setDisplayDate] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Format for URL: YYYY-MM-DDT00:00:00Z
  const formatForUrl = (date: Date) => format(date, "yyyy-MM-dd'T'00:00:00'Z'");

  // Format for display: Month Day, Year
  const formatForDisplay = (date: Date) =>
    format(date, 'dd MMMM yyyy', { locale: ru });

  // Format for header: DD.MM.YYYY
  const formatForHeader = (date: Date) => format(date, 'dd.MM.yyyy');

  // Create a memoized function to update URL
  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const urlParams = new URLSearchParams(searchParams.toString());

      // Обновляем или добавляем каждый параметр
      Object.entries(params).forEach(([name, value]) => {
        urlParams.set(name, value);
      });

      return urlParams.toString();
    },
    [searchParams]
  );

  // Initialize the component with the date from URL or current date
  useEffect(() => {
    if (isInitialized) return;

    const startDateParam = searchParams.get('start_date');
    let initialDate: Date;

    if (startDateParam) {
      try {
        // Пытаемся распарсить дату в формате с временной зоной
        initialDate = new Date(startDateParam);
        if (isNaN(initialDate.getTime())) {
          // Если не удалось, пробуем старый формат
          initialDate = parse(startDateParam, 'yyyy-MM-dd', new Date());
        }
      } catch (e) {
        initialDate = new Date();
      }
    } else {
      initialDate = new Date();
    }

    setDate(initialDate);
    setDisplayDate(formatForDisplay(initialDate));
    setIsInitialized(true);
  }, [searchParams, isInitialized]);

  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    setDate(newDate);
    setDisplayDate(formatForDisplay(newDate));

    // Получаем текущие параметры
    const currentStartDate = searchParams.get('start_date');
    const newStartDate = formatForUrl(newDate);

    // Создаем дату для end_date (start_date + 1 день)
    const endDate = addDays(newDate, 0);
    const newEndDate = formatForUrl(endDate);

    // Обновляем URL только если start_date изменился
    if (currentStartDate !== newStartDate) {
      router.push(
        `${pathname}?${createQueryString({
          start_date: newStartDate,
          end_date: newEndDate,
        })}`
      );
    }
  };

  if (!date) return null;

  return (
    <div className="space-y-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-between text-left font-normal border rounded-md px-4 py-2',
              !date && 'text-muted-foreground'
            )}>
            <span>{displayDate}</span>
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            locale={ru}
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
